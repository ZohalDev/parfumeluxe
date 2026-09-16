import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reviews, products } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const reviewRouter = createRouter({
  listByProduct: publicQuery
    .input(z.number())
    .query(async ({ input }) => {
      return getDb().query.reviews.findMany({
        where: eq(reviews.productId, input),
        with: {
          user: true,
        },
        orderBy: [desc(reviews.createdAt)],
      });
    }),

  create: authedQuery
    .input(
      z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Check if user already reviewed this product
      const existing = await db.query.reviews.findFirst({
        where: and(
          eq(reviews.productId, input.productId),
          eq(reviews.userId, ctx.user.id),
        ),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already reviewed this product",
        });
      }

      await db.insert(reviews).values({
        productId: input.productId,
        userId: ctx.user.id,
        rating: input.rating,
        comment: input.comment,
      });

      // Update product rating
      const productReviews = await db.query.reviews.findMany({
        where: eq(reviews.productId, input.productId),
      });

      const avgRating =
        productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;

      await db
        .update(products)
        .set({
          rating: avgRating.toFixed(1),
          reviewCount: productReviews.length,
        })
        .where(eq(products.id, input.productId));

      return { success: true };
    }),

  // Admin
  adminList: adminQuery.query(async () => {
    return getDb().query.reviews.findMany({
      with: {
        user: true,
        product: true,
      },
      orderBy: [desc(reviews.createdAt)],
      limit: 100,
    });
  }),

  adminDelete: adminQuery
    .input(z.number())
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(reviews).where(eq(reviews.id, input));
      return { success: true };
    }),
});
