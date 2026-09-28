import type { Prisma } from "@prisma/client";
import type { ImageSetDto, OrderDto, OrderItemDto, ProductDto } from "./types";

export type ProductWithImages = Prisma.ProductGetPayload<{
  include: { images: true };
}>;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: true };
}>;

export function toProductDto(p: ProductWithImages): ProductDto {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    category: p.category,
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    currency: p.currency,
    brand: p.brand ?? undefined,
    sizes: p.sizes,
    colors: p.colors,
    stock: p.stock as Record<string, number>,
    isNew: p.isNew,
    isSale: p.isSale,
    isActive: p.isActive,
    marketplaceEnabled: p.marketplaceEnabled,
    rating: p.rating,
    sellerId: p.sellerId ?? undefined,
    images: (p.images ?? []).map(
      (img): ImageSetDto => ({
        url: img.url,
        master: img.master ?? undefined,
        large: img.large ?? undefined,
        medium: img.medium ?? undefined,
        thumb: img.thumb ?? undefined,
        tiny: img.tiny ?? undefined,
      })
    ),
  };
}

export function toOrderDto(o: OrderWithItems): OrderDto {
  const items: OrderItemDto[] = o.items.map((i) => ({
    productId: i.productId ?? undefined,
    name: i.name,
    price: i.price,
    quantity: i.quantity,
    size: i.size ?? undefined,
    color: i.color ?? undefined,
    total: i.total,
  }));

  return {
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    subtotal: o.subtotal,
    shippingCost: o.shippingCost,
    total: o.total,
    currency: o.currency,
    createdAt: o.createdAt.toISOString(),
    items,
  };
}