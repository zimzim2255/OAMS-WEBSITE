import { db } from "@/lib/db";
import { json } from "@/lib/http";

// Public: active hero slides for the homepage gallery, in display order.
export async function GET() {
  const items = await db.heroSlide.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      imageUrl: true,
      route: true,
    },
  });

  // For local renditions, upgrade to the highest-resolution "master" version so
  // full-screen heroes stay sharp instead of upscaling a smaller rendition.
  const slides = items.map((s) => ({
    ...s,
    imageUrl: s.imageUrl.replace(/_large\.webp$|_medium\.webp$|_thumb\.webp$|_tiny\.webp$/, "_master.webp"),
  }));

  return json({ slides });
}

export const dynamic = "force-dynamic";