import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, products, orders, reviews, orderItems, coupons, categories } from "@db/schema";
import { eq, sql, desc, like, or } from "drizzle-orm";
import { paginationInput } from "./lib/pagination";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy",
  },
});

export const adminRouter = createRouter({
  dashboard: adminQuery.query(async () => {
    const db = getDb();

    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [productCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products);

    const [orderCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);

    const [revenueResult] = await db
      .select({ sum: sql<string>`coalesce(sum(total), 0)` })
      .from(orders)
      .where(eq(orders.status, "delivered"));

    const [reviewCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviews);

    const recentOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
        user: {
          name: users.name,
          email: users.email,
        },
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    const lowStock = await db.query.products.findMany({
      where: sql`${products.stock} <= 20`,
      limit: 10,
    });

    return {
      stats: {
        users: userCount?.count ?? 0,
        products: productCount?.count ?? 0,
        orders: orderCount?.count ?? 0,
        revenue: Number(revenueResult?.sum ?? 0),
        reviews: reviewCount?.count ?? 0,
      },
      recentOrders,
      lowStock,
    };
  }),

  users: adminQuery
    .input(
      paginationInput.extend({
        search: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const whereClause = input.search
        ? or(
            like(users.name, `%${input.search}%`),
            like(users.email, `%${input.search}%`),
          )
        : undefined;
      const items = await getDb().query.users.findMany({
        where: whereClause,
        orderBy: [desc(users.createdAt)],
        limit: input.limit,
        offset: input.offset,
      });
      const [totalRes] = await getDb()
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(whereClause);
      return { items, total: totalRes?.count ?? 0 };
    }),

  updateUserRole: adminQuery
    .input(
      z.object({
        id: z.number(),
        role: z.enum(["user", "admin"]),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.id));
      return { success: true };
    }),

  products: adminQuery
    .input(
      paginationInput.extend({
        search: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const whereClause = input.search
        ? or(
            like(products.name, `%${input.search}%`),
            like(products.brand, `%${input.search}%`),
          )
        : undefined;
      const items = await getDb()
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          comparePrice: products.comparePrice,
          categoryId: products.categoryId,
          scentNotes: products.scentNotes,
          volume: products.volume,
          description: products.description,
          image: products.image,
          stock: products.stock,
          isFeatured: products.isFeatured,
          isActive: products.isActive,
          brand: products.brand,
          createdAt: products.createdAt,
          category: {
            name: categories.name,
          },
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(whereClause)
        .orderBy(desc(products.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      const [totalRes] = await getDb()
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause);
      return { items, total: totalRes?.count ?? 0 };
    }),

  createProduct: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        price: z.number().positive(),
        comparePrice: z.number().positive().optional(),
        image: z.string().optional(),
        categoryId: z.number().optional(),
        brand: z.string().optional(),
        scentNotes: z.string().optional(),
        volume: z.string().default("100ml"),
        stock: z.number().default(0),
        isFeatured: z.boolean().default(false),
        isActive: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(products).values({
        ...input,
        price: input.price.toFixed(2),
        comparePrice: input.comparePrice?.toFixed(2),
      });
      return { success: true };
    }),

  updateProduct: adminQuery
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().optional(),
          price: z.number().positive().optional(),
          comparePrice: z.number().positive().optional(),
          image: z.string().optional(),
          categoryId: z.number().optional(),
          brand: z.string().optional(),
          scentNotes: z.string().optional(),
          volume: z.string().optional(),
          stock: z.number().optional(),
          isFeatured: z.boolean().optional(),
          isActive: z.boolean().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updateData: Record<string, unknown> = { ...input.data };
      if (input.data.price !== undefined) {
        updateData.price = input.data.price.toFixed(2);
      }
      if (input.data.comparePrice !== undefined) {
        updateData.comparePrice = input.data.comparePrice?.toFixed(2);
      }
      await db
        .update(products)
        .set(updateData)
        .where(eq(products.id, input.id));
      return { success: true };
    }),

  deleteProduct: adminQuery
    .input(z.number())
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input));
      return { success: true };
    }),

  analytics: adminQuery.query(async () => {
    const db = getDb();

    // Daily revenue for last 30 days
    const dailyRevenue = await db
      .select({
        date: sql<string>`DATE(${orders.createdAt})`,
        revenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(sql`${orders.createdAt} >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`)
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`);

    // Top 5 selling products
    const topProducts = await db
      .select({
        productName: orderItems.productName,
        productImage: orderItems.productImage,
        totalSold: sql<number>`SUM(${orderItems.quantity})`,
        totalRevenue: sql<string>`SUM(${orderItems.price} * ${orderItems.quantity})`,
      })
      .from(orderItems)
      .groupBy(orderItems.productName, orderItems.productImage)
      .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
      .limit(5);

    // Order status breakdown
    const statusBreakdown = await db
      .select({
        status: orders.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .groupBy(orders.status);

    return {
      dailyRevenue: dailyRevenue.map((d) => ({
        date: d.date,
        revenue: Number(d.revenue),
        orders: d.count,
      })),
      topProducts: topProducts.map((p) => ({
        name: p.productName,
        image: p.productImage,
        sold: Number(p.totalSold),
        revenue: Number(p.totalRevenue),
      })),
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s.status,
        count: s.count,
      })),
    };
  }),

  getPresignedUrl: adminQuery
    .input(z.object({ filename: z.string(), contentType: z.string() }))
    .mutation(async ({ input }) => {
      const extension = input.filename.split('.').pop() || 'jpg';
      const key = `products/${crypto.randomBytes(16).toString('hex')}.${extension}`;
      
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || "parfumeluxe-assets",
        Key: key,
        ContentType: input.contentType,
      });

      const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      
      const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME || "parfumeluxe-assets"}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;

      return { presignedUrl, publicUrl };
    }),

  listCoupons: adminQuery
    .input(paginationInput.extend({ search: z.string().optional() }))
    .query(async ({ input }) => {
      const db = getDb();
      const whereClause = input.search
        ? like(coupons.code, `%${input.search}%`)
        : undefined;
      const items = await db.query.coupons.findMany({
        where: whereClause,
        orderBy: [desc(coupons.createdAt)],
        limit: input.limit,
        offset: input.offset,
      });
      const [totalRes] = await db
        .select({ count: sql<number>`count(*)` })
        .from(coupons)
        .where(whereClause);
      return { items, total: totalRes?.count ?? 0 };
    }),

  createCoupon: adminQuery
    .input(
      z.object({
        code: z.string().min(1),
        discount: z.number().min(0),
        discountType: z.enum(["percentage", "fixed"]),
        minOrder: z.number().optional(),
        maxUses: z.number().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(coupons).values({
        code: input.code.toUpperCase(),
        discount: input.discount.toString(),
        discountType: input.discountType,
        minOrder: input.minOrder ? input.minOrder.toString() : "0",
        maxUses: input.maxUses || null,
        isActive: input.isActive,
      });
      return { success: true };
    }),

  updateCoupon: adminQuery
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          code: z.string().min(1).optional(),
          discount: z.number().min(0).optional(),
          discountType: z.enum(["percentage", "fixed"]).optional(),
          minOrder: z.number().optional(),
          maxUses: z.number().optional().nullable(),
          isActive: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updateData: Record<string, any> = { ...input.data };
      if (updateData.discount !== undefined) {
        updateData.discount = updateData.discount.toString();
      }
      if (updateData.minOrder !== undefined) {
        updateData.minOrder = updateData.minOrder.toString();
      }
      if (updateData.code !== undefined) {
        updateData.code = updateData.code.toUpperCase();
      }
      if (Object.keys(updateData).length > 0) {
        await db.update(coupons).set(updateData).where(eq(coupons.id, input.id));
      }
      return { success: true };
    }),

  deleteCoupon: adminQuery
    .input(z.number())
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(coupons).where(eq(coupons.id, input));
      return { success: true };
    }),
});
