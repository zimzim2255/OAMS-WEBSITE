"use client";

import { useEffect, useState } from "react";
import type { SupportThreadDto, SupportTicketDto } from "@/lib/types";

const STATUSES = ["NEW", "OPEN", "WAITING", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-amber-100 text-amber-700",
  OPEN: "bg-sky-100 text-sky-700",
  WAITING: "bg-indigo-100 text-indigo-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-neutral-200 text-neutral-600",
};
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-neutral-100 text-neutral-600",
  MEDIUM: "bg-sky-100 text-sky-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicketDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<SupportThreadDto | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/support");
    if (res.ok) {
      const d = await res.json();
      setTickets(d.tickets ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    // fetch-on-mount: state only updates after the promise resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function open(t: SupportTicketDto) {
    setSelectedId(t.id);
    setReply("");
    setError(null);
    const res = await fetch(`/api/support/tickets/${t.id}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error ?? "Couldn’t load ticket.");
    else setThread(data.thread);
  }

  async function change(ticket: SupportTicketDto, patch: Record<string, string>) {
    const res = await fetch(`/api/admin/support/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) await load();
  }

  async function staffReply(e: React.FormEvent) {
    e.preventDefault();
    if (!thread) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/support/${thread.ticket.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Couldn’t send reply.");
      return;
    }
    setReply("");
    await open({ id: thread.ticket.id } as SupportTicketDto);
    await load();
  }

  if (loading) return <div className="p-10 text-center">Loading support tickets…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Support tickets</h1>

      <div className="grid gap-4 lg:grid-cols-[340px,1fr]">
        <div className="bg-white rounded-xl shadow max-h-[78vh] overflow-y-auto">
          {tickets.length === 0 ? (
            <p className="p-4 text-neutral-500 text-sm">No tickets yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {tickets.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => open(t)}
                    className={`w-full text-left px-4 py-3 hover:bg-neutral-50 ${selectedId === t.id ? "bg-neutral-100" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">{t.subject}</span>
                      <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${PRIORITY_COLORS[t.priority]}`}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1 text-xs text-neutral-500">
                      <span>{t.ticketNumber} · {new Date(t.updatedAt).toLocaleString()}</span>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                    </div>
                    <div className="mt-1 text-xs text-neutral-400 truncate">{t.name} · {t.email}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

<div className="bg-white rounded-xl shadow p-6">
        {!thread ? (
            <p className="text-neutral-500 text-sm">Select a ticket on the left to view and reply.</p>
          ) : (
            <>
              {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{thread.ticket.ticketNumber}</h2>
                  <p className="text-sm text-neutral-600">{thread.ticket.subject}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {thread.ticket.name} · {thread.ticket.email} · opened {new Date(thread.ticket.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={thread.ticket.status}
                    onChange={(e) => change(thread.ticket, { status: e.target.value })}
                    className="border border-neutral-300 rounded-lg px-2 py-1 text-sm bg-white"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    value={thread.ticket.priority}
                    onChange={(e) => change(thread.ticket, { priority: e.target.value })}
                    className="border border-neutral-300 rounded-lg px-2 py-1 text-sm bg-white"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {thread.messages.map((m) => (
                  <div key={m.id} className={`p-3 rounded-xl text-sm ${m.isStaff ? "bg-neutral-900 text-white" : "bg-neutral-100"}`}>
                    <div className="flex justify-between text-xs opacity-70 mb-1">
                      <span>{m.isStaff ? "OAMS Support" : m.authorName}</span>
                      <span>{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={staffReply} className="mt-6">
                <label className="block text-sm font-medium mb-2">Reply to customer</label>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  required
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm bg-white min-h-24"
                  placeholder="Write your reply…"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-3 bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {busy ? "Sending…" : "Send reply"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}