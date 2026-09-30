import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import type { Role } from "@prisma/client";

export interface SessionPayload {
  sub: string; // user id
  email: string;
  role: Role;
}

export interface DecodedSession extends SessionPayload {
  exp: number;
}

const SECRET = () => new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-only-secret-change-me");
export const SESSION_COOKIE = process.env.SESSION_COOKIE ?? "oams_session";
// Separate cookie for the admin panel. Issued only by the admin login route and
// required by every /api/admin/* handler, so a normal storefront session can
// never authorize admin access (and vice-versa).
export const ADMIN_SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE ?? "oams_admin_session";

function ttlSeconds(): number {
  const parsed = Number(process.env.SESSION_TTL ?? 604800);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 604800;
}

/** Session lifetime in seconds (used for the cookie Max-Age). */
export function sessionTtlSeconds(): number {
  return ttlSeconds();
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds())
    .sign(SECRET());
}

export async function verifySessionToken(token: string): Promise<DecodedSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET(), { algorithms: ["HS256"] });
    return {
      sub: payload.sub ?? "",
      email: (payload.email as string) ?? "",
      role: (payload.role as Role) ?? "USER",
      exp: payload.exp ?? 0,
    };
  } catch {
    return null;
  }
}

/** Read the raw JWT (storefront session) from a request's cookies. */
export function tokenFromRequest(request: NextRequest): string | undefined {
  if (typeof request.cookies === "object" && request.cookies) {
    const cookie = request.cookies.get(SESSION_COOKIE);
    return cookie?.value;
  }
  return undefined;
}

/** Read the raw JWT (admin session) from a request's cookies. */
export function adminTokenFromRequest(request: NextRequest): string | undefined {
  if (typeof request.cookies === "object" && request.cookies) {
    const cookie = request.cookies.get(ADMIN_SESSION_COOKIE);
    return cookie?.value;
  }
  return undefined;
}

/** Build a Set-Cookie header that stores the storefront session token. */
export function buildSessionCookie(token: string, maxAge: number): string {
  const secure = process.env.NODE_ENV === "production";
  return `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure ? "; Secure" : ""}`;
}

/** Build a Set-Cookie header that stores the admin session token. */
export function buildAdminSessionCookie(token: string, maxAge: number): string {
  const secure = process.env.NODE_ENV === "production";
  return `${ADMIN_SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict${secure ? "; Secure" : ""}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}

export function clearAdminSessionCookie(): string {
  return `${ADMIN_SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`;
}