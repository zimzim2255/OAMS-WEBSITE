import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { json, unauthorized } from "@/lib/http";
import type { OrderItemDto, OrderStatus } from "@/lib/types";

// A seller's sold items: every order that contains one of their products.
// Each returned order only includes that seller's own line items.
export async function GET(request: NextRequest) {
  const seller = await requireRole(request, ["SELLER", "ADMIN"]);
  if (!seller) return unauthorized();

  const rows = await db.orderItem.findMany({
    where: { sellerId: seller.id },
    select: { orderId: true },
    distinct: ["orderId"],
  });
  const orderIds = rows.map((r) => r.orderId);
  if (orderIds.length === 0) return json({ orders: [] });

  const orders = await db.order.findMany({
    where: { id: { in: orderIds } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const dto = orders.map((o): {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    subtotal: number;
    shippingCost: number;
    total: number;
    currency: string;
    createdAt: string;
    trackingNumber?: string;
    items: OrderItemDto[];
  } => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    subtotal: o.subtotal,
    shippingCost: o.shippingCost,
    total: o.total,
    currency: o.currency,
    createdAt: o.createdAt.toISOString(),
    trackingNumber: o.trackingNumber ?? undefined,
    items: o.items
      .filter((i) => i.sellerId === seller.id)
      .map((i): OrderItemDto => ({
        id: i.id,
        productId: i.productId ?? undefined,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        size: i.size ?? undefined,
        color: i.color ?? undefined,
        total: i.total,
        status: i.status,
        trackingNumber: i.trackingNumber ?? undefined,
      })),
  }));

  return json({ orders: dto });
}

export const dynamic = "force-dynamic";