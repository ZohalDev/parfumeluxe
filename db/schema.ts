import {
  mysqlTable,
  mysqlEnum,
  varchar,
  text,
  timestamp,
  bigint,
  decimal,
  int,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
    unionId: varchar("unionId", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 320 }).unique(),
    password: text("password"),
    avatar: text("avatar"),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    sessionVersion: int("sessionVersion").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
  },
  (table) => ({
    unionIdIdx: index("unionId_idx").on(table.unionId),
  })
);

export const categories = mysqlTable(
  "categories",
  {
    id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    image: varchar("image", { length: 500 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("slug_idx").on(table.slug),
  })
);

export const products = mysqlTable(
  "products",
  {
    id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    comparePrice: decimal("comparePrice", { precision: 10, scale: 2 }),
    image: varchar("image", { length: 500 }),
    images: text("images"),
    categoryId: bigint("categoryId", { mode: "number", unsigned: true }),
    brand: varchar("brand", { length: 100 }),
    scentNotes: text("scentNotes"),
    volume: varchar("volume", { length: 50 }).default("100ml"),
    stock: int("stock").default(0).notNull(),
    rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
    reviewCount: int("reviewCount").default(0),
    isFeatured: boolean("isFeatured").default(false),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    slugIdx: index("product_slug_idx").on(table.slug),
    categoryIdx: index("category_idx").on(table.categoryId),
    featuredIdx: index("featured_idx").on(table.isFeatured),
  })
);

export const reviews = mysqlTable(
  "reviews",
  {
    id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
    productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    rating: int("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("review_product_idx").on(table.productId),
    userIdx: index("review_user_idx").on(table.userId),
  })
);

export const cart = mysqlTable(
  "cart",
  {
    id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
    quantity: int("quantity").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdx: index("cart_user_idx").on(table.userId),
    productIdx: index("cart_product_idx").on(table.productId),
  })
);

export const orders = mysqlTable(
  "orders",
  {
    id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered", "cancelled"])
      .default("pending")
      .notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    discount: decimal("discount", { precision: 10, scale: 2 }).default("0.00"),
    couponCode: varchar("couponCode", { length: 50 }),
    shippingAddress: text("shippingAddress"),
    paymentMethod: varchar("paymentMethod", { length: 50 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdx: index("order_user_idx").on(table.userId),
    statusIdx: index("order_status_idx").on(table.status),
  })
);

export const orderItems = mysqlTable(
  "order_items",
  {
    id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
    orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull(),
    productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
    productName: varchar("productName", { length: 255 }).notNull(),
    productImage: varchar("productImage", { length: 500 }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    quantity: int("quantity").notNull(),
  },
  (table) => ({
    orderIdx: index("order_item_order_idx").on(table.orderId),
  })
);

export const coupons = mysqlTable(
  "coupons",
  {
    id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    discount: decimal("discount", { precision: 10, scale: 2 }).notNull(),
    discountType: mysqlEnum("discountType", ["percentage", "fixed"]).default("percentage").notNull(),
    minOrder: decimal("minOrder", { precision: 10, scale: 2 }).default("0.00"),
    maxUses: int("maxUses"),
    usedCount: int("usedCount").default(0),
    expiresAt: timestamp("expiresAt"),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    codeIdx: index("code_idx").on(table.code),
  })
); 


export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type CartItem = typeof cart.$inferSelect;
export type InsertCartItem = typeof cart.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;