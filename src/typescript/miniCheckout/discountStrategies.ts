import {
  Coupon,
  CouponParam,
  DiscountCalculatorResult,
  DiscountProcessorResult,
  FlatDiscountCouponParam,
  FlatPercentageCouponParam,
  IDiscountStrategy,
  Product,
} from "./types.js";

export class NoDiscountStrategy implements IDiscountStrategy {
  constructor() {}

  public calculate(amount: number): DiscountCalculatorResult {
    return {
      discountAmount: 0,
      status: "success",
    };
  }
}

export class FlatDiscountStrategy implements IDiscountStrategy {
  maxDiscount: number;

  constructor(params: FlatDiscountCouponParam) {
    this.maxDiscount = params.amount;

    if (Number.isFinite(this.maxDiscount)) {
      throw new RangeError("only finite and greater than 0 allowed");
    }
  }

  public calculate(amount: number): DiscountCalculatorResult {
    return {
      discountAmount: amount > this.maxDiscount ? this.maxDiscount : amount,
      status: "success",
    };
  }
}

export class FlatPercentageDiscountStrategy implements IDiscountStrategy {
  private readonly percentage: number;

  // constructor paramter properties
  constructor(params: FlatPercentageCouponParam) {
    this.percentage = params.percentage;
    if (this.percentage < 0 || this.percentage > 100) {
      throw new RangeError("Percentage must be between 0 and 100");
    }
  }

  public calculate(val: number): DiscountCalculatorResult {
    const discountAmount = (val / 100) * this.percentage;

    return {
      discountAmount,
      status: "success",
    };
  }
}

type DiscountStrategyType =
  | "FlatDiscountStrategy"
  | "FlatPercentageDiscountStrategy"
  | "NoDiscountStrategy";

type DiscountStrategyConstructor<Type extends DiscountStrategyType> = new (
  params: Extract<Coupon, { type: Type }>["params"],
) => IDiscountStrategy;

type DiscountStrategyRegistry = {
  [Type in DiscountStrategyType]: DiscountStrategyConstructor<Type>;
};

const discountStrategyRegistry = {
  FlatDiscountStrategy,
  FlatPercentageDiscountStrategy,
  NoDiscountStrategy,
} satisfies DiscountStrategyRegistry;

export class DiscountStrategyFactory {
  private constructor() {
    throw new Error("this class can not be initiated.");
  }

  static create<Type extends DiscountStrategyType>(
    className: Type,
    params: Extract<Coupon, { type: Type }>["params"],
  ) {
    const Strategy = discountStrategyRegistry[
      className
    ] as DiscountStrategyConstructor<Type>;
    if (!Strategy) throw new Error("invalid className");
    return new Strategy(params);
  }
}

export class DiscountProcessor {
  static process(
    strategy: IDiscountStrategy,
    amount: number,
  ): DiscountProcessorResult {
    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }
    const discount = strategy.calculate(amount);

    return {
      originalAmount: amount,
      finalAmount: amount - discount.discountAmount,
      ...discount,
    };
  }
}
