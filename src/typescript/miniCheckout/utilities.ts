import { z } from "zod";
import { Coupon } from "./types.js";

const couponBaseSchema = z.object({
  code: z.string().trim().min(4).max(20),
  isActive: z.boolean(),
  usedCount: z.number().int().nonnegative(),
  strategy: z.null().optional(),
});

const flatDiscountCouponSchema = couponBaseSchema.extend({
  type: z.literal("FlatDiscountStrategy"),
  limitOnUse: z.number().int().positive().nullable(),
  params: z.object({
    amount: z.number().positive(),
  }),
});

const percentageDiscountCouponSchema = couponBaseSchema.extend({
  type: z.literal("FlatPercentageDiscountStrategy"),
  limitOnUse: z.number().int().positive().nullable(),
  params: z.object({
    percentage: z.number().min(0).max(100),
  }),
});

export const couponValidator = z.discriminatedUnion("type", [
  flatDiscountCouponSchema,
  percentageDiscountCouponSchema,
]);

export function normalizeCode(code: string): string {
  return code.trim().toLowerCase();
}
