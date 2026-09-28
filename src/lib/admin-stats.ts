import { db } from "./db";
import { EventType } from "@prisma/client";

export interface AdminProductStat {
  productId: string;
  name: string;
  stock: number;
  sold: number;
  revenue: number;
  views: number;
  clicks: number;
}

/** Per-product stock & sales/engagement stats for the admin panel. */
export async function getAdminProductStats(): Promise<AdminProductStat[]> {
  const products = await db.product.findMany({
    select: { id: true, name: true, stock: true },
  });
  const ids = products.map((p) => p.id);

  // Sold quantity + revenue per product (from order items).
  const items = await db.orderItem.groupBy({
    by: ["productId"],
    where: { productId: { in: ids } },
    _sum: { quantity: true, total: true },
  });

  // Views + clicks per product (from analytics events).
  const events = await db.analyticsEvent.groupBy({
    by: ["productId", "type"],
    where: {
      productId: { in: ids },
      type: { in: [EventType.PRODUCT_VIEW, EventType.PRODUCT_CLICK] },
    },
    _count: { _all: true },
  });

  const soldMap = new Map(
    items
      .filter((i) => i.productId)
      .map((i) => [
        i.productId as string,
        { sold: i._sum.quantity ?? 0, revenue: i._sum.total ?? 0 },
      ])
  );

  const viewMap = new Map<string, number>();
  const clickMap = new Map<string, number>();
  for (const e of events) {
    if (!e.productId) continue;
    const count = e._count._all;
    if (e.type === EventType.PRODUCT_VIEW) viewMap.set(e.productId, (viewMap.get(e.productId) ?? 0) + count);
    else if (e.type === EventType.PRODUCT_CLICK) clickMap.set(e.productId, (clickMap.get(e.productId) ?? 0) + count);
  }

  return products.map((p) => {
    const stock = Object.values((p.stock ?? {}) as Record<string, number>).reduce((s, n) => s + n, 0);
    const s = soldMap.get(p.id);
    return {
      productId: p.id,
      name: p.name,
      stock,
      sold: s?.sold ?? 0,
      revenue: s?.revenue ?? 0,
      views: viewMap.get(p.id) ?? 0,
      clicks: clickMap.get(p.id) ?? 0,
    };
  });
}