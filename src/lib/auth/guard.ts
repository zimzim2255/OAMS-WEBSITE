import type { NextRequest } from "next/server";
import type { Role, User } from "@prisma/client";
import { db } from "../db";
import { tokenFromRequest, adminTokenFromRequest, verifySessionToken } from "./session";

/** Resolve the authenticated storefront user from a request, or null. */
export async function currentUser(request: NextRequest): Promise<User | null> {
  const token = tokenFromRequest(request);
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload?.sub) return null;
  const user = await db.user.findUnique({ where: { id: payload.sub } });
  return user ?? null;
}

/**
 * Resolve the authenticated ADMIN from the dedicated admin session cookie.
 * Only the admin login route (which requires role ADMIN) can set this cookie,
 * so a normal storefront session can never authorize admin access.
 */
export async function currentAdmin(request: NextRequest): Promise<User | null> {
  const token = adminTokenFromRequest(request);
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload?.sub) return null;
  const user = await db.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

/**
 * Resolve the user only if their role is in `roles`, else null.
 *
 * ADMIN-only checks (roles === ["ADMIN"]) are resolved against the *admin*
 * session cookie so the admin panel is isolated from the storefront session.
 * Mixed checks (e.g. ["SELLER", "ADMIN"] on the storefront side) use the
 * normal storefront session cookie.
 */
export async function requireRole(request: NextRequest, roles: Role[]): Promise<User | null> {
  const adminOnly = roles.length === 1 && roles[0] === "ADMIN";
  const user = adminOnly ? await currentAdmin(request) : await currentUser(request);
  if (!user || !roles.includes(user.role)) return null;
  return user;
}