/**
 * Import the current hardcoded catalogue into the database.
 *
 * Run this ONCE (or repeatedly — it is idempotent) against the production
 * database when deploying to the VPS so every bundled product becomes a real
 * admin-owned row (sellerId = null). After this the storefront reads live from
 * the DB, and the hardcoded `products`/`flashDesigns` arrays are no longer used
 * by the front end.
 *
 *   npx tsx scripts/import-products.ts
 *
 * Requires DATABASE_URL in the environment (.env).
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { products } from "../src/lib/products";
import { flashDesigns } from "../src/lib/flashDesigns";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Every product currently bundled in the front end, in the order it shows.
const catalog = [...products, ...flashDesigns];

async function main() {
  let created = 0;
  let updated = 0;
  let imageCount = 0;

  for (const p of catalog) {
    const slug = `${slugify(p.name)}-${p.id}`;
    const data = {
      slug,
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice ?? null,
      currency: "MAD",
      sizes: p.sizes,
      colors: p.colors,
      stock: p.stock,
      isNew: p.isNew,
      isSale: p.isSale,
      isActive: true,
      marketplaceEnabled: false,
      sellerId: null,
      rating: p.rating ?? 0,
      reviewsCount: p.reviews ?? 0,
    };

    // Look up by slug among admin-owned products (sellerId === null). Postgres
    // treats NULLs as distinct in a UNIQUE index, so we can't rely on the
    // compound-unique constraint — do an explicit find + create/update.
    let record = await db.product.findFirst({ where: { sellerId: null, slug } });
    if (record) {
      record = await db.product.update({ where: { id: record.id }, data });
      updated += 1;
    } else {
      record = await db.product.create({ data });
      created += 1;
    }

    // Rebuild image set (primary / all renditions) deterministically.
    const urls = Array.from(new Set([p.image, ...(p.images ?? [])]));
    await db.productImage.deleteMany({ where: { productId: record.id } });
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      await db.productImage.create({
        data: {
          productId: record.id,
          url,
          master: url,
          large: url,
          medium: url,
          thumb: url,
          tiny: url,
          size: null,
          color: null,
          price: 0,
          isPrimary: i === 0,
          sortOrder: i,
        },
      });
      imageCount += 1;
    }
  }

  console.log(
    `Catalogue import complete: ${created} created, ${updated} updated, ${imageCount} images written.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });