import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth/guard";
import { json, unauthorized } from "@/lib/http";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const user = await currentUser(request);
  if (!user) return unauthorized();

  await db.favorite.deleteMany({ where: { userId: user.id, productId } });
  return json({ ok: true });
}

export const dynamic = "force-dynamic";