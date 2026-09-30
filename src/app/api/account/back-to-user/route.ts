import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth/guard";
import { json, unauthorized } from "@/lib/http";

// Switch a seller's account back to a personal (user) account.
// This closes the store: the seller's listed products and their orders
// are permanently deleted before the account type is reverted.
export async function POST(request: NextRequest) {
  const user = await currentUser(request);
  if (!user) return unauthorized();

  // Admins keep the ADMIN role (so they retain panel access) but lose the
  // seller/store status. Everyone else reverts to a plain USER.
  const isAdmin = user.role === "ADMIN";

  const products = await db.product.findMany({
    where: { sellerId: user.id },
    select: { id: true },
  });
  const productIds = products.map((p) => p.id);

  // Delete the seller's sales/order lines, then the listed products
  // (product images cascade-delete with the product).
  if (productIds.length > 0) {
    await db.orderItem.deleteMany({ where: { sellerId: user.id } });
    await db.product.deleteMany({ where: { id: { in: productIds } } });
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      role: isAdmin ? "ADMIN" : "USER",
      sellerStatus: "none",
      storeName: null,
      storeCategory: null,
    },
  });

  return json({
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      sellerStatus: updated.sellerStatus,
      storeName: updated.storeName,
      storeCategory: updated.storeCategory,
    },
    deleted: { products: productIds.length },
  });
}