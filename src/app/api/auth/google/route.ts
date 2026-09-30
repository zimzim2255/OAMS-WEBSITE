import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { json } from "@/lib/http";

// The authorize URL must end with these exact strings so the frontend can rely
// on it even if we tweak the env later.
export const GET_OAUTH_PARAMS = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    clientId,
    redirectUri: `${base}/api/auth/google/callback`,
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  };
};

// Start of the "Sign in with Google" flow: redirect the visitor to Google's
// consent screen. A random `state` value is set as an httpOnly cookie so the
// callback can verify the request isn't a forgery (CSRF protection).
export async function GET(request: NextRequest) {
  const { clientId, redirectUri, authorizeUrl } = GET_OAUTH_PARAMS();
  if (!clientId) return json({ error: "Google login is not configured." }, 500);

  const state = randomBytes(16).toString("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  const res = NextResponse.redirect(`${authorizeUrl}?${params.toString()}`);
  res.headers.set("Set-Cookie", `oams_oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax`);
  return res;
}

export const dynamic = "force-dynamic";