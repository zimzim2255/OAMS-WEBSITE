import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { json, badRequest, unauthorized, notFound } from "@/lib/http";
import type { Prisma, Role as RoleEnum } from "@prisma/client";

const SELLER_STATUSES = ["none", "requested", "active", "suspended"];
const ROLES = ["USER", "SELLER", "ADMIN"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const body = (await request.json().catch(() => null)) as {
    sellerStatus?: string;
    role?: string;
  } | null;

  const data: Prisma.UserUpdateInput = {};
  if (body?.sellerStatus && SELLER_STATUSES.includes(body.sellerStatus)) {
    data.sellerStatus = body.sellerStatus;
  }
  if (body?.role && ROLES.includes(body.role)) {
    data.role = body.role as RoleEnum;
  }
  if (Object.keys(data).length === 0) return badRequest("Nothing to update");

  const existing = await db.user.findUnique({ where: { id } });
  if (!existing) return notFound("User not found");

  const user = await db.user.update({ where: { id }, data });

  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      sellerStatus: user.sellerStatus,
    },
  });
}

export const dynamic = "force-dynamic";