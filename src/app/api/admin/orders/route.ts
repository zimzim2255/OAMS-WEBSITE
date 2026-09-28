import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { toOrderDto } from "@/lib/serializers";
import { json, unauthorized } from "@/lib/http";

export async function GET(request: NextRequest) {
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const orders = await db.order.findMany({
    include: {
      items: true,
      user: { select: { id: true, email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return json({ orders: orders.map(toOrderDto) });
}

export const dynamic = "force-dynamic";