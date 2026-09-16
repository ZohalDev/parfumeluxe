import { getDb } from "../api/queries/connection";
import { coupons } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = getDb();
  console.log("Seeding neat standard coupons...");

  const codes = ["WELCOME10", "LUXE20", "VIP50"];
  for (const code of codes) {
    const existing = await db.query.coupons.findFirst({
      where: eq(coupons.code, code),
    });

    if (!existing) {
      await db.insert(coupons).values({
        code,
        discount: code === "WELCOME10" ? "10.00" : code === "LUXE20" ? "20.00" : "50.00",
        discountType: code === "VIP50" ? "fixed" : "percentage",
        minOrder: "0.00",
        maxUses: 1000,
        expiresAt: new Date("2030-12-31T23:59:59Z"),
        isActive: true,
      });
      console.log(`Coupon ${code} seeded successfully!`);
    } else {
      await db
        .update(coupons)
        .set({
          expiresAt: new Date("2030-12-31T23:59:59Z"),
          isActive: true,
        })
        .where(eq(coupons.code, code));
      console.log(`Coupon ${code} updated successfully!`);
    }
  }

  console.log("All coupons seeded!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
