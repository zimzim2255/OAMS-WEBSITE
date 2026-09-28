import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth/guard";
import { becomeSellerSchema } from "@/lib/validation";
import { json, badRequest, unauthorized } from "@/lib/http";

export async function POST(request: NextRequest) {
  const user = await currentUser(request);
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = becomeSellerSchema.safeParse(body);
  if (!parsed.success) return badRequest("Brand name and category are required");

  const { storeName, storeCategory } = parsed.data;

  // Instant switch to Seller — no approval needed. Admins stay admins.
  const isAdmin = user.role === "ADMIN";
  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      role: isAdmin ? "ADMIN" : "SELLER",
      sellerStatus: "active",
      storeName,
      storeCategory,
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
  });
}

export const dynamic = "force-dynamic";