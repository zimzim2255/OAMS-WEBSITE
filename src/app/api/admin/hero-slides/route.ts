import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { heroSlideSchema } from "@/lib/validation";
import type { HeroSlideDto } from "@/lib/types";
import { json, badRequest, unauthorized } from "@/lib/http";

function toDto(s: {
  id: string;
  title: string | null;
  imageUrl: string;
  route: string | null;
  isActive: boolean;
  sortOrder: number;
}): HeroSlideDto {
  return {
    id: s.id,
    title: s.title ?? undefined,
    imageUrl: s.imageUrl,
    route: s.route ?? undefined,
    isActive: s.isActive,
    sortOrder: s.sortOrder,
  };
}

// List all hero slides (admin).
export async function GET(request: NextRequest) {
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();
  const items = await db.heroSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return json({ slides: items.map(toDto) });
}

// Create a new hero slide (admin). Appends to the end of the gallery.
export async function POST(request: NextRequest) {
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = heroSlideSchema.safeParse(body);
  if (!parsed.success) return badRequest("Image URL is required");

  const last = await db.heroSlide.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const nextOrder = (last?.sortOrder ?? -1) + 1;
  const data = {
    ...parsed.data,
    route: parsed.data.route === "" ? null : parsed.data.route,
    sortOrder: nextOrder,
  };

  const item = await db.heroSlide.create({ data });
  return json({ slide: toDto(item) }, 201);
}

export const dynamic = "force-dynamic";