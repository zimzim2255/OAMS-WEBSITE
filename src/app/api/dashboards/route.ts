import { db } from "@/lib/db";
import { json } from "@/lib/http";

// Public: active popup dashboards shown when the site opens.
export async function GET() {
  const items = await db.banner.findMany({
    where: { isActive: true, isPopup: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      imageUrl: true,
      route: true,
      title: true,
    },
  });
  return json({ dashboards: items });
}

export const dynamic = "force-dynamic";