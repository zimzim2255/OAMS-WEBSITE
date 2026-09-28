import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  buildSessionCookie,
  sessionTtlSeconds,
} from "@/lib/auth/session";
import { registerSchema } from "@/lib/validation";
import { json, badRequest } from "@/lib/http";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid input");

  const { name, email, password } = parsed.data;

  const exists = await db.user.findUnique({ where: { email } });
  if (exists) return badRequest("Email already registered");

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: { name, email, role: "USER", sellerStatus: "none", passwordHash },
  });

  const token = await createSessionToken({ sub: user.id, email: user.email, role: user.role });
  const res = json(
    { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
    201
  );
  res.headers.set("Set-Cookie", buildSessionCookie(token, sessionTtlSeconds()));
  return res;
}