import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth/guard";
import { supportReplySchema } from "@/lib/validation";
import { canAccessTicket, toMessageDto, toTicketDto } from "@/lib/support";
import { json, badRequest, forbidden, notFound } from "@/lib/http";

// Customer adds a message to their ticket.
export async function POST(
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
  if (!canAccessTicket(ticket, user, queryEmail)) return forbidden("You cannot reply to this ticket");

  const body = await request.json().catch(() => null);
  const parsed = supportReplySchema.safeParse(body);
  if (!parsed.success) return badRequest("Message cannot be empty");

  const message = await db.supportMessage.create({
    data: {
      ticketId: ticket.id,
      authorName: user?.name ?? ticket.name,
      body: parsed.data.body,
      isStaff: false,
      authorId: user?.id ?? null,
    },
  });

  // Reopening the conversation resets an exhausted status.
  if (ticket.status === "CLOSED") {
    await db.supportTicket.update({ where: { id: ticket.id }, data: { status: "OPEN" } });
  }

  const updated = await db.supportTicket.findUnique({ where: { id: ticket.id } });
  if (!updated) return notFound("Ticket not found");

  return json({
    thread: {
      ticket: toTicketDto(updated),
      messages: [toMessageDto(message)],
    },
  }, 201);
}

export const dynamic = "force-dynamic";