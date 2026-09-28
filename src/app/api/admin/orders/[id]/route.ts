import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { toOrderDto } from "@/lib/serializers";
import { json, badRequest, unauthorized, notFound } from "@/lib/http";
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const existing = await db.order.findUnique({ where: { id } });
  if (!existing) return notFound("Order not found");

  const body = (await request.json().catch(() => null)) as { status?: unknown } | null;
  const status = body?.status as OrderStatus | undefined;
  if (!status || !ORDER_STATUSES.includes(status)) return badRequest("Invalid status");

  const data: Prisma.OrderUpdateInput = { status };
  if (status === "PAID") data.paidAt = new Date();
  if (status === "SHIPPED") data.shippedAt = new Date();
  if (status === "DELIVERED") data.deliveredAt = new Date();
  if (status === "CANCELLED") data.cancelledAt = new Date();

  const order = await db.order.update({
    where: { id },
    data,
    include: { items: true },
  });

  return json({ order: toOrderDto(order) });
}

export const dynamic = "force-dynamic";