import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { toProductDto } from "@/lib/serializers";
import { json } from "@/lib/http";
import type { Prisma } from "@prisma/client";

// Public storefront catalog: active products (official + marketplace listings),
// ordered newest first. Supports an optional category filter.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category")?.trim() ?? "";

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (category && category !== "all") {
    where.category = category;
  }

  const products = await db.product.findMany({
    where,
    include: {
      images: true,
      seller: { select: { id: true, name: true, storeName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return json({ products: products.map((p) => toProductDto(p, p.seller)) });
}

export const dynamic = "force-dynamic";