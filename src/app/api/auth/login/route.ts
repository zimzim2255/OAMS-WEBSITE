import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  buildSessionCookie,
  sessionTtlSeconds,
} from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation";
import { json, badRequest, unauthorized, forbidden } from "@/lib/http";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid input");

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return unauthorized("Invalid email or password");

  // Admin accounts are isolated to the admin panel (separate session cookie).
  // They can't use the storefront login.
  if (user.role === "ADMIN") {
    return forbidden("This account is an administrator — sign in from the admin panel instead.");
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return unauthorized("Invalid email or password");

  const token = await createSessionToken({ sub: user.id, email: user.email, role: user.role });
  const res = json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
  res.headers.set("Set-Cookie", buildSessionCookie(token, sessionTtlSeconds()));
  return res;
}