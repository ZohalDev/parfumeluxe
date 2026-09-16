import { z } from "zod";
import {
  createRouter,
  authedQuery,
  adminQuery,
  authedRateLimitedMutation,
} from "./middleware";
import { getDb } from "./queries/connection";
import { orders, orderItems, cart, products, coupons, users } from "@db/schema";
import { eq, desc, and, sql, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { paginationInput } from "./lib/pagination";

export const orderRouter = createRouter({
  createPaymentIntent: authedQuery
    .input(
      z.object({
        couponCode: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const cartItems = await db
        .select({
          id: cart.id,
          quantity: cart.quantity,
          product: {
            id: products.id,
            name: products.name,
            price: products.price,
          },
        })
        .from(cart)
        .leftJoin(products, eq(cart.productId, products.id))
        .where(eq(cart.userId, ctx.user.id));

      if (cartItems.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty",
        });
      }

      let total = 0;
      let discount = 0;

      for (const item of cartItems) {
        if (!item.product) continue;
        total += Number(item.product.price) * item.quantity;
      }

      const couponCode = input?.couponCode;
      if (couponCode) {
        const coupon = await db.query.coupons.findFirst({
          where: eq(coupons.code, couponCode),
        });
        if (coupon && coupon.isActive) {
          if (coupon.discountType === "percentage") {
            discount = total * (Number(coupon.discount) / 100);
          } else {
            discount = Number(coupon.discount);
          }
        }
      }

      const subtotal = total - discount;
      const shippingCost = subtotal >= 150 ? 0 : 15;
      const finalTotal = Math.max(0, subtotal + shippingCost);

      // Use a dummy key if env is not provided
      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(finalTotal * 100), // in cents
        currency: "usd",
        automatic_payment_methods: { enabled: true },
      });

      return { clientSecret: paymentIntent.client_secret as string };
    }),

  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const ordersResult = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, ctx.user.id))
      .orderBy(desc(orders.createdAt));

    const items = await Promise.all(
      ordersResult.map(async (order) => {
        const orderItemsResult = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        return { ...order, items: orderItemsResult };
      })
    );
    return items;
  }),

  create: authedRateLimitedMutation
    .input(
      z.object({
        shippingAddress: z.string().min(1),
        paymentMethod: z.string().min(1),
        couponCode: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.transaction(async (tx) => {
        const cartItems = await tx
          .select({
            id: cart.id,
            productId: cart.productId,
            quantity: cart.quantity,
            product: {
              id: products.id,
              name: products.name,
              price: products.price,
              stock: products.stock,
              image: products.image,
            },
          })
          .from(cart)
          .leftJoin(products, eq(cart.productId, products.id))
          .where(eq(cart.userId, ctx.user.id));

        if (cartItems.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cart is empty",
          });
        }

        let total = 0;
        let discount = 0;

        for (const item of cartItems) {
          if (!item.product) {
            continue;
          }
          if (item.product.stock < item.quantity) {
            throw new TRPCError({
              code: "CONFLICT",
              message: `${item.product.name} has insufficient stock`,
            });
          }
          total += Number(item.product.price) * item.quantity;
        }

        if (input.couponCode) {
          const coupon = await tx.query.coupons.findFirst({
            where: eq(coupons.code, input.couponCode),
          });
          if (coupon && coupon.isActive) {
            if (coupon.discountType === "percentage") {
              discount = total * (Number(coupon.discount) / 100);
            } else {
              discount = Number(coupon.discount);
            }
          }
        }

        const finalTotal = Math.max(0, total - discount);
        const [orderResult] = await tx
          .insert(orders)
          .values({
            userId: ctx.user.id,
            status: "pending",
            total: finalTotal.toFixed(2),
            discount: discount.toFixed(2),
            couponCode: input.couponCode || null,
            shippingAddress: input.shippingAddress,
            paymentMethod: input.paymentMethod,
          })
          .$returningId();

        const orderId = orderResult.id;
        for (const item of cartItems) {
          if (!item.product) {
            continue;
          }
          const updated = await tx
            .update(products)
            .set({
              stock: sql`${products.stock} - ${item.quantity}`,
            })
            .where(
              and(
                eq(products.id, item.product.id),
                gte(products.stock, item.quantity),
              ),
            );
          const header = Array.isArray(updated) ? updated[0] : updated;
          const affectedRows =
            (header as { rowsAffected?: number; affectedRows?: number })?.rowsAffected ??
            (header as { affectedRows?: number })?.affectedRows ??
            0;
          if (affectedRows === 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: `${item.product.name} went out of stock`,
            });
          }

          await tx.insert(orderItems).values({
            orderId,
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.image,
            price: item.product.price,
            quantity: item.quantity,
          });
        }

        await tx.delete(cart).where(eq(cart.userId, ctx.user.id));
        return { success: true, orderId };
      });

      try {
        if (ctx.user.email) {
          const resend = require("resend");
          const resendClient = new resend.Resend(process.env.RESEND_API_KEY || "re_dummy");
          await resendClient.emails.send({
            from: "Oud Royale <orders@oudroyale.com>",
            to: [ctx.user.email],
            subject: `Order Confirmation #${result.orderId}`,
            html: `<h1>Thank you for your order!</h1>
                   <p>Hi ${ctx.user.name || "Customer"},</p>
                   <p>Your order <strong>#${result.orderId}</strong> has been received and is now being processed.</p>
                   <p>We will notify you once it ships.</p>
                   <br/>
                   <p>Best regards,<br/>Oud Royale Team</p>`,
          });
        }
      } catch (err) {
        console.error("Failed to send order confirmation email:", err);
      }

      return result;
    }),

  getById: authedQuery
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, input), eq(orders.userId, ctx.user.id)))
        .limit(1);

      const order = results[0];
      if (!order) return null;

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    }),

  // Admin endpoints
  adminList: adminQuery
    .input(
      paginationInput.extend({
        status: z
          .enum(["all", "pending", "processing", "shipped", "delivered", "cancelled"])
          .default("all"),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const whereClause =
        input.status === "all" ? undefined : eq(orders.status, input.status);
      
      const ordersResult = await db
        .select({
          id: orders.id,
          userId: orders.userId,
          status: orders.status,
          total: orders.total,
          discount: orders.discount,
          couponCode: orders.couponCode,
          shippingAddress: orders.shippingAddress,
          paymentMethod: orders.paymentMethod,
          createdAt: orders.createdAt,
          user: {
            name: users.name,
            email: users.email,
          },
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Fetch items for each order separately to avoid complex JSON joins
      const items = await Promise.all(
        ordersResult.map(async (order) => {
          const orderItemsResult = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));
          return { ...order, items: orderItemsResult };
        })
      );

      const [totalRes] = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(whereClause);
        
      return { items, total: Number(totalRes?.count ?? 0) };
    }),

  adminUpdateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(orders)
        .set({ status: input.status })
        .where(eq(orders.id, input.id));
      return { success: true };
    }),

  stats: adminQuery.query(async () => {
    const db = getDb();
    const [totalOrders] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);

    const [totalRevenue] = await db
      .select({ sum: sql<string>`coalesce(sum(total), 0)` })
      .from(orders)
      .where(eq(orders.status, "delivered"));

    const [pendingOrders] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.status, "pending"));

    return {
      totalOrders: totalOrders?.count ?? 0,
      totalRevenue: Number(totalRevenue?.sum ?? 0),
      pendingOrders: pendingOrders?.count ?? 0,
    };
  }),
});
