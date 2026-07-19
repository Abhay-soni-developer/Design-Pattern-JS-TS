import z from "zod";

export const couponValidator = z.object({
  id: z.string().trim().min(4).max(8),
  type: z.enum(["FlatPercentageDiscountStrategy", "FlatDiscountStrategy"]),
  percentage: z.number(),
  limitOnUse: z.number(),
  isActive: z.boolean(),
  usedCount: z.number(),
  params: z.object(),
  strategy: z.null(),
});
