import type { Prisma } from "@prisma/client";
import type { ImageSetDto, OrderDto, OrderItemDto, ProductDto } from "./types";

export type ProductWithImages = Prisma.ProductGetPayload<{
  include: { images: true };
}>;

// Light reference to a product's seller (for marketplace listings).
export interface SellerRef {
  id: string;
  name: string | null;
  storeName: string | null;
  avatarUrl: string | null;
}

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: true };
}>;

export function toProductDto(p: ProductWithImages, seller?: SellerRef | null): ProductDto {
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
    sellerName: seller?.storeName || seller?.name || undefined,
    sellerAvatar: seller?.avatarUrl ?? undefined,
    images: (p.images ?? []).map(
      (img): ImageSetDto => ({
        url: img.url,
        master: img.master ?? undefined,
        large: img.large ?? undefined,
        medium: img.medium ?? undefined,
        thumb: img.thumb ?? undefined,
        tiny: img.tiny ?? undefined,
        size: img.size ?? undefined,
        color: img.color ?? undefined,
        price: img.price ?? undefined,
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