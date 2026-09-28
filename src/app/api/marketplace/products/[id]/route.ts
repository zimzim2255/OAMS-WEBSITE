import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { productSchema } from "@/lib/validation";
import { toProductDto } from "@/lib/serializers";
import { json, badRequest, unauthorized, notFound, forbidden } from "@/lib/http";
import type { Prisma } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const seller = await requireRole(request, ["SELLER"]);
  if (!seller) return unauthorized();

  const product = await db.product.findUnique({ where: { id } });
  if (!product) return notFound("Product not found");
  if (product.sellerId !== seller.id) return forbidden("Not your product");

  const body = await request.json().catch(() => null);
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) return badRequest("Invalid product data");

  const data: Prisma.ProductUpdateInput = {};
  const d = parsed.data;
  if (d.name !== undefined) data.name = d.name;
  if (d.description !== undefined) data.description = d.description;
  if (d.category !== undefined) data.category = d.category;
  if (d.price !== undefined) data.price = d.price;
  if (d.originalPrice !== undefined) data.originalPrice = d.originalPrice;
  if (d.sizes !== undefined) data.sizes = d.sizes;
  if (d.colors !== undefined) data.colors = d.colors;
  if (d.stock !== undefined) data.stock = d.stock as Prisma.InputJsonValue;
  if (d.isActive !== undefined) data.isActive = d.isActive;
  if (d.brand !== undefined) data.brand = d.brand;

  let updated = await db.product.update({ where: { id }, data, include: { images: true } });

  if (d.images !== undefined) {
    await db.productImage.deleteMany({ where: { productId: id } });
    await db.productImage.createMany({
      data: d.images.map((url, index) => ({
        url,
        productId: id,
        sortOrder: index,
        isPrimary: index === 0,
      })),
    });
    const refreshed = await db.product.findUnique({ where: { id }, include: { images: true } });
    if (refreshed) updated = refreshed;
  }

  return json({ product: toProductDto(updated) });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const seller = await requireRole(request, ["SELLER"]);
  if (!seller) return unauthorized();

  const product = await db.product.findUnique({ where: { id } });
  if (!product) return notFound("Product not found");
  if (product.sellerId !== seller.id) return forbidden("Not your product");

  await db.product.delete({ where: { id } });
  return json({ ok: true });
}

export const dynamic = "force-dynamic";