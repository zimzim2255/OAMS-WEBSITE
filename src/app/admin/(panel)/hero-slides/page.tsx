"use client";

import { useEffect, useState } from "react";
import type { HeroSlideDto } from "@/lib/types";

interface FormState {
  title: string;
  imageUrl: string;
  route: string;
  isActive: boolean;
}

const EMPTY: FormState = {
  title: "",
  imageUrl: "",
  route: "/products",
  isActive: true,
};

export default function AdminHeroSlidesPage() {
  const [items, setItems] = useState<HeroSlideDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [uploading, setUploading] = useState(false);

  async function uploadHeroImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Upload failed");
        return;
      }
      // Use the highest-resolution rendition so the full-screen hero stays sharp.
      const img = (data.images?.[0] ?? {}) as { master?: string; large?: string };
      const url = img.master ?? img.large;
      if (url) setForm((f) => ({ ...f, imageUrl: url }));
    } catch {
      setMessage("Upload failed. Try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function load() {
    const res = await fetch("/api/admin/hero-slides");
    if (res.ok) {
      const data = await res.json();
      setItems(data.slides ?? []);
    }
  }

  useEffect(() => {
    (async () => {
      await load();
      setLoading(false);
    })();
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(s: HeroSlideDto) {
    setForm({
      title: s.title ?? "",
      imageUrl: s.imageUrl,
      route: s.route ?? "",
      isActive: s.isActive,
    });
    setEditingId(s.id);
    setShowForm(true);
    setMessage(null);
  }

  function reset() {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const payload = {
      title: form.title,
      imageUrl: form.imageUrl,
      route: form.route,
      isActive: form.isActive,
    };
    const url = editingId ? `/api/admin/hero-slides/${editingId}` : "/api/admin/hero-slides";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Failed to save");
      return;
    }
    setMessage(editingId ? "Slide updated." : "Slide added.");
    reset();
    await load();
  }

  async function toggle(s: HeroSlideDto) {
    const res = await fetch(`/api/admin/hero-slides/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    if (res.ok) await load();
  }

  async function remove(s: HeroSlideDto) {
    if (!confirm("Delete this hero slide?")) return;
    const res = await fetch(`/api/admin/hero-slides/${s.id}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("Slide deleted.");
      await load();
    }
  }

  if (loading) return <div className="p-10 text-center">Loading hero slides…</div>;

  const inputCls = "w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm";
  const labelCls = "block text-xs font-medium text-neutral-500 mb-1";

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4 mb-5">
        <h1 className="text-2xl font-bold">Hero Slides</h1>
        <button
          onClick={() => {
            if (!showForm) setForm(EMPTY);
            setShowForm((v) => !v);
          }}
          className="bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-neutral-800"
        >
          {showForm ? "Cancel" : "+ Add slide"}
        </button>
      </div>

      {message && <p className="mb-4 text-sm text-neutral-700 bg-neutral-100 rounded-lg px-3 py-2">{message}</p>}

      {showForm && (
        <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className={labelCls}>Image *</label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer bg-neutral-100 hover:bg-neutral-200 rounded-lg px-4 py-2 text-sm text-neutral-700">
                  <input type="file" accept="image/*" className="sr-only" onChange={uploadHeroImage} />
                  {uploading ? "Uploading…" : "📷 Browse image"}
                </label>
                <span className="text-xs text-neutral-400">Uses the full-resolution rendition for a sharp hero.</span>
              </div>
              <input
                className={inputCls}
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="/imgs/hero.png or https://…"
                required
              />
            </div>
            <div>
              <label className={labelCls}>Title</label>
              <input
                className={inputCls}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Caption / label"
              />
            </div>
            <div>
              <label className={labelCls}>Link (optional)</label>
              <input
                className={inputCls}
                value={form.route}
                onChange={(e) => set("route", e.target.value)}
                placeholder="/products"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
              Active
            </label>
          </div>

          <div className="mt-5 flex gap-2">
            <button type="submit" className="bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm font-medium">
              {editingId ? "Save changes" : "Add slide"}
            </button>
            {editingId && (
              <button type="button" onClick={reset} className="bg-neutral-200 rounded-lg px-4 py-2 text-sm">
                Cancel
              </button>
            )}
          </div>

          {form.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.imageUrl}
              alt="preview"
              className="mt-4 h-36 w-full object-cover rounded-xl"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
          )}
        </form>
      )}

      <p className="text-xs text-neutral-500 mb-2">Slide order follows the list below (top = first).</p>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-neutral-500">No slides yet — add one above.</p>}
        {items.map((s, idx) => (
          <div key={s.id} className="bg-white rounded-xl shadow px-4 py-3 flex items-center justify-between gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.imageUrl} alt={s.title ?? "slide"} className="w-32 h-20 object-cover rounded-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{s.title || `Slide ${idx + 1}`}</div>
              <div className="text-xs text-neutral-500 truncate">
                {s.route ? <>→ {s.route}</> : <span className="italic">no link</span>}
                {` · order ${s.sortOrder}`}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-1 rounded-full text-xs ${s.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-600"}`}>
                {s.isActive ? "Active" : "Inactive"}
              </span>
              <button onClick={() => startEdit(s)} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200">
                Edit
              </button>
              <button onClick={() => toggle(s)} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200">
                {s.isActive ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => remove(s)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}