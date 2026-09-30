import type { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth/guard";
import { orderSchema } from "@/lib/validation";
import { toOrderDto } from "@/lib/serializers";
import { json, badRequest } from "@/lib/http";
import { sendOrderConfirmation, sendOrderItemNotification } from "@/lib/mail";
import { EventType } from "@prisma/client";
import type { Prisma } from "@prisma/client";

interface Line {
  productId: string | null;
  sellerId: string | null;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  total: number;
  skuSnapshot: Record<string, unknown>;
}

const SITE_URL = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  const buyer = await currentUser(request); // null for guest checkout
  const body = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid order data");

  const { items, email, name, phone, address, city, notes, shippingCost } = parsed.data;

  // Resolve submitted products from the database.
  const ids = items.map((i) => i.productId).filter(Boolean);
  const found = await db.product.findMany({ where: { id: { in: ids } } });
  const map = new Map(found.map((p) => [p.id, p]));

  // Build line items, prefer authoritative DB price/seller.
  const lines: Line[] = [];
  let subtotal = 0;

  for (const it of items) {
    const product = it.productId ? map.get(it.productId) : undefined;
    if (product && product.isActive) {
      const price = product.price;
      const total = price * it.quantity;
      lines.push({
        productId: product.id,
        sellerId: product.sellerId,
        name: product.name,
        price,
        quantity: it.quantity,
        size: it.size,
        color: it.color,
        total,
        skuSnapshot: { name: product.name, slug: product.slug, brand: product.brand },
      });
      subtotal += total;

      // Best-effort stock decrement (stock is a JSON map color -> qty).
      try {
        const stocks = (product.stock ?? {}) as Record<string, number>;
        if (it.color && typeof stocks[it.color] === "number") {
          const next = { ...stocks, [it.color]: Math.max(0, stocks[it.color] - it.quantity) };
          await db.product.update({ where: { id: product.id }, data: { stock: next as Prisma.InputJsonValue } });
        }
      } catch {
        // never block checkout on stock bookkeeping
      }
    } else {
      // Legacy / no-longer-in-DB item — record the client snapshot as "official".
      const price = it.price ?? 0;
      const total = price * it.quantity;
      lines.push({
        productId: it.productId,
        sellerId: null,
        name: it.name ?? "Item",
        price,
        quantity: it.quantity,
        size: it.size,
        color: it.color,
        total,
        skuSnapshot: { name: it.name },
      });
      subtotal += total;
    }
  }

  const orderNumber = `OAMS-${Date.now().toString(36).toUpperCase()}-${randomBytes(4).toString("hex").toUpperCase()}`;

  const order = await db.order.create({
    data: {
      orderNumber,
      userId: buyer?.id,
      status: "PENDING",
      customer: {
        name,
        email,
        phone: phone || "",
        address,
        city: city || "",
      },
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      currency: "MAD",
      notes: notes || null,
      items: {
        create: lines.map((l) => ({
          productId: l.productId,
          sellerId: l.sellerId,
          skuSnapshot: l.skuSnapshot as Prisma.InputJsonValue,
          name: l.name,
          price: l.price,
          quantity: l.quantity,
          size: l.size,
          color: l.color,
          total: l.total,
        })),
      },
    },
    include: { items: true },
  });

  // Record purchase analytics (best-effort).
  try {
    const sessionId = new URL(request.url).searchParams.get("session") || undefined;
    await db.analyticsEvent.createMany({
      data: lines.filter((l) => l.productId).map((l) => ({
        type: EventType.PURCHASE,
        userId: buyer?.id,
        productId: l.productId,
        sessionId,
        page: "/checkout",
        createdAt: new Date(),
      })),
    });
  } catch {
    // non-critical
  }

  // ---- Emails (never block the order if SMTP is down) ----
  await sendOrderConfirmation(email, orderNumber, `${order.total} DH`, SITE_URL()).catch(() => {});

  // Official (admin) items -> notify the platform admin.
  const officialLines = lines.filter((l) => !l.sellerId);
  const adminEmail = process.env.ADMIN_EMAIL;
  if (officialLines.length > 0 && adminEmail) {
    await sendOrderItemNotification(
      adminEmail,
      orderNumber,
      "official store",
      name,
      email,
      officialLines.map((l) => `${l.name} × ${l.quantity} = ${l.total} DH`)
    ).catch(() => {});
  }

  // Seller items -> notify each seller involved.
  const sellerIds = [...new Set(lines.filter((l) => l.sellerId).map((l) => l.sellerId as string))];
  if (sellerIds.length > 0) {
    const sellers = await db.user.findMany({ where: { id: { in: sellerIds } }, select: { id: true, email: true, storeName: true } });
    for (const seller of sellers) {
      const sellerItems = lines.filter((l) => l.sellerId === seller.id);
      await sendOrderItemNotification(
        seller.email,
        orderNumber,
        seller.storeName || "your store",
        name,
        email,
        sellerItems.map((l) => `${l.name} × ${l.quantity} = ${l.total} DH`)
      ).catch(() => {});
    }
  }

  return json({ order: toOrderDto(order) }, 201);
}

export const dynamic = "force-dynamic";