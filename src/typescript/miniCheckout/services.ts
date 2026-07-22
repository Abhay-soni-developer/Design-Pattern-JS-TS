import {
  DiscountProcessor,
  DiscountStrategyFactory,
} from "./discountStrategies.js";
import {
  CheckoutResult,
  Coupon,
  DiscountProcessorResult,
  ICart,
  ICartItem,
  ICartRepository,
  ICartService,
  ICouponRepository,
  IProductCatalog,
  IProductRepository,
  Product,
} from "./types.js";
import { normalizeCode } from "./utilities.js";
import {
  CartEmpty,
  CouponDoesNotExist,
  CouponExpired,
  CouponInactive,
  CouponUsageLimitExceeded,
} from "./errors.js";

export class ProductCatalog implements IProductCatalog {
  constructor(private productRepository: IProductRepository) {}

  getAll(): Product[] {
    return this.productRepository.getAll() || [];
  }

  getById(id: string): Product | undefined {
    return this.productRepository.getById(id);
  }
}

export class CartService implements ICartService {
  constructor(private cartRepository: ICartRepository) {}

  addProduct(ownerId: string, product: Product, quantity: number): void {
    if (!(quantity > 0))
      throw new RangeError("quantity should be greater than 1");

    return this.cartRepository.addProductToOwnerCart(
      ownerId,
      product,
      quantity,
    );
  }

  removeProduct(ownerId: string, productId: string): boolean {
    return this.cartRepository.removeProductFromOwnerCart(ownerId, productId);
  }

  getCart(ownerId: string): readonly ICartItem[] {
    return this.cartRepository.getOwnerCart(ownerId);
  }

  clear(ownerId: string): void {
    this.cartRepository.clearCartByOwnerId(ownerId);
  }
}

export class CouponService {
  constructor(private couponRepository: ICouponRepository) {}

  getUsableCoupon(code: string): Coupon {
    const coupon = this.couponRepository.getByCode(normalizeCode(code));

    if (!coupon) throw new CouponDoesNotExist();

    if (coupon.limitOnUse !== null && coupon.limitOnUse <= coupon.usageCount) {
      throw new CouponUsageLimitExceeded();
    }

    if (!coupon.isActive) {
      throw new CouponInactive();
    }

    return coupon;
  }

  // private static fillStrategy(coupon: Coupon): Coupon {
  //   return {
  //     ...coupon,
  //     strategy: DiscountStrategyFactory.create(coupon.type, coupon.params),
  //   };
  // }

  incrementUsage(code: string): number {
    return this.couponRepository.incrementUsage(normalizeCode(code));
  }

  addCoupon(coupon: Coupon) {
    this.couponRepository.registerNewCoupon({
      ...coupon,
      code: normalizeCode(coupon.code),
    });
  }
}

export class OrderCheckoutService {
  constructor(
    private cartService: CartService,
    private couponService: CouponService,
  ) {}

  checkout(ownerId: string, couponCode?: string): CheckoutResult {
    let checkoutResult: CheckoutResult;

    const cart = this.cartService.getCart(ownerId);
    if (cart.length === 0) throw new CartEmpty();

    const grandTotal = cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );

    const items = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      unitPrice: item.product.price,
      quantity: item.quantity,
      totalPrice: item.product.price * item.quantity,
    }));

    checkoutResult = {
      ownerId,
      items,
      subtotal: grandTotal,
      discountAmount: 0,
      finalAmount: grandTotal,
    };

    // "nodiscount helps in handling case where no coupon is applied"
    if (couponCode) {
      const normalizedCouponCode = normalizeCode(couponCode);
      let coupon: Coupon =
        this.couponService.getUsableCoupon(normalizedCouponCode);

      const invoiceData = DiscountProcessor.process(coupon, grandTotal);

      this.couponService.incrementUsage(normalizedCouponCode);

      checkoutResult = {
        ownerId,
        items,
        subtotal: invoiceData.originalAmount,
        discountAmount: invoiceData.discountAmount,
        finalAmount: invoiceData.finalAmount,
        appliedCouponCode: couponCode,
      };
    }

    this.cartService.clear(ownerId);
    return checkoutResult;
  }
}
