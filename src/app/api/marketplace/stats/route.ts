import type { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guard";
import { summarizeForSeller } from "@/lib/analytics";
import { json, unauthorized } from "@/lib/http";

export async function GET(request: NextRequest) {
  const seller = await requireRole(request, ["SELLER"]);
  if (!seller) return unauthorized();
  const summary = await summarizeForSeller(seller.id);
  return json({ summary });
}

export const dynamic = "force-dynamic";