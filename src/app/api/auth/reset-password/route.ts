import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth/password";
import { json, badRequest } from "@/lib/http";

const SECRET = () => new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-only-secret-change-me");

// Set a new password using a one-time reset token (from the emailed link).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) return badRequest("New password must be at least 8 characters");

  let payload: { purpose?: unknown; sub?: string };
  try {
    const { payload: p } = await jwtVerify(parsed.data.token, SECRET(), {
      algorithms: ["HS256"],
    });
    payload = p as { purpose?: unknown; sub?: string };
  } catch {
    return badRequest("This reset link is invalid or has expired. Request a new one.");
  }

  if (payload.purpose !== "password-reset" || !payload.sub) {
    return badRequest("This reset link is invalid or has expired. Request a new one.");
  }

  const user = await db.user.findUnique({ where: { id: payload.sub } });
  if (!user) return badRequest("This reset link is invalid or has expired. Request a new one.");

  const passwordHash = await hashPassword(parsed.data.password);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });

  return json({ ok: true });
}

export const dynamic = "force-dynamic";