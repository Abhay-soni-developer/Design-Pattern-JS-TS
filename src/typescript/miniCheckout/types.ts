export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface IUser {
  name: string;
  email: string; // unique
  balance: number;
}

export interface Order {
  id: string;
  customerEmail: string;
  items: OrderItem[];
}

export interface IProductCatalog {
  getAll(): Product[];
  getById(id: string): Product | undefined;
}

export interface ICartItem {
  product: Product;
  quantity: number;
}

export interface ICart {
  ownerId: string;
  items: ICartItem[];
}

export interface ICartService {
  addProduct(ownerId: string, product: Product, quantity: number): void;
  removeProduct(ownerId: string, productId: string): boolean;
  getCart(ownerId: string): readonly ICartItem[];
  clear(ownerId: string): void;
}

export type DiscountCalculatorResult = {
  status: "success" | "failure";
  discountAmount: number;
  reason?: string;
};

export type DiscountProcessorResult = DiscountCalculatorResult & {
  originalAmount: number;
  finalAmount: number;
};

export type DiscountCalculator = (amount: number) => DiscountCalculatorResult;

export type Coupon =
  | {
      id: string;
      type: "FlatPercentageDiscountStrategy";
      percentage: number;
      limitOnUse: number;
      isActive: boolean;
      usedCount: number;
      params: { amount: number };
      strategy: null | IDiscountStrategy;
    }
  | {
      id: string;
      type: "FlatDiscountStrategy";
      percentage: number;
      limitOnUse: number;
      isActive: boolean;
      usedCount: number;
      params: { percentage: number };
      strategy: null | IDiscountStrategy;
    };

export interface ICartRepository {
  addProductToOwnerCart(
    ownerId: string,
    product: Product,
    quantity: number,
  ): void;
  removeProductFromOwnerCart(ownerid: string, productId: string): boolean;
  getOwnerCart(ownerId: string): readonly ICartItem[];
  clearCartByOwnderId(ownerId: string): void;
  getAll(): ICart[];
}

export interface ICouponRepository {
  getByCode(code: string): Coupon | undefined;
  incrementUsage(id: string): number;
  registerNewCoupon(coupon: Coupon): Coupon | undefined;
}
export interface IProductRepository {
  getAll(): Product[];
  getById(id: string): Product | undefined;
}

// using specifation / strategy Pattern for Discount
export interface IDiscountStrategy {
  calculate: DiscountCalculator;
}
