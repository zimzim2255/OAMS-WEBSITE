import { clearAdminSessionCookie } from "@/lib/auth/session";
import { json } from "@/lib/http";

export async function POST() {
  const res = json({ ok: true });
  res.headers.set("Set-Cookie", clearAdminSessionCookie());
  return res;
}

export async function GET() {
  return POST();
}

export const dynamic = "force-dynamic";