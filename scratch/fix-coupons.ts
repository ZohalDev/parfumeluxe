import { getDb } from "../api/queries/connection";
import { coupons } from "../db/schema";
import { sql } from "drizzle-orm";

async function main() {
  const db = getDb();
  console.log("Checking coupons...");
  const list = await db.select().from(coupons);
  console.log("Existing coupons:", list);

  if (list.length === 0) {
    console.log("No coupons found. Creating some active ones!");
    await db.insert(coupons).values([
      {
        code: "WELCOME10",
        discount: "10.00",
        discountType: "percentage",
        minOrder: "0.00",
        maxUses: 1000,
        expiresAt: new Date("2030-12-31T23:59:59Z"),
        isActive: true,
      },
      {
        code: "LUXE20",
        discount: "20.00",
        discountType: "percentage",
        minOrder: "500.00",
        maxUses: 500,
        expiresAt: new Date("2030-12-31T23:59:59Z"),
        isActive: true,
      },
      {
        code: "VIP50",
        discount: "50.00",
        discountType: "fixed",
        minOrder: "1000.00",
        maxUses: 100,
        expiresAt: new Date("2030-12-31T23:59:59Z"),
        isActive: true,
      }
    ]);
    console.log("Active coupons seeded successfully!");
  } else {
    console.log("Updating existing coupons' expiration dates to 2030 so they don't expire...");
    const futureDate = new Date("2030-12-31T23:59:59Z");
    for (const coupon of list) {
      await db
        .update(coupons)
        .set({
          expiresAt: futureDate,
          isActive: true,
        })
        .where(sql`id = ${coupon.id}`);
    }
    console.log("All coupons updated to expire in 2030!");
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
