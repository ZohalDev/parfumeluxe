import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { cart, products } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const cartRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select({
        id: cart.id,
        quantity: cart.quantity,
        productId: cart.productId,
        createdAt: cart.createdAt,
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          image: products.image,
          stock: products.stock,
        },
      })
      .from(cart)
      .leftJoin(products, eq(cart.productId, products.id))
      .where(eq(cart.userId, ctx.user.id))
      .orderBy(desc(cart.createdAt));
  }),

  add: authedQuery
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1).default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.cart.findFirst({
        where: and(eq(cart.userId, ctx.user.id), eq(cart.productId, input.productId)),
      });

      if (existing) {
        await db
          .update(cart)
          .set({ quantity: existing.quantity + input.quantity })
          .where(eq(cart.id, existing.id));
        return { success: true, updated: true };
      }

      await db.insert(cart).values({
        userId: ctx.user.id,
        productId: input.productId,
        quantity: input.quantity,
      });
      return { success: true, updated: false };
    }),

  update: authedQuery
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const item = await db.query.cart.findFirst({
        where: and(
          eq(cart.productId, input.productId),
          eq(cart.userId, ctx.user.id),
        ),
      });

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart item not found",
        });
      }

      if (input.quantity === 0) {
        await db.delete(cart).where(eq(cart.id, item.id));
      } else {
        await db
          .update(cart)
          .set({ quantity: input.quantity })
          .where(eq(cart.id, item.id));
      }
      return { success: true };
    }),

  remove: authedQuery
    .input(z.number()) // productId
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(cart)
        .where(and(eq(cart.productId, input), eq(cart.userId, ctx.user.id)));
      return { success: true };
    }),

  clear: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db.delete(cart).where(eq(cart.userId, ctx.user.id));
    return { success: true };
  }),

  sync: authedQuery
    .input(
      z.array(
        z.object({
          productId: z.number(),
          quantity: z.number().min(1),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(cart).where(eq(cart.userId, ctx.user.id));
      if (input.length > 0) {
        await db.insert(cart).values(
          input.map((item) => ({
            userId: ctx.user.id,
            productId: item.productId,
            quantity: item.quantity,
          }))
        );
      }
      return { success: true };
    }),
});
