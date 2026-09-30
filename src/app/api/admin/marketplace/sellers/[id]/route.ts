import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { json, unauthorized, notFound } from "@/lib/http";
import { toProductDto } from "@/lib/serializers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const seller = await db.user.findFirst({
    where: { id, role: "SELLER" },
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
      updatedAt: true,
    },
  });
  if (!seller) return notFound("Seller not found");

  const products = await db.product.findMany({
    where: { sellerId: id },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  const salesRows = await db.orderItem.findMany({
    where: { sellerId: id },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          customer: true,
          createdAt: true,
          trackingNumber: true,
          currency: true,
        },
      },
    },
    orderBy: { order: { createdAt: "desc" } },
  });

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const revenue = salesRows.reduce((s, r) => s + r.total, 0);
  const unitsSold = salesRows.reduce((s, r) => s + r.quantity, 0);
  const ordersCount = new Set(salesRows.map((r) => r.orderId)).size;

  return json({
    seller: {
      ...seller,
      totalProducts,
      activeProducts,
      revenue,
      unitsSold,
      salesCount: salesRows.length,
      ordersCount,
    },
    listings: products.map(
      (p): ReturnType<typeof toProductDto> & { sellerName: string } => ({
        ...toProductDto(p),
        sellerName: seller.storeName || seller.name || "Unknown",
      })
    ),
    sales: salesRows.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      orderNumber: r.order.orderNumber,
      status: r.order.status,
      createdAt: r.order.createdAt,
      trackingNumber: r.order.trackingNumber,
      currency: r.order.currency,
      customer: r.order.customer,
      name: r.name,
      quantity: r.quantity,
      price: r.price,
      total: r.total,
      size: r.size,
      color: r.color,
    })),
  });
}

export const dynamic = "force-dynamic";