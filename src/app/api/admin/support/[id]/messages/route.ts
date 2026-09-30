import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { supportReplySchema } from "@/lib/validation";
import { toMessageDto, toTicketDto } from "@/lib/support";
import { sendSupportReply } from "@/lib/mail";
import { json, badRequest, unauthorized, notFound } from "@/lib/http";

// Admin replies to a ticket.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireRole(request, ["ADMIN"]);
  if (!admin) return unauthorized();

  const existing = await db.supportTicket.findUnique({ where: { id } });
  if (!existing) return notFound("Ticket not found");

  const body = await request.json().catch(() => null);
  const parsed = supportReplySchema.safeParse(body);
  if (!parsed.success) return badRequest("Reply cannot be empty");

  const message = await db.supportMessage.create({
    data: {
      ticketId: id,
      authorName: admin.name,
      body: parsed.data.body,
      isStaff: true,
      authorId: admin.id,
    },
  });

  // An explicit reply moves the ticket out of NEW.
  if (existing.status === "NEW") {
    await db.supportTicket.update({ where: { id }, data: { status: "OPEN" } });
  }

  sendSupportReply(existing.email, existing.ticketNumber, parsed.data.body).catch(() => {});

  const updated = await db.supportTicket.findUnique({
    where: { id },
    include: { _count: { select: { messages: true } } },
  });

  return json({
    thread: {
      ticket: updated ? toTicketDto(updated) : undefined,
      messages: [toMessageDto(message)],
    },
  }, 201);
}

export const dynamic = "force-dynamic";