import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { supportTicketUpdateSchema } from "@/lib/validation";
import { toTicketDto } from "@/lib/support";
import { json, badRequest, unauthorized, notFound } from "@/lib/http";

// Admin updates a ticket's status / priority.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const existing = await db.supportTicket.findUnique({ where: { id } });
  if (!existing) return notFound("Ticket not found");

  const body = await request.json().catch(() => null);
  const parsed = supportTicketUpdateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid status or priority");

  const updated = await db.supportTicket.update({
    where: { id },
    data: parsed.data,
    include: { _count: { select: { messages: true } } },
  });
  return json({ ticket: toTicketDto(updated) });
}

export const dynamic = "force-dynamic";