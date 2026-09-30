import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { productSchema } from "@/lib/validation";
import { slugify } from "@/lib/slug";
import { toProductDto } from "@/lib/serializers";
import { normalizeImageInput } from "@/lib/product-images";
import { json, badRequest, unauthorized, forbidden } from "@/lib/http";
import type { Prisma } from "@prisma/client";

// List products (admin) with search, category filter and pagination.
export async function GET(request: NextRequest) {
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim() ?? "";
  const category = url.searchParams.get("category")?.trim() ?? "all";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));

  const where: Prisma.ProductWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category && category !== "all") {
    where.category = category;
  }

  const [products, total, categoryRows] = await Promise.all([
    db.product.findMany({
      where,
      include: { images: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
    db.product.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  return json({
    products: products.map((p) => toProductDto(p)),
    total,
    page,
    pageSize,
    categories: categoryRows.map((c) => c.category),
  });
}

// Create a new official product (admin).
export async function POST(request: NextRequest) {
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return forbidden();

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid product data");

  const { images, ...rest } = parsed.data;

  let slug = slugify(rest.name);
  const existing = await db.product.findFirst({ where: { slug } });
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
      marketplaceEnabled: rest.marketplaceEnabled,
      sellerId: null,
      images: { create: images.map(normalizeImageInput) },
    },
    include: { images: true },
  });

  return json({ product: toProductDto(product) }, 201);
}

export const dynamic = "force-dynamic";