export class CartError extends Error {
  constructor() {
    super();
    this.name = new.target.name;
  }
}

export class CartEmpty extends CartError {}

export class CouponError extends Error {
  constructor() {
    super();
    this.name = new.target.name;
  }
}

export class CouponInactive extends CouponError {}
export class CouponAlreadyExist extends CouponError {}
export class CouponDoesNotExist extends CouponError {}
export class CouponUsageLimitExceeded extends CouponError {}
export class CouponExpired extends CouponError {}
