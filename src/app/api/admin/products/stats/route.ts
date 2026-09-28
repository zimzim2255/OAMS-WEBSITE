import type { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guard";
import { getAdminProductStats } from "@/lib/admin-stats";
import { json, unauthorized } from "@/lib/http";

export async function GET(request: NextRequest) {
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();
  const stats = await getAdminProductStats();
  return json({ stats });
}

export const dynamic = "force-dynamic";