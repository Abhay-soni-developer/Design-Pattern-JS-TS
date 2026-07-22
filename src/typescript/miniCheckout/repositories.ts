import data from "./data.json" with { type: "json" };
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
import { couponValidator, normalizeCode } from "./utilities.js";
import { CouponAlreadyExist, CouponDoesNotExist } from "./errors.js";

export class ProductRepository implements IProductRepository {
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

export class CouponRepository implements ICouponRepository {
  private coupons: Map<string, Coupon>;

  constructor(couponsData: Coupon[]) {
    this.coupons = new Map<string, Coupon>(
      couponsData.map((coupon) => {
        return [coupon.code.toLowerCase(), coupon];
      }),
    );
  }

  getByCode(code: string): Coupon | null {
    const coupon = this.coupons.get(normalizeCode(code));

    if (coupon) {
      return { ...coupon };
    }

    return null;
  }

  incrementUsage(code: string): number {
    const coupon = this.coupons.get(normalizeCode(code));
    if (coupon) {
      coupon.usageCount++;
      return coupon.usageCount;
    }
    throw new CouponDoesNotExist();
  }

  registerNewCoupon(coupon: Coupon): Coupon {
    const code = normalizeCode(coupon.code);
    if (this.coupons.has(normalizeCode(coupon.code)))
      throw new CouponAlreadyExist();

    const validatedCoupon = couponValidator.parse(coupon) as Coupon;
    validatedCoupon.code = code;

    if (validatedCoupon) {
      this.coupons.set(normalizeCode(validatedCoupon.code), validatedCoupon);
    }

    return validatedCoupon;
  }
}

export class CartRepository implements ICartRepository {
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
    const cart = this.carts.get(ownerId);
    if (cart) {
      return cart.items;
    }
    return [];
  }

  clearCartByOwnerId(ownerId: string): void {
    if (!this.carts.has(ownerId)) return;
    (this.carts.get(ownerId) as ICart).items = [];
  }

  getAll(): ICart[] {
    return Array.from(this.carts.values());
  }
}

export const {
  products: productsData,
  coupons: couponsData,
  carts: cartsData,
} = data as {
  products: Product[];
  coupons: Coupon[];
  carts: ICart[];
};
