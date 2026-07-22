import {
  Coupon,
  CouponParam,
  DiscountCalculatorResult,
  DiscountProcessorResult,
  DiscountStrategyConstructor,
  DiscountStrategyRegistry,
  DiscountStrategyType,
  FlatDiscountCouponParam,
  FlatPercentageCouponParam,
  IDiscountStrategy,
  Product,
} from "./types.js";

export class FlatDiscountStrategy implements IDiscountStrategy {
  maxDiscount: number;

  constructor(params: FlatDiscountCouponParam) {
    this.maxDiscount = params.discountAmount;

    if (!Number.isFinite(this.maxDiscount)) {
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

const discountStrategyRegistry = {
  FlatDiscountStrategy,
  FlatPercentageDiscountStrategy,
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
  static process(coupon: Coupon, amount: number): DiscountProcessorResult {
    const discountStrategy = DiscountStrategyFactory.create(
      coupon.type,
      coupon.params,
    );

    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }
    const discount = discountStrategy.calculate(amount);

    return {
      originalAmount: amount,
      finalAmount: amount - discount.discountAmount,
      ...discount,
    };
  }
}
