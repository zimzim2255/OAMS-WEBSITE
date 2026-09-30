import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { productSchema } from "@/lib/validation";
import { slugify } from "@/lib/slug";
import { toProductDto } from "@/lib/serializers";
import { normalizeImageInput } from "@/lib/product-images";
import { json, badRequest, unauthorized, forbidden } from "@/lib/http";
import type { Prisma } from "@prisma/client";

// List the current seller's own products.
export async function GET(request: NextRequest) {
  const seller = await requireRole(request, ["SELLER", "ADMIN"]);
  if (!seller) return unauthorized();
  const products = await db.product.findMany({
    where: { sellerId: seller.id },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });
  return json({ products: products.map((p) => toProductDto(p)) });
}

// Create a new marketplace listing (own).
export async function POST(request: NextRequest) {
  const seller = await requireRole(request, ["SELLER", "ADMIN"]);
  if (!seller) return unauthorized();
  if (seller.sellerStatus !== "active") return forbidden("Seller not approved yet");

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid product data");

  const { images, ...rest } = parsed.data;

  let slug = slugify(rest.name);
  const existing = await db.product.findFirst({ where: { sellerId: seller.id, slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const product = await db.product.create({
    data: {
      name: rest.name,
      slug,
      category: rest.category,
      price: rest.price,
      description: rest.description ?? "",
      currency: rest.currency,
      originalPrice: rest.originalPrice,
      brand: rest.brand,
      sizes: rest.sizes,
      colors: rest.colors,
      stock: (rest.stock ?? {}) as Prisma.InputJsonValue,
      isNew: rest.isNew,
      isSale: rest.isSale,
      isActive: rest.isActive,
      marketplaceEnabled: true,
      sellerId: seller.id,
      images: { create: images.map(normalizeImageInput) },
    },
    include: { images: true },
  });

  return json({ product: toProductDto(product) }, 201);
}

export const dynamic = "force-dynamic";