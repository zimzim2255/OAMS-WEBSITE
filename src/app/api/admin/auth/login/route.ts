import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, buildAdminSessionCookie, sessionTtlSeconds } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation";
import { json, badRequest, unauthorized, forbidden } from "@/lib/http";

// Admin-only login. Unlike the storefront /api/auth/login, this strictly
// requires the account to have role ADMIN and issues a *separate* session
// cookie (oams_admin_session) that only /api/admin/* endpoints accept.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid input");

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return unauthorized("Invalid email or password");
  if (user.role !== "ADMIN") {
    return forbidden("Administrator access only — use the storefront login for your account.");
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return unauthorized("Invalid email or password");

  const token = await createSessionToken({ sub: user.id, email: user.email, role: user.role });
  const res = json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
  res.headers.set("Set-Cookie", buildAdminSessionCookie(token, sessionTtlSeconds()));
  return res;
}

export const dynamic = "force-dynamic";