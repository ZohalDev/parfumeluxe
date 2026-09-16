import { getDb } from '../api/queries/connection.js';
import { products } from '../db/schema.js';
import { eq, and, gte, sql } from 'drizzle-orm';

async function main() {
  const db = getDb();
  
  try {
    await db.transaction(async (tx) => {
      const updated = await tx
        .update(products)
        .set({
          stock: sql`${products.stock} - 1`,
        })
        .where(
          and(
            eq(products.id, 1),
            gte(products.stock, 1),
          ),
        );
      
      console.log('updated return value:', updated);
      console.log('typeof updated:', typeof updated);
      console.log('JSON stringified updated:', JSON.stringify(updated));
      console.log('rowsAffected:', updated.rowsAffected);
      console.log('affectedRows:', updated.affectedRows);
      
      // Rollback so we don't actually modify it
      tx.rollback();
    });
  } catch (err) {
    if (err.message === 'Rollback') {
      console.log('Rollback successful');
    } else {
      console.error('Error during transaction:', err);
    }
  }
}

main();
