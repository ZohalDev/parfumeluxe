import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { coupons } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const couponRouter = createRouter({
  validate: publicQuery
    .input(z.string())
    .query(async ({ input }) => {
      const db = getDb();
      const coupon = await db.query.coupons.findFirst({
        where: and(
          eq(coupons.code, input),
          eq(coupons.isActive, true),
        ),
      });

      if (!coupon) {
        return { valid: false, message: "Invalid coupon code" };
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return { valid: false, message: "Coupon has expired" };
      }

      if (coupon.maxUses && (coupon.usedCount ?? 0) >= coupon.maxUses) {
        return { valid: false, message: "Coupon usage limit reached" };
      }

      return {
        valid: true,
        coupon: {
          code: coupon.code,
          discount: Number(coupon.discount),
          discountType: coupon.discountType,
          minOrder: Number(coupon.minOrder),
        },
      };
    }),

  // Admin
  adminList: adminQuery.query(async () => {
    return getDb().query.coupons.findMany({
      orderBy: (coupons, { desc }) => [desc(coupons.createdAt)],
    });
  }),

  adminCreate: adminQuery
    .input(
      z.object({
        code: z.string().min(1),
        discount: z.number().min(0),
        discountType: z.enum(["percentage", "fixed"]),
        minOrder: z.number().default(0),
        maxUses: z.number().optional(),
        expiresAt: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(coupons).values({
        code: input.code.toUpperCase(),
        discount: input.discount.toFixed(2),
        discountType: input.discountType,
        minOrder: input.minOrder.toFixed(2),
        maxUses: input.maxUses,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      });
      return { success: true };
    }),

  adminToggle: adminQuery
    .input(z.number())
    .mutation(async ({ input }) => {
      const db = getDb();
      const coupon = await db.query.coupons.findFirst({
        where: eq(coupons.id, input),
      });
      if (!coupon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Coupon not found",
        });
      }

      await db
        .update(coupons)
        .set({ isActive: !coupon.isActive })
        .where(eq(coupons.id, input));
      return { success: true };
    }),
});
