import type { NextRequest } from "next/server";
import type { Role, User } from "@prisma/client";
import { db } from "../db";
import { tokenFromRequest, verifySessionToken } from "./session";

/** Resolve the authenticated user from a request, or null. */
export async function currentUser(request: NextRequest): Promise<User | null> {
  const token = tokenFromRequest(request);
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload?.sub) return null;
  const user = await db.user.findUnique({ where: { id: payload.sub } });
  return user ?? null;
}

/** Resolve the user only if their role is in `roles`, else null. */
export async function requireRole(request: NextRequest, roles: Role[]): Promise<User | null> {
  const user = await currentUser(request);
  if (!user || !roles.includes(user.role)) return null;
  return user;
}