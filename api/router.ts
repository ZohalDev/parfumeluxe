import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { productRouter } from "./product-router";
import { cartRouter } from "./cart-router";
import { orderRouter } from "./order-router";
import { reviewRouter } from "./review-router";
import { couponRouter } from "./coupon-router";
import { adminRouter } from "./admin-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  product: productRouter,
  cart: cartRouter,
  order: orderRouter,
  review: reviewRouter,
  coupon: couponRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
