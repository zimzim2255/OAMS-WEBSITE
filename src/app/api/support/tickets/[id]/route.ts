import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth/guard";
import { canAccessTicket, toMessageDto, toTicketDto } from "@/lib/support";
import { json, forbidden, notFound } from "@/lib/http";

// Full thread for a single ticket (by internal id or ticket number).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await currentUser(request);
  const queryEmail = new URL(request.url).searchParams.get("email");

  const ticket = await db.supportTicket.findFirst({
    where: { OR: [{ id }, { ticketNumber: id }] },
  });
  if (!ticket) return notFound("Ticket not found");
  if (!canAccessTicket(ticket, user, queryEmail)) return forbidden("You cannot view this ticket");

  const messages = await db.supportMessage.findMany({
    where: { ticketId: ticket.id },
    orderBy: { createdAt: "asc" },
  });

  return json({
    thread: {
      ticket: toTicketDto(ticket),
      messages: messages.map(toMessageDto),
    },
  });
}

export const dynamic = "force-dynamic";