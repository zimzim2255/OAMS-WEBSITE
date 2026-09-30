"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SupportTicketDto } from "@/lib/types";

export default function SupportPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tickets, setTickets] = useState<SupportTicketDto[]>([]);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<SupportTicketDto | null>(null);
  const [busy, setBusy] = useState(false);

  const [lookupNumber, setLookupNumber] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");

  useEffect(() => {
    (async () => {
      const me = await fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).catch(() => null);
      if (me?.user) {
        setLoggedIn(true);
        setName(me.user.name ?? "");
        setEmail(me.user.email ?? "");
        const res = await fetch("/api/support/tickets");
        if (res.ok) {
          const d = await res.json();
          setTickets(d.tickets ?? []);
        }
      }
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreated(null);
    setBusy(true);
    const res = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message, name, email }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Please fill in every field.");
      return;
    }
    setCreated(data.ticket as SupportTicketDto);
    setSubject("");
    setMessage("");
    if (loggedIn) {
      const r = await fetch("/api/support/tickets");
      if (r.ok) {
        const d = await r.json();
        setTickets(d.tickets ?? []);
      }
    }
  }

  const inputCls = "w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white";
  const labelCls = "block text-sm font-medium mb-1";

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <h1 className="text-3xl font-bold mb-2">Support</h1>
      <p className="text-neutral-500 mb-8">We’re here to help. Open a ticket and our team will get back to you.</p>

      {created && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          <p className="font-semibold">Ticket {created.ticketNumber} opened.</p>
          <p className="mt-1">
            Track it: <Link href={`/support/${created.id}`} className="underline font-medium">open thread</Link>
            {!loggedIn && " — or save your ticket number and email to reopen it later."}
          </p>
        </div>
      )}
      {error && <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

<div className="grid gap-6 lg:grid-cols-2">
      <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Open a ticket</h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className={labelCls}>What do you need help with?</label>
              <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Order issue, returns, account…" required />
            </div>
            <div>
              <label className={labelCls}>Message</label>
              <textarea className={inputCls + " min-h-28"} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue or question…" required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Your name</label>
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required disabled={loggedIn} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loggedIn} />
              </div>
            </div>
            <button type="submit" disabled={busy} className="bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50">
              {busy ? "Opening…" : "Open ticket"}
            </button>
          </form>
        </section>

        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Find a ticket</h2>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new URLSearchParams();
              if (lookupEmail) q.set("email", lookupEmail);
              const base = `/support/${encodeURIComponent(lookupNumber.trim())}`;
              window.location.href = q.toString() ? `${base}?${q.toString()}` : base;
            }}
          >
            <div>
              <label className={labelCls}>Ticket number</label>
              <input className={inputCls} value={lookupNumber} onChange={(e) => setLookupNumber(e.target.value)} placeholder="TKT-XXXXXXX" required />
            </div>
            <div>
              <label className={labelCls}>Email used to open it</label>
              <input className={inputCls} type="email" value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} required />
            </div>
            <button type="submit" className="bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm font-medium">
              View ticket
            </button>
          </form>

          {loggedIn && (
            <div className="mt-6 border-t border-neutral-100 pt-5">
              <h3 className="text-sm font-semibold mb-3">My tickets</h3>
              {tickets.length === 0 ? (
                <p className="text-sm text-neutral-500">You haven’t opened any tickets yet.</p>
              ) : (
                <ul className="space-y-2">
                  {tickets.map((t) => (
                    <li key={t.id}>
                      <Link href={`/support/${t.id}`} className="flex items-center justify-between gap-2 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-sm">
                        <span className="font-medium truncate">{t.ticketNumber} — {t.subject}</span>
                        <span className="shrink-0 text-neutral-500">{t.messageCount ?? 0} msg</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}