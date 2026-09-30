import { randomInt } from "crypto";
import type {
  SupportMessageDto,
  SupportPriority,
  SupportStatus,
  SupportTicketDto,
} from "./types";

/** Human-friendly, unguessable ticket reference, e.g. "TKT-8F3KWQX". */
export function generateTicketNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 7; i++) s += chars[randomInt(chars.length)];
  return `TKT-${s}`;
}

/** True when the current user is customer-support staff. */
export function isStaffRole(role?: string | null): boolean {
  return role === "ADMIN";
}

/** Access a ticket's thread: staff, the ticket owner, or someone supplying the contact email. */
export function canAccessTicket(
  ticket: { userId: string | null; email: string },
  user: { id: string; role: string } | null,
  email: string | null
): boolean {
  if (user && isStaffRole(user.role)) return true;
  if (user && ticket.userId && ticket.userId === user.id) return true;
  const e = (email ?? "").toLowerCase().trim();
  if (e && e === ticket.email.toLowerCase().trim()) return true;
  return false;
}

interface TicketRow {
  id: string;
  ticketNumber: string;
  subject: string;
  message: string;
  status: SupportStatus;
  priority: SupportPriority;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { messages: number };
}

export function toTicketDto(t: TicketRow): SupportTicketDto {
  return {
    id: t.id,
    ticketNumber: t.ticketNumber,
    subject: t.subject,
    message: t.message,
    status: t.status,
    priority: t.priority,
    name: t.name,
    email: t.email,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    messageCount: t._count?.messages,
  };
}

export function toMessageDto(m: {
  id: string;
  authorName: string;
  isStaff: boolean;
  body: string;
  createdAt: Date;
}): SupportMessageDto {
  return {
    id: m.id,
    authorName: m.authorName,
    isStaff: m.isStaff,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  };
}