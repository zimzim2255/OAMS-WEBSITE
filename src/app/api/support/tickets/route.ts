import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth/guard";
import { supportTicketSchema } from "@/lib/validation";
import { generateTicketNumber, toTicketDto } from "@/lib/support";
import { sendSupportConfirmation } from "@/lib/mail";
import { json, badRequest, unauthorized } from "@/lib/http";

// Create a new support ticket (logged-in users OR guests).
export async function POST(request: NextRequest) {
  const user = await currentUser(request); // may be null for guests
  const body = await request.json().catch(() => null);
  const parsed = supportTicketSchema.safeParse(body);
  if (!parsed.success) return badRequest("Subject, message, name and a valid email are required");

  const d = parsed.data;
  const name = user?.name ?? d.name;
  const email = (user?.email ?? d.email).toLowerCase();

  // Retry a few times to get a unique ticket number.
  let ticket: Awaited<ReturnType<typeof db.supportTicket.create>> | null = null;
  for (let i = 0; i < 5; i++) {
    const ticketNumber = generateTicketNumber();
    try {
      ticket = await db.supportTicket.create({
        data: {
          ticketNumber,
          subject: d.subject,
          message: d.message,
          name,
          email,
          userId: user?.id ?? null,
          messages: {
            create: { authorName: name, isStaff: false, body: d.message, authorId: user?.id ?? null },
          },
        },
        include: { _count: { select: { messages: true } } },
      });
      break;
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === "P2002") continue; // unique collision on ticketNumber, retry
      throw e;
    }
  }
  if (!ticket) return badRequest("Could not create ticket, please try again");

  // Fire-and-forget confirmation email (skipped silently if SMTP not configured).
  sendSupportConfirmation(ticket.email, ticket.ticketNumber, ticket.subject).catch(() => {});

  return json({ ticket: toTicketDto(ticket) }, 201);
}

// List the authenticated user's own tickets.
export async function GET(request: NextRequest) {
  const user = await currentUser(request);
  if (!user) return unauthorized();
  const tickets = await db.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });
  return json({ tickets: tickets.map(toTicketDto) });
}

export const dynamic = "force-dynamic";