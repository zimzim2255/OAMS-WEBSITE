import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { toTicketDto } from "@/lib/support";
import { json, unauthorized } from "@/lib/http";

// List all support tickets for the admin queue.
export async function GET(request: NextRequest) {
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const tickets = await db.supportTicket.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: { _count: { select: { messages: true } } },
  });
  return json({ tickets: tickets.map(toTicketDto) });
}

export const dynamic = "force-dynamic";