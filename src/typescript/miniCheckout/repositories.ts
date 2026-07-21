import data from "./data.json" with { type: "json" };
import { DiscountStrategyFactory } from "./discountStrategies.js";
import {
  Coupon,
  ICart,
  ICartItem,
  ICartRepository,
  ICouponRepository,
  IProductRepository,
  Product,
} from "./types.js";
import { z } from "zod";
import { couponValidator } from "./utilities.js";

class ProductRepository implements IProductRepository {
  private products: Map<string, Product>;

  constructor(products: Product[]) {
    this.products = new Map<string, Product>(
      products.map((product) => [product.id, product]),
    );
  }

  getAll(): Product[] {
    return Array.from(this.products.values());
  }

  getById(id: string): Product | undefined {
    return this.products.get(id);
  }
}

class CouponRepository implements ICouponRepository {
  private coupons: Map<string, Coupon>;

  constructor(couponsData: Coupon[]) {
    this.coupons = new Map<string, Coupon>(
      couponsData.map((coupon) => {
        return [coupon.code.toLowerCase(), coupon];
      }),
    );
  }

  getByCode(code: string): Coupon | undefined {
    const coupon = this.coupons.get(CouponRepository.normalizeCode(code));
    if (coupon) {
      return { ...coupon };
    }
  }

  incrementUsage(id: string): number {
    const coupon = this.coupons.get(id);
    if (coupon) {
      coupon.usedCount++;
      return coupon.usedCount;
    }
    throw new CouponDoesNotExist();
  }

  registerNewCoupon(coupon: Coupon): Coupon | undefined {
    const validatedCoupon: Coupon = couponValidator.parse(coupon) as Coupon;

    if (this.coupons.has(coupon.code)) throw new CouponAlreadyExist();

    // validate coupon
    if (validatedCoupon) {
      coupon.strategy = null;
      this.coupons.set(
        CouponRepository.normalizeCode(coupon.code),
        validatedCoupon,
      );
      return validatedCoupon;
    }
  }

  private static normalizeCode(code: string): string {
    return code.trim().toLowerCase();
  }
}

class CartRepository implements ICartRepository {
  private carts: Map<string, ICart>;

  constructor(cartsData: ICart[]) {
    this.carts = new Map<string, ICart>(
      cartsData.map((cart) => [cart.ownerId, cart]),
    );
  }

  addProductToOwnerCart(
    ownerId: string,
    product: Product,
    quantity: number,
  ): void {
    if (this.carts.has(ownerId)) {
      let ownerCart = this.carts.get(ownerId)?.items as ICartItem[];
      let item = ownerCart.find((cart) => cart.product.id === product.id);
      if (item) {
        item.quantity = item.quantity + quantity;
      } else {
        ownerCart.push({ product, quantity });
      }
    } else {
      this.carts.set(ownerId, {
        ownerId,
        items: [{ product, quantity }],
      });
    }
  }

  removeProductFromOwnerCart(ownerId: string, productId: string): boolean {
    if (!this.carts.has(ownerId)) return false;
    let ownerCart = this.carts.get(ownerId) as ICart;
    let newCartItemList = ownerCart.items.filter(
      (item) => item.product.id !== productId,
    );

    if (newCartItemList.length === ownerCart.items.length) {
      return false;
    }

    ownerCart.items = newCartItemList;
    return true;
  }

  getOwnerCart(ownerId: string): readonly ICartItem[] {
    if (this.carts.has(ownerId)) return [];
    return (this.carts.get(ownerId) as ICart)?.items ?? [];
  }

  clearCartByOwnerId(ownerId: string): void {
    if (!this.carts.has(ownerId)) return;
    (this.carts.get(ownerId) as ICart).items = [];
  }

  getAll(): ICart[] {
    return Array.from(this.carts.values());
  }
}

const { products: productsData, coupons: couponsData, carts: cartsData } = data;
const productRepo = new ProductRepository(productsData);
const couponRepo = new CouponRepository(couponsData);
const cartRepo = new CartRepository(cartsData);

export { productRepo, couponRepo, cartRepo };

export class CouponAlreadyExist extends Error {}
export class CouponDoesNotExist extends Error {}
export class CouponUsageLimitExceeded extends Error {}
export class CouponExpired extends Error {}
