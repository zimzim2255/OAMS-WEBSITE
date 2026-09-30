import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth/guard";
import { profileSchema } from "@/lib/validation";
import { json, badRequest, unauthorized } from "@/lib/http";
import type { Prisma } from "@prisma/client";

export async function PATCH(request: NextRequest) {
  const user = await currentUser(request);
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid profile data");

  const data: Prisma.UserUpdateInput = {};
  if (parsed.data.name !== undefined && parsed.data.name) data.name = parsed.data.name;
  if (parsed.data.storeName !== undefined) data.storeName = parsed.data.storeName || null;
  if (parsed.data.storeCategory !== undefined) data.storeCategory = parsed.data.storeCategory || null;
  if (parsed.data.avatarUrl !== undefined) data.avatarUrl = parsed.data.avatarUrl || null;
  if (Object.keys(data).length === 0) return badRequest("Nothing to update");

  const updated = await db.user.update({ where: { id: user.id }, data });

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