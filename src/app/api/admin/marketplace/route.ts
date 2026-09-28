import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { json, unauthorized } from "@/lib/http";
import { toProductDto } from "@/lib/serializers";

export async function GET(request: NextRequest) {
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const sellers = await db.user.findMany({
    where: { role: "SELLER" },
    select: {
      id: true,
      email: true,
      name: true,
      storeName: true,
      sellerStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const listings = await db.product.findMany({
    where: { sellerId: { not: null } },
    include: {
      images: true,
      seller: { select: { name: true, storeName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return json({
    sellers,
    listings: listings.map((l) => ({
      ...toProductDto(l),
      sellerName: l.seller?.storeName || l.seller?.name || "Unknown",
    })),
  });
}

export const dynamic = "force-dynamic";