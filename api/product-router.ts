import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { categories, products, reviews, users } from "@db/schema";
import { eq, desc, like, and, sql, gte, lte } from "drizzle-orm";

export const productRouter = createRouter({
  listCategories: publicQuery.query(async () => {
    return getDb().query.categories.findMany({
      orderBy: categories.name,
    });
  }),

  listProducts: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        featured: z.boolean().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional(),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const filters = [];

      if (input?.category) {
        const cat = await db.query.categories.findFirst({
          where: eq(categories.slug, input.category),
        });
        if (cat) {
          filters.push(eq(products.categoryId, cat.id));
        }
      }

      if (input?.search) {
        filters.push(like(products.name, `%${input.search}%`));
      }

      if (input?.minPrice !== undefined) {
        filters.push(gte(products.price, input.minPrice.toString()));
      }
      if (input?.maxPrice !== undefined) {
        filters.push(lte(products.price, input.maxPrice.toString()));
      }

      if (input?.featured) {
        filters.push(eq(products.isFeatured, true));
      }

      const whereClause = filters.length > 0 ? and(...filters) : undefined;

      const items = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          price: products.price,
          comparePrice: products.comparePrice,
          image: products.image,
          images: products.images,
          brand: products.brand,
          volume: products.volume,
          stock: products.stock,
          rating: products.rating,
          reviewCount: products.reviewCount,
          isFeatured: products.isFeatured,
          createdAt: products.createdAt,
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          },
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(whereClause)
        .limit(input?.limit ?? 50)
        .offset(input?.offset ?? 0)
        .orderBy(desc(products.createdAt));

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause);

      return {
        items,
        total: Number(countResult[0]?.count ?? 0),
      };
    }),

  getBySlug: publicQuery
    .input(z.string())
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          price: products.price,
          comparePrice: products.comparePrice,
          image: products.image,
          images: products.images,
          brand: products.brand,
          volume: products.volume,
          stock: products.stock,
          rating: products.rating,
          reviewCount: products.reviewCount,
          isFeatured: products.isFeatured,
          scentNotes: products.scentNotes,
          createdAt: products.createdAt,
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          },
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.slug, input))
        .limit(1);

      const product = results[0];
      if (!product) return null;

      // For reviews, use a standard join to avoid potential relation query issues in MariaDB/Planetscale mode
      const rawReviews = await db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
          user: {
            id: users.id,
            name: users.name,
            avatar: users.avatar,
          }
        })
        .from(reviews)
        .leftJoin(users, eq(reviews.userId, users.id))
        .where(eq(reviews.productId, product.id))
        .limit(10)
        .orderBy(desc(reviews.createdAt));

      return { ...product, reviews: rawReviews };
    }),

  getFeatured: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        comparePrice: products.comparePrice,
        image: products.image,
        brand: products.brand,
        rating: products.rating,
        reviewCount: products.reviewCount,
        isFeatured: products.isFeatured,
        createdAt: products.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.isFeatured, true))
      .limit(6)
      .orderBy(desc(products.createdAt));
  }),
});
