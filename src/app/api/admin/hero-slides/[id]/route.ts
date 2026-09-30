import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { heroSlideSchema } from "@/lib/validation";
import { json, badRequest, unauthorized, notFound } from "@/lib/http";

function normalizeRoute(route: string | undefined): string | null | undefined {
  // Convert an empty string from the form into a DB NULL (no navigation).
  return route === "" ? null : route;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const existing = await db.heroSlide.findUnique({ where: { id } });
  if (!existing) return notFound("Slide not found");

  const body = await request.json().catch(() => null);
  const parsed = heroSlideSchema.partial().safeParse(body);
  if (!parsed.success) return badRequest("Invalid slide data");

  const data: Record<string, unknown> = { ...parsed.data };
  if ("route" in parsed.data) data.route = normalizeRoute(parsed.data.route);

  const updated = await db.heroSlide.update({ where: { id }, data });
  return json({ slide: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();
  await db.heroSlide.delete({ where: { id } });
  return json({ ok: true });
}

export const dynamic = "force-dynamic";