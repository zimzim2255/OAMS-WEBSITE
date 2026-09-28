import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { bannerSchema } from "@/lib/validation";
import type { BannerDto } from "@/lib/types";
import { json, badRequest, unauthorized } from "@/lib/http";

function toDto(b: {
  id: string;
  title: string | null;
  imageUrl: string;
  route: string;
  isPopup: boolean;
  isActive: boolean;
  sortOrder: number;
}): BannerDto {
  return {
    id: b.id,
    title: b.title ?? undefined,
    imageUrl: b.imageUrl,
    route: b.route,
    isPopup: b.isPopup,
    isActive: b.isActive,
    sortOrder: b.sortOrder,
  };
}

// List all dashboards/displays (admin).
export async function GET(request: NextRequest) {
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();
  const items = await db.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return json({ dashboards: items.map(toDto) });
}

// Create a new dashboard/display (admin).
export async function POST(request: NextRequest) {
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = bannerSchema.safeParse(body);
  if (!parsed.success) return badRequest("Image URL and route are required");

  const item = await db.banner.create({ data: parsed.data });
  return json({ dashboard: toDto(item) }, 201);
}

export const dynamic = "force-dynamic";