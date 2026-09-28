"use client";

import { useEffect, useState } from "react";
import type { ProductDto } from "@/lib/types";
import BecomeSellerForm from "@/components/BecomeSellerForm";

interface FormState {
  name: string;
  category: string;
  price: string;
  description: string;
  stockText: string;
  images: string;
}

const EMPTY: FormState = { name: "", category: "", price: "", description: "", stockText: "", images: "" };

function parseStock(text: string): Record<string, number> {
  const out: Record<string, number> = {};
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [color, qty] = line.split(":").map((s) => s.trim());
      if (color && qty !== undefined) out[color] = Number(qty) || 0;
    });
  return out;
}

function splitList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AccountMyProductsPage() {
  const [role, setRole] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [message, setMessage] = useState<string | null>(null);

  async function loadProducts() {
    const res = await fetch("/api/marketplace/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products ?? []);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch("/api/auth/me").then((r) => r.json());
        setRole(me.user?.role ?? null);
        if (me.user?.role === "SELLER") await loadProducts();
      } catch {
        // ignore
      }
      setLoading(false);
    })();
  }, []);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function switchBack() {
    const res = await fetch("/api/account/back-to-user", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setRole(data.user.role);
      setMessage("Switched back to a personal account.");
    }
  }

  function onSellerDone(u: { role: string }) {
    setRole(u.role);
    setMessage("You are now a seller — add your first product.");
    loadProducts();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/marketplace/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        price: Number(form.price),
        description: form.description,
        stock: parseStock(form.stockText),
        images: splitList(form.images),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Failed to add product");
      return;
    }
    setMessage("Product added.");
    setForm(EMPTY);
    setShowForm(false);
    await loadProducts();
  }

  async function toggleActive(p: ProductDto) {
    const res = await fetch(`/api/marketplace/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    if (res.ok) await loadProducts();
  }

  async function remove(p: ProductDto) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const res = await fetch(`/api/marketplace/products/${p.id}`, { method: "DELETE" });
    if (res.ok) await loadProducts();
  }

  if (loading) return <p className="text-center py-10 text-neutral-500">Loading…</p>;

  const inputCls = "w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm";
  const labelCls = "block text-sm font-medium mb-1";

  if (role !== "SELLER") {
    return (
      <div className="bg-white rounded-2xl shadow p-8">
        <p className="text-lg font-semibold mb-2">Sell on OAMS Marketplace</p>
        <p className="text-sm text-neutral-500 mb-4">
          List your products, reach buyers, and track clicks, views and sales — like Etsy.
        </p>
        <div className="max-w-md mx-auto text-left">
          <div className="text-sm font-medium text-neutral-700 mb-2">Open your store</div>
          <BecomeSellerForm onDone={onSellerDone} />
        </div>
        {message && <p className="text-sm text-neutral-500 mt-3 text-center">{message}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">My products</h2>
        <div className="flex gap-2">
          <button
            onClick={switchBack}
            className="text-sm text-neutral-600 border border-neutral-300 rounded-lg px-3 py-2 hover:bg-neutral-100"
          >
            Switch to personal account
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm"
          >
            {showForm ? "Close" : "+ Add product"}
          </button>
        </div>
      </div>
      {message && <div className="mb-4 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm">{message}</div>}

{showForm && (
        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="grid gap-4">
            <div>
              <label className={labelCls}>Name *</label>
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Category *</label>
                <input className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Price (MAD) *</label>
                <input className={inputCls} type="number" value={form.price} onChange={(e) => set("price", e.target.value)} required />
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Stock (Color: qty per line)</label>
                <textarea className={inputCls} rows={3} value={form.stockText} onChange={(e) => set("stockText", e.target.value)} placeholder="Black: 10" />
              </div>
              <div>
                <label className={labelCls}>Image URLs (one per line)</label>
                <textarea className={inputCls} rows={3} value={form.images} onChange={(e) => set("images", e.target.value)} />
              </div>
            </div>
            <button type="submit" className="bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm font-medium w-fit">
              Save product
            </button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <p className="text-neutral-500">You have no products yet.</p>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {p.images[0]?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0].url} alt={p.name} className="w-12 h-12 object-cover rounded-lg" />
                )}
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-neutral-500">{p.category} · {p.price} {p.currency}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-600"}`}>
                  {p.isActive ? "Live" : "Hidden"}
                </span>
                <button onClick={() => toggleActive(p)} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200">
                  {p.isActive ? "Hide" : "Show"}
                </button>
                <button onClick={() => remove(p)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}