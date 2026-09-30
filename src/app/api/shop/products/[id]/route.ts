import { db } from "@/lib/db";
import { toProductDto } from "@/lib/serializers";
import { json, notFound } from "@/lib/http";

// Public storefront: single active product.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await db.product.findFirst({
    where: { id, isActive: true },
    include: {
      images: true,
      seller: { select: { id: true, name: true, storeName: true, avatarUrl: true } },
    },
  });

  if (!product) return notFound("Product not found");

  return json({ product: toProductDto(product, product.seller) });
}

export const dynamic = "force-dynamic";