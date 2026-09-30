import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { productSchema } from "@/lib/validation";
import { toProductDto } from "@/lib/serializers";
import { normalizeImageInput } from "@/lib/product-images";
import { json, badRequest, unauthorized, notFound } from "@/lib/http";
import type { Prisma } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return notFound("Product not found");

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
  if (d.currency !== undefined) data.currency = d.currency;
  if (d.brand !== undefined) data.brand = d.brand;
  if (d.sizes !== undefined) data.sizes = d.sizes;
  if (d.colors !== undefined) data.colors = d.colors;
  if (d.stock !== undefined) data.stock = d.stock as Prisma.InputJsonValue;
  if (d.isNew !== undefined) data.isNew = d.isNew;
  if (d.isSale !== undefined) data.isSale = d.isSale;
  if (d.isActive !== undefined) data.isActive = d.isActive;
  if (d.marketplaceEnabled !== undefined) data.marketplaceEnabled = d.marketplaceEnabled;

  let product = await db.product.update({
    where: { id },
    data,
    include: { images: true },
  });

  // Replace the image set if an array was provided.
  if (d.images !== undefined) {
    await db.productImage.deleteMany({ where: { productId: id } });
    await db.productImage.createMany({
      data: d.images.map((img, index) => ({
        ...normalizeImageInput(img),
        productId: id,
        sortOrder: index,
        isPrimary: index === 0,
      })),
    });
    const refreshed = await db.product.findUnique({ where: { id }, include: { images: true } });
    if (refreshed) product = refreshed;
  }

  return json({ product: toProductDto(product) });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return notFound("Product not found");

  await db.product.delete({ where: { id } });
  return json({ ok: true });
}

export const dynamic = "force-dynamic";