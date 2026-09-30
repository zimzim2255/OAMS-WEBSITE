import type { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth/guard";
import { json, unauthorized } from "@/lib/http";

export async function GET(request: NextRequest) {
  const user = await currentUser(request);
  if (!user) return unauthorized();
  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      sellerStatus: user.sellerStatus,
      storeName: user.storeName,
      storeCategory: user.storeCategory,
      avatarUrl: user.avatarUrl,
    },
  });
}

export const dynamic = "force-dynamic";