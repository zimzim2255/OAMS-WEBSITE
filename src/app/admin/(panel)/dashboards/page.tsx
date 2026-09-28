"use client";

import { useEffect, useState } from "react";
import { BANNER_ROUTES } from "@/lib/banner-routes";
import type { BannerDto } from "@/lib/types";

interface FormState {
  title: string;
  imageUrl: string;
  route: string;
  customRoute: string;
  isPopup: boolean;
  isActive: boolean;
}

const EMPTY: FormState = {
  title: "",
  imageUrl: "",
  route: BANNER_ROUTES[0].value,
  customRoute: "",
  isPopup: true,
  isActive: true,
};

export default function AdminDashboardsPage() {
  const [items, setItems] = useState<BannerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  async function load() {
    const res = await fetch("/api/admin/dashboards");
    if (res.ok) {
      const data = await res.json();
      setItems(data.dashboards ?? []);
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

  function startEdit(b: BannerDto) {
    const known = BANNER_ROUTES.some((r) => r.value === b.route);
    setForm({
      title: b.title ?? "",
      imageUrl: b.imageUrl,
      route: known ? b.route : "__custom__",
      customRoute: known ? "" : b.route,
      isPopup: b.isPopup,
      isActive: b.isActive,
    });
    setEditingId(b.id);
    setShowForm(true);
  }

  function reset() {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(false);
  }

  const routeValue = form.route === "__custom__" ? form.customRoute : form.route;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const payload = {
      title: form.title,
      imageUrl: form.imageUrl,
      route: routeValue,
      isPopup: form.isPopup,
      isActive: form.isActive,
    };
    const url = editingId ? `/api/admin/dashboards/${editingId}` : "/api/admin/dashboards";
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
    setMessage(editingId ? "Dashboard updated." : "Dashboard created.");
    reset();
    await load();
  }

  async function toggle(b: BannerDto) {
    const res = await fetch(`/api/admin/dashboards/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !b.isActive }),
    });
    if (res.ok) await load();
  }

  async function remove(b: BannerDto) {
    if (!confirm("Delete this dashboard?")) return;
    const res = await fetch(`/api/admin/dashboards/${b.id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  if (loading) return <div className="p-10 text-center">Loading dashboards…</div>;

  const inputCls = "w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm";
  const labelCls = "block text-sm font-medium mb-1";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboards</h1>

      {message && <div className="mb-4 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm">{message}</div>}

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => (showForm ? reset() : setShowForm(true))}
          className="bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm"
        >
          {showForm ? "Close" : "+ Add dashboard"}
        </button>
        <span className="text-sm text-neutral-500">{items.length} display(s)</span>
      </div>

{showForm && (
        <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit dashboard" : "Add dashboard"}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Title (optional)</label>
              <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Image URL (uploaded photo) *</label>
              <input
                className={inputCls}
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://…/photo.jpg"
                required
              />
            </div>
            <div>
              <label className={labelCls}>Route when clicked *</label>
              <select
                className={inputCls + " bg-white"}
                value={form.route}
                onChange={(e) => set("route", e.target.value)}
              >
                {BANNER_ROUTES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            {form.route === "__custom__" && (
              <div>
                <label className={labelCls}>Custom URL *</label>
                <input
                  className={inputCls}
                  value={form.customRoute}
                  onChange={(e) => set("customRoute", e.target.value)}
                  placeholder="/products?category=hoodies"
                  required
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isPopup} onChange={(e) => set("isPopup", e.target.checked)} />
              Show as popup
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
              Active
            </label>
          </div>

          <div className="mt-5 flex gap-2">
            <button type="submit" className="bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm font-medium">
              {editingId ? "Save changes" : "Add dashboard"}
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
              className="mt-4 h-40 w-full object-cover rounded-xl"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
          )}
        </form>
      )}

      <div className="space-y-2">
        {items.length === 0 && <p className="text-neutral-500">No dashboards yet — add one above.</p>}
        {items.map((b) => (
          <div key={b.id} className="bg-white rounded-xl shadow px-4 py-3 flex items-center justify-between gap-4">
            {b.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.imageUrl} alt={b.title ?? "dashboard"} className="w-20 h-14 object-cover rounded-lg shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{b.title || "Untitled"}</div>
              <div className="text-xs text-neutral-500 truncate">
                → {b.route}
                {b.isPopup ? " · popup" : ""}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-1 rounded-full text-xs ${b.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-600"}`}>
                {b.isActive ? "Active" : "Inactive"}
              </span>
              <button onClick={() => startEdit(b)} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200">
                Edit
              </button>
              <button onClick={() => toggle(b)} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200">
                {b.isActive ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => remove(b)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}