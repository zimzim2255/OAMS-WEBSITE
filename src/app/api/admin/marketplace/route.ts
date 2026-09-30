import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { json, unauthorized } from "@/lib/http";
import { toProductDto } from "@/lib/serializers";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim() ?? "";
  const status = url.searchParams.get("status")?.trim() ?? "all";

  const sellerWhere: Prisma.UserWhereInput = { role: "SELLER" };
  const and: Prisma.UserWhereInput[] = [];
  if (search) {
    and.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { storeName: { contains: search, mode: "insensitive" } },
        { storeCategory: { contains: search, mode: "insensitive" } },
      ],
    });
  }
  if (status && status !== "all") and.push({ sellerStatus: status });
  if (and.length) sellerWhere.AND = and;

  const sellers = await db.user.findMany({
    where: sellerWhere,
    select: {
      id: true,
      email: true,
      name: true,
      storeName: true,
      storeCategory: true,
      avatarUrl: true,
      bio: true,
      sellerStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const sellerIds = sellers.map((s) => s.id);

  // Per-seller aggregates: listings, active listings, sales (items + revenue).
  const prodTotals = sellerIds.length
    ? await db.product.groupBy({
        by: ["sellerId"],
        where: { sellerId: { in: sellerIds } },
        _count: { _all: true },
      })
    : [];
  const prodActive = sellerIds.length
    ? await db.product.groupBy({
        by: ["sellerId"],
        where: { sellerId: { in: sellerIds }, isActive: true },
        _count: { _all: true },
      })
    : [];
  const saleAgg = sellerIds.length
    ? await db.orderItem.groupBy({
        by: ["sellerId"],
        where: { sellerId: { in: sellerIds } },
        _sum: { total: true, quantity: true },
        _count: { _all: true },
      })
    : [];

  const prodMap = new Map(prodTotals.map((r) => [r.sellerId, r._count._all]));
  const actMap = new Map(prodActive.map((r) => [r.sellerId, r._count._all]));
  const saleMap = new Map(
    saleAgg.map((r) => [
      r.sellerId,
      {
        count: r._count._all,
        revenue: r._sum.total ?? 0,
        units: r._sum.quantity ?? 0,
      },
    ])
  );

  const sellerList = sellers.map((s) => {
    const sale = saleMap.get(s.id);
    return {
      id: s.id,
      email: s.email,
      name: s.name,
      storeName: s.storeName,
      storeCategory: s.storeCategory,
      avatarUrl: s.avatarUrl,
      bio: s.bio,
      sellerStatus: s.sellerStatus,
      createdAt: s.createdAt,
      listingsCount: prodMap.get(s.id) ?? 0,
      activeListings: actMap.get(s.id) ?? 0,
      salesCount: sale?.count ?? 0,
      unitsSold: sale?.units ?? 0,
      revenue: sale?.revenue ?? 0,
    };
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
    sellers: sellerList,
    listings: listings.map((l) => ({
      ...toProductDto(l),
      sellerName: l.seller?.storeName || l.seller?.name || "Unknown",
    })),
  });
}

export const dynamic = "force-dynamic";