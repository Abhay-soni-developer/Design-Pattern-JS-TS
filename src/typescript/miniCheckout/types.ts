export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface IUser {
  name: string;
  email: string; // unique
  balance: number;
}

export interface Order {
  id: string;
  customerEmail: string;
  items: CheckoutItem[];
}

export interface IProductCatalog {
  getAll(): Product[];
  getById(id: string): Product | undefined;
}

export interface CheckoutItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface CheckoutResult {
  ownerId: string;
  items: CheckoutItem[];
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  appliedCouponCode?: string;
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

export type FlatPercentageCouponParam = { percentage: number };
export type FlatDiscountCouponParam = { discountAmount: number };

export type CouponParam = {
  FlatPercentageCouponParam: FlatPercentageCouponParam;
  FlatDiscountCouponParam: FlatDiscountCouponParam;
};

export type Coupon = {
  type: DiscountStrategyType;
  code: string;
  limitOnUse: number | null;
  usageCount: number;
  isActive: boolean;
} & (
  | {
      type: "FlatPercentageDiscountStrategy";
      params: FlatPercentageCouponParam;
    }
  | {
      type: "FlatDiscountStrategy";
      params: FlatDiscountCouponParam;
    }
);

export interface ICartRepository {
  addProductToOwnerCart(
    ownerId: string,
    product: Product,
    quantity: number,
  ): void;
  removeProductFromOwnerCart(ownerid: string, productId: string): boolean;
  getOwnerCart(ownerId: string): readonly ICartItem[];
  clearCartByOwnerId(ownerId: string): void;
  getAll(): ICart[];
}

export interface ICouponRepository {
  getByCode(code: string): Coupon | null;
  incrementUsage(id: string): number;
  registerNewCoupon(coupon: Coupon): Coupon;
}

export interface IProductRepository {
  getAll(): Product[];
  getById(id: string): Product | undefined;
}

// using specifation / strategy Pattern for Discount
export interface IDiscountStrategy {
  calculate: DiscountCalculator;
}

export type DiscountStrategyType =
  "FlatDiscountStrategy" | "FlatPercentageDiscountStrategy";

export type DiscountStrategyConstructor<Type extends DiscountStrategyType> =
  new (params: Extract<Coupon, { type: Type }>["params"]) => IDiscountStrategy;

export type DiscountStrategyRegistry = {
  [Type in DiscountStrategyType]: DiscountStrategyConstructor<Type>;
};
