import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { bannerSchema } from "@/lib/validation";
import { json, badRequest, unauthorized, notFound } from "@/lib/http";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const existing = await db.banner.findUnique({ where: { id } });
  if (!existing) return notFound("Dashboard not found");

  const body = await request.json().catch(() => null);
  const parsed = bannerSchema.partial().safeParse(body);
  if (!parsed.success) return badRequest("Invalid dashboard data");

  const updated = await db.banner.update({ where: { id }, data: parsed.data });
  return json({ dashboard: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();
  await db.banner.delete({ where: { id } });
  return json({ ok: true });
}

export const dynamic = "force-dynamic";