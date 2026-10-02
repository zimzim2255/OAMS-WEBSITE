import type { NextRequest } from "next/server";
import { SignJWT } from "jose";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validation";
import { json, badRequest } from "@/lib/http";
import { sendPasswordReset } from "@/lib/mail";

const SITE_URL = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SECRET = () => new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-only-secret-change-me");
const RESET_TTL_SECONDS = 3600; // 1 hour

// Request a password reset for `email`. Always responds the same way so an
// attacker can't enumerate which accounts exist; the email is only sent when
// the account actually exists.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid email");

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const token = await new SignJWT({ purpose: "password-reset" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + RESET_TTL_SECONDS)
      .sign(SECRET());

    const resetUrl = `${SITE_URL()}/reset-password?token=${encodeURIComponent(token)}`;
    await sendPasswordReset(user.email, user.name, resetUrl).catch(() => {});
  }

  return json({ ok: true });
}

export const dynamic = "force-dynamic";