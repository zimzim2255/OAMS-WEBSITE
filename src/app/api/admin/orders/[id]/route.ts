import type { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { toOrderDto } from "@/lib/serializers";
import { json, badRequest, unauthorized, notFound } from "@/lib/http";
import { sendShippedNotification } from "@/lib/mail";
import type { OrderStatus, Prisma } from "@prisma/client";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const SITE_URL = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const existing = await db.order.findUnique({ where: { id } });
  if (!existing) return notFound("Order not found");

  const body = (await request.json().catch(() => null)) as {
    status?: unknown;
    trackingNumber?: unknown;
  } | null;
  const status = body?.status as OrderStatus | undefined;
  if (!status || !ORDER_STATUSES.includes(status)) return badRequest("Invalid status");

  const incomingTracking =
    typeof body?.trackingNumber === "string" && body.trackingNumber.trim()
      ? body.trackingNumber.trim()
      : null;

  const wasShipped = existing.shippedAt !== null;

  // Keep an existing tracking number unless a new one was provided.
  let trackingNumber = existing.trackingNumber;
  if (incomingTracking) trackingNumber = incomingTracking;
  // Auto-generate one when marking the order shipped so the buyer always has it.
  if (status === "SHIPPED" && !trackingNumber) {
    trackingNumber = `OAMS-SHP-${Date.now().toString(36).toUpperCase()}${randomBytes(3).toString("hex").toUpperCase()}`;
  }

  const data: Prisma.OrderUpdateInput = { status };
  if (trackingNumber) data.trackingNumber = trackingNumber;
  if (status === "PAID") data.paidAt = new Date();
  if (status === "SHIPPED" && !wasShipped) data.shippedAt = new Date();
  if (status === "DELIVERED") data.deliveredAt = new Date();
  if (status === "CANCELLED") data.cancelledAt = new Date();

  // Admin controls the whole order: apply the status to every line, and carry
  // the tracking number onto lines that are being fulfilled.
  const itemData: Prisma.OrderItemUpdateManyMutationInput = { status };
  if (trackingNumber && (status === "SHIPPED" || status === "DELIVERED")) {
    itemData.trackingNumber = trackingNumber;
  }

  const order = await db.order.update({
    where: { id },
    data: { ...data, items: { updateMany: { where: { orderId: id }, data: itemData } } },
    include: { items: true },
  });

  // Notify the buyer exactly once, when the order first enters SHIPPED.
  if (status === "SHIPPED" && !wasShipped) {
    const customer = (order.customer ?? {}) as { email?: string };
    await sendShippedNotification(
      customer.email || "",
      order.orderNumber,
      trackingNumber || "",
      SITE_URL()
    ).catch(() => {});
  }

  return json({ order: toOrderDto(order) });
}

export const dynamic = "force-dynamic";