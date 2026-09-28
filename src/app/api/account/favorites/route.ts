import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth/guard";
import { toProductDto } from "@/lib/serializers";
import { json, badRequest, unauthorized, notFound } from "@/lib/http";

// List the current user's favourite products.
export async function GET(request: NextRequest) {
  const user = await currentUser(request);
  if (!user) return unauthorized();

  const rows = await db.favorite.findMany({
    where: { userId: user.id },
    include: { product: { include: { images: true } } },
    orderBy: { createdAt: "desc" },
  });

  return json({ favorites: rows.map((r) => toProductDto(r.product)) });
}

// Add a product to the user's favourites.
export async function POST(request: NextRequest) {
  const user = await currentUser(request);
  if (!user) return unauthorized();

  const body = (await request.json().catch(() => null)) as { productId?: unknown } | null;
  const productId = typeof body?.productId === "string" ? body.productId : null;
  if (!productId) return badRequest("productId is required");

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return notFound("Product not found");

  await db.favorite.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    create: { userId: user.id, productId },
    update: {},
  });

  return json({ ok: true }, 201);
}

export const dynamic = "force-dynamic";