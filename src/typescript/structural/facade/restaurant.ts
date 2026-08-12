interface OrderInput {
  orderId: string;
  restaurantId: string;
  userId: string;
  items: Array<ItemRecord>;
  couponCode?: string;
  amount: number;
}

type ItemRecord = {
  itemId: string;
  quantity: number;
};

type Transaction = {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: string;
};

class Restaurant {
  readonly name: string;
  readonly id: string;
  isOpen: boolean;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.isOpen = false;
  }

  setRestaurantOpen(isOpen: boolean) {
    this.isOpen = isOpen;
  }
}

class Order {
  constructor(
    readonly id: string,
    readonly from: string,
    readonly to: string,
    readonly price: number,
    readonly items: Array<ItemRecord>,
    readonly trx: Transaction,
    readonly restaurantId: string,
    readonly timestamp: string = new Date().toJSON(),
    readonly couponCode?: string,
  ) {}

  toString() {
    return `order with items ${this.items.map((itemRecord) => Object.values(itemRecord).join(":")).join(",")} ordered at ${this.timestamp} by ${this.id} from restaurant ${this.restaurantId} amounting to ${this.price} with discount ${this.couponCode ? this.couponCode : 0} `;
  }

  static createFromOrderInput(orderInput: OrderInput, trx: Transaction) {
    return new Order(
      orderInput.orderId,
      trx.from,
      trx.to,
      orderInput.amount,
      orderInput.items,
      trx,
      orderInput.restaurantId,
      trx.timestamp,
      orderInput.couponCode,
    );
  }
}

class RestaurantService {
  restaurants: Map<string, Restaurant>;

  constructor() {
    this.restaurants = new Map();
  }

  isOpen(restaurantId: string): Promise<boolean> {
    const isOpen = this.restaurants.get(restaurantId)?.isOpen;
    if (isOpen === undefined) throw new RestaurantDoesNotExist();
    console.log(
      `Restaurant with id ${restaurantId} is ${isOpen ? "Opened" : "Closed"}`,
    );
    return Promise.resolve(isOpen);
  }

  addRestaurant(restaurant: Restaurant): void {
    this.restaurants.set(restaurant.id, restaurant);
  }
}

type DiscountType = { unit: "FLAT" | "PERCENTAGE"; num: number };

class CouponService {
  private readonly couponsCode = new Map<string, DiscountType>();

  async validate(couponCode: string): Promise<boolean> {
    if (!this.couponsCode.has(couponCode)) throw new InvalidCoupon();
    return Promise.resolve(true);
  }

  async applyCouponCode(couponCode: string, amount: number): Promise<number> {
    if (await this.validate(couponCode)) {
      const discount = this.couponsCode.get(couponCode) as DiscountType;
      let finalAmount;
      switch (discount.unit) {
        case "FLAT":
          if (amount - discount.num > 0) {
            finalAmount = amount - discount.num;
          } else {
            return Promise.resolve(0);
          }
          break;
        case "PERCENTAGE":
          finalAmount = (amount / 100) * (100 - discount.num);
          break;
        default:
          console.log(`coupon code not applied`);
          return amount;
      }
      console.log(
        `coupon code applied ${couponCode}: final amount is ${finalAmount} from ${amount}`,
      );

      return finalAmount;
    }
    console.log(`coupon code not applied`);
    return amount;
  }

  addCoupon(code: string, discount: DiscountType): void {
    this.couponsCode.set(code, discount);
  }
}

type InventoryRecord = Map<string, number>;

class InventoryService {
  inventory: InventoryRecord;
  private inventoryLock: boolean = false;

  constructor(items: ItemRecord[]) {
    this.inventory = new Map(items.map((item) => [item.itemId, item.quantity]));
  }

  reserve(items: ItemRecord[]): Promise<void> {
    if (this.inventoryLock) throw new InventoryLockAcquired();

    try {
      this.setInventoryLock(true);
      const newInventoryState = new Map(this.inventory);

      for (const item of items) {
        const itemCount = newInventoryState.get(item.itemId);
        if (itemCount === undefined || itemCount - item.quantity < 0)
          throw new InventoryNotAvailable();
        newInventoryState.set(item.itemId, itemCount - item.quantity);
      }

      this.inventory = newInventoryState;

      console.log(
        `${items.map((itemRecord) => Object.values(itemRecord).join(":")).join(",")} are now reserved`,
      );
      return Promise.resolve();
    } catch (error) {
      throw error;
    } finally {
      this.setInventoryLock(false);
    }
  }

  private setInventoryLock(bool: boolean) {
    if (this.inventoryLock === bool) {
      throw new Error(
        `inventoy is already ${this.inventoryLock ? "locked" : "unlocked"}`,
      );
    }

    this.inventoryLock = bool;
  }

  release(items: ItemRecord[]): Promise<void> {
    if (this.inventoryLock) throw new InventoryLockAcquired();

    try {
      this.setInventoryLock(true);
      const newInventoryState = new Map(this.inventory);

      for (const item of items) {
        const itemCount = newInventoryState.get(item.itemId);
        if (itemCount === undefined) throw new InventoryNotAvailable();
        newInventoryState.set(item.itemId, itemCount + item.quantity);
      }

      this.inventory = newInventoryState;
      console.log(
        `${items.map((itemRecord) => Object.values(itemRecord).join(":")).join(",")} are now released`,
      );
      return Promise.resolve();
    } catch (error) {
      throw error;
    } finally {
      this.setInventoryLock(false);
    }
  }
}

class PaymentService {
  private readonly accounts = new Map<string, number>(); //id-->accountBalance
  private readonly trxLedger = new Map<string, Transaction>();

  static createTrxRecord(
    from: string,
    to: string,
    amount: number,
    timestamp: string = new Date().toJSON(),
    id: string = crypto.randomUUID(),
  ): Transaction {
    return {
      id,
      from,
      to,
      amount,
      timestamp,
    };
  }

  addAccount(accountId: string, balance: number): void {
    this.accounts.set(accountId, balance);
  }

  charge(
    senderId: string,
    recieverId: string,
    amount: number,
  ): Promise<string> {
    const userBalance = this.accounts.get(senderId);

    if (userBalance === undefined || this.accounts.has(recieverId) === false) {
      throw new UserPaymentAccountDoesNotExist();
    }

    if (userBalance < amount) {
      throw new InsufficientBalanceError();
    }

    this.accounts.set(senderId, userBalance - amount);
    this.accounts.set(
      recieverId,
      (this.accounts.get(recieverId) as number) + amount,
    );

    const trxRecord = PaymentService.createTrxRecord(
      senderId,
      recieverId,
      amount,
    );

    this.trxLedger.set(trxRecord.id, trxRecord);

    console.log(
      `${amount} debited from account ${senderId} with transaction Id ${trxRecord.id}`,
    );

    return Promise.resolve(trxRecord.id);
  }

  refund(paymentId: string): Promise<string> {
    const trxRecord = this.trxLedger.get(paymentId);

    if (trxRecord === undefined) throw new InvalidTransactionId();
    this.charge(trxRecord.to, trxRecord.from, trxRecord.amount);

    console.log(
      `${trxRecord.amount} refunded from account ${trxRecord.to} to ${trxRecord.from} with transaction Id ${trxRecord.id}`,
    );

    return Promise.resolve(
      "Refund amount ${trxRecord.amount} to ${trxRecord.to}",
    );
  }

  getTransaction(id: string): Transaction {
    const trx = this.trxLedger.get(id);
    if (trx === undefined) throw new InvalidTransactionId();
    return trx;
  }
}

class DeliveryService {
  private static deliveryBoysCount = 5;
  private readonly orderAssigedTo = new Map<string, number>();
  private totalOrders = 0;

  assign(orderId: string): Promise<string> {
    const assignTo = this.totalOrders % DeliveryService.deliveryBoysCount;
    this.totalOrders++;

    if (assignTo >= DeliveryService.deliveryBoysCount) {
      throw new InvalidDeliveryAssignment();
    }

    this.orderAssigedTo.set(orderId, assignTo);

    console.log(
      `order with ${orderId} now successfully assigned to Delievery person with id: ${assignTo}`,
    );

    return Promise.resolve(
      `order ${orderId} assiged to delivery boy with id ${assignTo}`,
    );
  }

  cancelDelivery(orderId: string): true {
    const assignedTo = this.orderAssigedTo.get(orderId);
    if (assignedTo === undefined) {
      throw new DeliveryDoesNotExist();
    }
    this.orderAssigedTo.delete(orderId);
    return true;
  }
}

class OrderService {
  private readonly orders: Order[] = [];

  save(order: Order): Promise<void> {
    this.orders.push(order);
    console.log(`${order.toString()} successfully completed`);
    return Promise.resolve();
  }
}

class NotificationService {
  sendOrderPlaced(orderId: string): Promise<void> {
    console.log(`sms / email placed in queue for ${orderId} successfully`);
    return Promise.resolve();
  }
}

class RestaurantError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = new.target.name;
  }
}

class RestaurantDoesNotExist extends RestaurantError {
  constructor() {
    super("Restaurant Not Found");
  }
}

class RestaurantIsClosed extends RestaurantError {
  constructor() {
    super("Restaurant is Closed");
  }
}

class CouponError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = new.target.name;
  }
}

class InvalidCoupon extends CouponError {
  constructor() {
    super("Invalid coupon");
  }
}

class InventoryError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = new.target.name;
  }
}

class InventoryNotAvailable extends InventoryError {
  constructor() {
    super("Item not available in required quantity");
  }
}

class InventoryLockAcquired extends InventoryError {
  constructor() {
    super("Inventory lock is acquired ! retry after sometime");
  }
}

class ItemLock extends InventoryError {
  constructor() {
    super("Item lock is acquired ! retry after sometime");
  }
}

class UserPaymentAccountError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = new.target.name;
  }
}

class UserPaymentAccountDoesNotExist extends UserPaymentAccountError {
  constructor() {
    super("User paymemt account does not exist");
  }
}

class InsufficientBalanceError extends UserPaymentAccountError {
  constructor() {
    super("User Balance not sufficient to complete the transaction");
  }
}

class InvalidTransactionId extends UserPaymentAccountError {
  constructor() {
    super("Transaction record Invalid");
  }
}

class DeliveryError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = new.target.name;
  }
}

class InvalidDeliveryAssignment extends DeliveryError {
  constructor() {
    super("trying to assign delivery to invalid delivery partner");
  }
}

class DeliveryDoesNotExist extends DeliveryError {
  constructor() {
    super("no delivery exist with this order id");
  }
}

// now here is facade
class OrderFacade {
  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly couponService: CouponService,
    private readonly inventoryService: InventoryService,
    private readonly paymentService: PaymentService,
    private readonly deliveryService: DeliveryService,
    private readonly orderService: OrderService,
    private readonly notificationService: NotificationService,
  ) {}

  public async placeOrder(order: OrderInput) {
    const orderStageTrack = {
      inventoryReserved: false,
      paymentCharged: false,
      deliveryAssigned: false,
      orderSaved: false,
    };
    let trxId;
    try {
      if (await this.restaurantService.isOpen(order.restaurantId)) {
        let chargeAmount = await this.couponService.applyCouponCode(
          order.couponCode || "",
          order.amount,
        );
        // reserve inventory
        await this.inventoryService.reserve(order.items);
        orderStageTrack.inventoryReserved = true;
        // charge payment
        trxId = await this.paymentService.charge(
          order.userId,
          order.restaurantId,
          chargeAmount,
        );
        orderStageTrack.paymentCharged = true;
        // assign to delivery person
        await this.deliveryService.assign(order.orderId);
        orderStageTrack.deliveryAssigned = true;
        // save order
        throw Error();
        await this.orderService.save(
          Order.createFromOrderInput(
            order,
            this.paymentService.getTransaction(trxId),
          ),
        );
        orderStageTrack.orderSaved = true;

        this.notificationService.sendOrderPlaced(order.orderId);
      } else {
        throw new RestaurantIsClosed();
      }
    } catch (error) {
      console.log("\n \nOrder placing failed : Rolling back now ....");

      if (orderStageTrack.deliveryAssigned) {
        await this.deliveryService.cancelDelivery(orderInput.orderId);
        console.log("delievery successfully unassigned");
      }

      if (orderStageTrack.paymentCharged) {
        if (!trxId) return Error("unknown error: transaction id not found");

        await this.paymentService.refund(trxId);
        console.log("payment successfully refund");
      }
    }

    if (orderStageTrack.inventoryReserved) {
      await this.inventoryService.release(orderInput.items);
      console.log("inventory successfully released");
    }
  }
}

function createOrderFacade() {
  const restaurant = new Restaurant("restaurant-101", "Burger Palace");

  const inventoryItems: ItemRecord[] = [
    {
      itemId: "burger-101",
      quantity: 20,
    },
    {
      itemId: "pizza-101",
      quantity: 10,
    },
    {
      itemId: "coke-101",
      quantity: 50,
    },
  ];

  const flatCoupon: DiscountType = {
    unit: "FLAT",
    num: 50,
  };

  const percentageCoupon: DiscountType = {
    unit: "PERCENTAGE",
    num: 10,
  };

  const restaurantService = new RestaurantService();
  const couponService = new CouponService();
  const inventoryService = new InventoryService(inventoryItems);
  const paymentService = new PaymentService();
  const deliveryService = new DeliveryService();
  const orderService = new OrderService();
  const notificationService = new NotificationService();

  couponService.addCoupon("FLAT50", flatCoupon);

  couponService.addCoupon("SAVE10", percentageCoupon);

  paymentService.addAccount("user-101", 2000);

  paymentService.addAccount("restaurant-101", 5000);

  restaurantService.addRestaurant(restaurant);

  restaurant.setRestaurantOpen(true);

  const orderFacade = new OrderFacade(
    restaurantService,
    couponService,
    inventoryService,
    paymentService,
    deliveryService,
    orderService,
    notificationService,
  );

  return orderFacade;
}

const orderInput: OrderInput = {
  orderId: "order-101",
  restaurantId: "restaurant-101",
  userId: "user-101",

  items: [
    {
      itemId: "burger-101",
      quantity: 2,
    },
    {
      itemId: "coke-101",
      quantity: 2,
    },
  ],

  couponCode: "SAVE10",

  amount: 500,
};

const orderFacade = createOrderFacade();
await orderFacade.placeOrder(orderInput);
