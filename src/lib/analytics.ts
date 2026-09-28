import { db } from "./db";
import { EventType, Prisma } from "@prisma/client";

export interface IngestEvent {
  type: EventType;
  productId?: string;
  sessionId?: string;
  page?: string;
  referrer?: string;
  userAgent?: string;
  device?: string;
  ip?: string;
  meta?: Record<string, unknown>;
}

export interface ProductStat {
  productId: string;
  name: string;
  clicks: number;
  views: number;
  addToCarts: number;
  sales: number;
  revenue: number;
}

export interface SellerSummary {
  totalClicks: number;
  totalViews: number;
  totalAddToCarts: number;
  totalSales: number;
  totalRevenue: number;
  products: ProductStat[];
}

/** Fire-and-forget safe; never throws into the caller. */
export async function recordEvent(e: IngestEvent): Promise<void> {
  try {
    const data: Prisma.AnalyticsEventUncheckedCreateInput = {
      type: e.type,
      productId: e.productId ?? null,
      sessionId: e.sessionId ?? null,
      page: e.page ?? null,
      referrer: e.referrer ?? null,
      userAgent: e.userAgent ?? null,
      device: e.device ?? null,
      ip: e.ip ?? null,
      meta: e.meta as Prisma.InputJsonValue | undefined,
    };
    await db.analyticsEvent.create({ data });
  } catch {
    // analytics must never break the shop
  }
}

/**
 * Aggregate analytics for one seller's marketplace products.
 * `clicks` = LISTING_CLICK + PRODUCT_CLICK on their products;
 * `views` = LISTING_VIEW + PRODUCT_VIEW.
 */
export async function summarizeForSeller(sellerId: string): Promise<SellerSummary> {
  const products = await db.product.findMany({
    where: { sellerId },
    select: { id: true, name: true },
  });

  const productIds = products.map((p) => p.id);
  const base = {
    totalClicks: 0,
    totalViews: 0,
    totalAddToCarts: 0,
    totalSales: 0,
    totalRevenue: 0,
  };

  const stats: ProductStat[] = await Promise.all(
    productIds.map(async (id) => {
      const [clicks, views, addToCarts, soldItems] = await Promise.all([
        db.analyticsEvent.count({ where: { productId: id, type: { in: [EventType.LISTING_CLICK, EventType.PRODUCT_CLICK] } } }),
        db.analyticsEvent.count({ where: { productId: id, type: { in: [EventType.LISTING_VIEW, EventType.PRODUCT_VIEW] } } }),
        db.analyticsEvent.count({ where: { productId: id, type: EventType.ADD_TO_CART } }),
        db.orderItem.findMany({ where: { productId: id, sellerId }, select: { quantity: true, total: true } }),
      ]);
      const sales = soldItems.reduce((s, i) => s + i.quantity, 0);
      const revenue = soldItems.reduce((s, i) => s + i.total, 0);
      return {
        productId: id,
        name: products.find((p) => p.id === id)?.name ?? "Unknown",
        clicks,
        views,
        addToCarts,
        sales,
        revenue,
      };
    })
  );

  const totals = stats.reduce(
    (acc, s) => ({
      totalClicks: acc.totalClicks + s.clicks,
      totalViews: acc.totalViews + s.views,
      totalAddToCarts: acc.totalAddToCarts + s.addToCarts,
      totalSales: acc.totalSales + s.sales,
      totalRevenue: acc.totalRevenue + s.revenue,
    }),
    base
  );

  return { ...totals, products: stats };
}