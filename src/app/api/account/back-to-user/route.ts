import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth/guard";
import { json, unauthorized } from "@/lib/http";

// Switch a seller's account type back to a personal (user) account.
export async function POST(request: NextRequest) {
  const user = await currentUser(request);
  if (!user) return unauthorized();

  // Admins can't downgrade to USER (they'd lose panel access).
  if (user.role === "ADMIN") {
    return json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        sellerStatus: user.sellerStatus,
        storeName: user.storeName,
        storeCategory: user.storeCategory,
      },
    });
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: { role: "USER", sellerStatus: "none" },
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