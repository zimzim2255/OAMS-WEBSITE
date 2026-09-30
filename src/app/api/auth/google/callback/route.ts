import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, buildSessionCookie, sessionTtlSeconds } from "@/lib/auth/session";
import { GET_OAUTH_PARAMS } from "../route";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const OAUTH_STATE_COOKIE = "oams_oauth_state";

async function exchangeCode(code: string, redirectUri: string): Promise<string | null> {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });
  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      console.error("[google/callback] token exchange failed", res.status, bodyText);
      return null;
    }
    const data = await res.json();
    return (data.access_token as string | undefined) ?? null;
  } catch (e) {
    console.error("[google/callback] token exchange threw", e);
    return null;
  }
}

async function getUserInfo(accessToken: string) {
  try {
    const res = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      console.error("[google/callback] userinfo failed", res.status);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error("[google/callback] userinfo threw", e);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const clearStateCookie = () => `${OAUTH_STATE_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    // CSRF check: the `state` returned by Google must match the cookie we set.
    const expected = request.cookies?.get(OAUTH_STATE_COOKIE)?.value;

    if (!code || !state || !expected || state !== expected) {
      const res = NextResponse.redirect(`${site}/login?error=google_failed`);
      res.headers.set("Set-Cookie", clearStateCookie());
      return res;
    }

    const { clientId, redirectUri } = GET_OAUTH_PARAMS();
    if (!clientId) {
      const res = NextResponse.redirect(`${site}/login?error=google_config`);
      res.headers.set("Set-Cookie", clearStateCookie());
      return res;
    }

    const accessToken = await exchangeCode(code, redirectUri);
    if (!accessToken) {
      const res = NextResponse.redirect(`${site}/login?error=google_failed`);
      res.headers.set("Set-Cookie", clearStateCookie());
      return res;
    }

    const info = await getUserInfo(accessToken);
    const email = info && String(info.email || "").toLowerCase();
    if (!email) {
      const res = NextResponse.redirect(`${site}/login?error=google_failed`);
      res.headers.set("Set-Cookie", clearStateCookie());
      return res;
    }

    const name =
      (String(info.name || "").trim()) ||
      (String(info.given_name || "").trim()) ||
      email.split("@")[0];

    // Upsert the account: if the email already exists (e.g. password signup),
    // link the Google sign-in to that same account; otherwise create a new user.
    let user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Random, non-guessable hash so the account can't be logged into with a
      // password until the user sets one (Google stays their sign-in method).
      const ph = await hashPassword(randomBytes(32).toString("base64"));
      user = await db.user.create({
        data: { name, email, role: "USER", sellerStatus: "none", passwordHash: ph },
      });
    }

    const token = await createSessionToken({ sub: user.id, email: user.email, role: user.role });
    const res = NextResponse.redirect(`${site}/account`);
    res.headers.set("Set-Cookie", buildSessionCookie(token, sessionTtlSeconds()));
    res.headers.append("Set-Cookie", clearStateCookie());
    return res;
  } catch (err) {
    console.error("[google/callback]", err);
    return NextResponse.json(
      { error: "Google sign-in failed. Check the server logs.", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";