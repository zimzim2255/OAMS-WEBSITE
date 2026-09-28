import { clearSessionCookie } from "@/lib/auth/session";
import { json } from "@/lib/http";

export async function POST() {
  const res = json({ ok: true });
  res.headers.set("Set-Cookie", clearSessionCookie());
  return res;
}

// Also support logging out via a plain GET for convenience.
export async function GET() {
  return POST();
}

export const dynamic = "force-dynamic";