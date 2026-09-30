import type { Prisma } from "@prisma/client";

// A single product-image input: either a plain URL string (poster/legacy) or
// an object that can carry the variant (size/color/price) the image shows.
export type ProductImageInput =
  | string
  | { url: string; size?: string; color?: string; price?: number };

/** Normalize a product-image input into a ProductImage-create row. */
export function normalizeImageInput(
  img: ProductImageInput
): Prisma.ProductImageCreateManyInput | Prisma.ProductImageCreateWithoutProductInput {
  if (typeof img === "string") return { url: img };
  return {
    url: img.url,
    size: img.size || undefined,
    color: img.color || undefined,
    price: img.price ?? undefined,
  };
}