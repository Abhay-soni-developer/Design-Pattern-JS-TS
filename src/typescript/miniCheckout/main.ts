import {
  CartRepository,
  cartsData,
  CouponRepository,
  couponsData,
  ProductRepository,
  productsData,
} from "./repositories.js";
import {
  CartService,
  CouponService,
  OrderCheckoutService,
  ProductCatalog,
} from "./services.js";
import { Coupon } from "./types.js";

export function main() {
  const productRepo = new ProductRepository(productsData);
  const couponRepo = new CouponRepository(couponsData as Coupon[]);
  const cartRepo = new CartRepository(cartsData);

  const productCatalog = new ProductCatalog(productRepo);
  const cartService = new CartService(cartRepo);
  const couponService = new CouponService(couponRepo);

  const checkoutService = new OrderCheckoutService(cartService, couponService);

  return {
    productCatalog,
    cartService,
    couponService,
    checkoutService,
  };
}

export function runScenario(name: string, action: () => unknown): void {
  console.log(`\n--- ${name} ---`);

  try {
    const result = action();

    console.dir(result, { depth: null });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`${error.name}: ${error.message}`);
      return;
    }

    console.error("Unknown error:", error);
  }
}

export function runScenariosTests1() {
  const { checkoutService } = main();

  runScenario("Checkout without coupon", () =>
    checkoutService.checkout("user-1"),
  );

  runScenario("Checkout with flat coupon", () =>
    checkoutService.checkout("user-2", "WELCOME500"),
  );

  runScenario("Empty cart", () => checkoutService.checkout("user-3"));

  runScenario("Inactive coupon", () =>
    checkoutService.checkout("user-4", "inactive1000"),
  );

  runScenario("Exhausted coupon", () =>
    checkoutService.checkout("user-5", "exhausted20"),
  );
}

export function runScenariosTests2() {
  runScenario("Inactive coupon", () => {
    const { checkoutService } = main();
    return checkoutService.checkout("user-1", "inactive1000");
  });

  runScenario("Exhausted coupon", () => {
    const { checkoutService } = main();
    return checkoutService.checkout("user-1", "exhausted20");
  });

  runScenario("Unknown coupon", () => {
    const { checkoutService } = main();
    return checkoutService.checkout("user-2", "does-not-exist");
  });

  runScenario("Valid unlimited coupon", () => {
    const { checkoutService } = main();
    return checkoutService.checkout("user-2", "unlimited5");
  });

  runScenario("Valid percentage coupon", () => {
    const { checkoutService } = main();
    return checkoutService.checkout("user-1", "save10");
  });
}
