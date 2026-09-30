import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { toOrderDto } from "@/lib/serializers";
import { json, badRequest, unauthorized, notFound } from "@/lib/http";
import { sendShippedNotification } from "@/lib/mail";
import { SELLER_STATUSES, recomputeOrderStatus } from "@/lib/orders";
import type { OrderStatus, Prisma } from "@prisma/client";

const SITE_URL = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Let a seller fulfill their OWN line items: update status and/or tracking
 * number for an OrderItem that belongs to them. Admin can update anything.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireRole(request, ["SELLER", "ADMIN"]);
  if (!user) return unauthorized();

  const body = (await request.json().catch(() => null)) as {
    status?: unknown;
    trackingNumber?: unknown;
  } | null;

  const status = body?.status as OrderStatus | undefined;
  if (status && !SELLER_STATUSES.includes(status)) return badRequest("Invalid status");
  const tracking =
    typeof body?.trackingNumber === "string" && body.trackingNumber.trim()
      ? body.trackingNumber.trim()
      : null;
  if (!status && !tracking) return badRequest("Nothing to update");

  const item = await db.orderItem.findUnique({
    where: { id },
    include: { order: { include: { items: true } } },
  });
  if (!item) return notFound("Item not found");
  if (item.sellerId !== user.id && user.role !== "ADMIN") return unauthorized();

  const itemData: Prisma.OrderItemUpdateInput = {};
  if (status) itemData.status = status;
  if (tracking) itemData.trackingNumber = tracking;

  await db.orderItem.update({ where: { id }, data: itemData });

  const order = await db.order.findUnique({
    where: { id: item.orderId },
    include: { items: true },
  });
  if (!order) return notFound("Order not found");

  // Derive the order-level status from its lines and timestamp transitions.
  const nextStatus = recomputeOrderStatus(order.items.map((i) => i.status));
  const wasShipped = order.shippedAt !== null;
  const orderData: Prisma.OrderUpdateInput = { status: nextStatus };
  if (nextStatus === "SHIPPED" && !wasShipped) orderData.shippedAt = new Date();
  if (nextStatus === "DELIVERED" && !order.deliveredAt) orderData.deliveredAt = new Date();

  const updated = await db.order.update({
    where: { id: order.id },
    data: orderData,
    include: { items: true },
  });

  // If this update pushed the whole order to Shipped, email the buyer once.
  if (nextStatus === "SHIPPED" && !wasShipped) {
    const customer = (order.customer ?? {}) as { email?: string };
    const trackingNumber =
      updated.trackingNumber ||
      updated.items.find((i) => i.id === id)?.trackingNumber ||
      "";
    await sendShippedNotification(
      customer.email || "",
      updated.orderNumber,
      trackingNumber,
      SITE_URL()
    ).catch(() => {});
  }

  return json({ order: toOrderDto(updated) });
}

export const dynamic = "force-dynamic";