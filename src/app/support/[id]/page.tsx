"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { SupportThreadDto } from "@/lib/types";

export default function SupportTicketThreadPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");
  const email = searchParams.get("email") ?? "";

  const [thread, setThread] = useState<SupportThreadDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setError(null);
    const qs = email ? `?email=${encodeURIComponent(email)}` : "";
    const res = await fetch(`/api/support/tickets/${encodeURIComponent(id)}${qs}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setThread(null);
      setError(data.error ?? "You can’t view this ticket.");
      return;
    }
    setThread(data.thread);
  }

  useEffect(() => {
    let active = true;
    const qs = email ? `?email=${encodeURIComponent(email)}` : "";
    fetch(`/api/support/tickets/${encodeURIComponent(id)}${qs}`)
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (!active) return;
        if (!data.thread) setError(data.error ?? "You can’t view this ticket.");
        else {
          setThread(data.thread);
          setError(null);
        }
      })
      .catch(() => {
        if (active) setError("You can’t view this ticket.");
      });
    return () => {
      active = false;
    };
  }, [id, email]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const qs = email ? `?email=${encodeURIComponent(email)}` : "";
    const res = await fetch(`/api/support/tickets/${encodeURIComponent(id)}/messages${qs}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Couldn’t send your reply.");
      return;
    }
    setReply("");
    await load();
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-16 text-center">
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <Link href="/support" className="text-sm underline">Back to support</Link>
      </div>
    );
  }

  if (!thread) {
    return <div className="max-w-2xl mx-auto px-5 py-16 text-center text-neutral-500">Loading ticket…</div>;
  }

  const t = thread.ticket;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <Link href="/support" className="text-sm text-neutral-500 hover:underline">← Back to support</Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t.ticketNumber}</h1>
          <p className="text-neutral-600 mt-1">{t.subject}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-600">{t.status}</span>
      </div>

      <div className="mt-6 space-y-4">
        {thread.messages.length === 0 && (
          <p className="text-neutral-500 text-sm">No messages yet.</p>
        )}
        {thread.messages.map((m) => (
          <div
            key={m.id}
            className={`p-4 rounded-2xl text-sm ${m.isStaff ? "bg-black text-white mr-10" : "bg-neutral-100 ml-10"}`}
          >
            <div className="flex items-center justify-between mb-1 text-xs opacity-70">
              <span>{m.isStaff ? "OAMS Support" : m.authorName}</span>
              <span>{new Date(m.createdAt).toLocaleString()}</span>
            </div>
            <p className="whitespace-pre-wrap">{m.body}</p>
          </div>
        ))}
      </div>

      {t.status !== "CLOSED" ? (
        <form onSubmit={send} className="mt-8">
          <label className="block text-sm font-medium mb-2">Add a reply</label>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            required
            className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm bg-white min-h-28"
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
      ) : (
        <p className="mt-8 text-sm text-neutral-500">This ticket is closed. Open a new one if you need more help.</p>
      )}
    </div>
  );
}