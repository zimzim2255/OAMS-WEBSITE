import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth/guard";
import { clearSessionCookie } from "@/lib/auth/session";
import { json, unauthorized } from "@/lib/http";

// Permanently delete the account and its data.
export async function DELETE(request: NextRequest) {
  const user = await currentUser(request);
  if (!user || user.role === "ADMIN") return unauthorized();

  await db.user.delete({ where: { id: user.id } });

  const res = json({ ok: true });
  res.headers.set("Set-Cookie", clearSessionCookie());
  return res;
}

export const dynamic = "force-dynamic";