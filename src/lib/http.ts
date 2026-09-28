import { NextResponse } from "next/server";

export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function badRequest(message = "Bad request"): NextResponse {
  return json({ error: message }, 400);
}

export function unauthorized(message = "Unauthorized"): NextResponse {
  return json({ error: message }, 401);
}

export function forbidden(message = "Forbidden"): NextResponse {
  return json({ error: message }, 403);
}

export function notFound(message = "Not found"): NextResponse {
  return json({ error: message }, 404);
}