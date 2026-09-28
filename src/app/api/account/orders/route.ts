import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth/guard";
import { toOrderDto } from "@/lib/serializers";
import { json, unauthorized } from "@/lib/http";

export async function GET(request: NextRequest) {
  const user = await currentUser(request);
  if (!user) return unauthorized();

  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return json({ orders: orders.map(toOrderDto) });
}

export const dynamic = "force-dynamic";