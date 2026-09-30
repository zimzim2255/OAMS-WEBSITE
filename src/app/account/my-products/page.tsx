"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProductDto } from "@/lib/types";

interface FormState {
  name: string;
  category: string;
  price: string;
  description: string;
  colors: string;
  sizes: string;
  stockText: string;
  images: string;
}

const EMPTY: FormState = {
  name: "",
  category: "",
  price: "",
  description: "",
  colors: "",
  sizes: "",
  stockText: "",
  images: "",
};

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

let nextVariantId = 0;

export default function AccountMyProductsPage() {
  const [isSeller, setIsSeller] = useState(false);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [message, setMessage] = useState<string | null>(null);
  const [flatImages, setFlatImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<
    { id: string; url: string; color: string; size: string; price: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);

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
        const u = me.user;
        const isSell = u?.role === "SELLER" || u?.sellerStatus === "active";
        setIsSeller(Boolean(isSell));
        if (isSell) await loadProducts();
      } catch {
        // ignore
      }
      setLoading(false);
    })();
  }, []);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openForm() {
    setEditingId(null);
    setForm(EMPTY);
    setFlatImages([]);
    setVariants([]);
    setMessage(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setEditingId(null);
    setForm(EMPTY);
    setFlatImages([]);
    setVariants([]);
    setShowForm(false);
  }

  // Load an existing product's data into the form for editing.
  function startEdit(p: ProductDto) {
    const stockLines = Object.entries(p.stock ?? {})
      .map(([color, qty]) => `${color}: ${qty}`)
      .join("\n");
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      description: p.description,
      colors: (p.colors ?? []).join(", "),
      sizes: (p.sizes ?? []).join(", "),
      stockText: stockLines,
      images: "",
    });
    setFlatImages((p.images ?? []).filter((img) => !img.size && !img.color).map((img) => img.url));
    setVariants(
      (p.images ?? [])
        .filter((img) => img.size || img.color)
        .map((img) => ({
          id: `v${++nextVariantId}`,
          url: img.url,
          color: img.color ?? "",
          size: img.size ?? "",
          price: img.price ? String(img.price) : "",
        }))
    );
    setEditingId(p.id);
    setMessage(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setMessage(null);
    const fd = new FormData();
    files.forEach((f) => fd.append("file", f));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Upload failed");
        return;
      }
      const imgs: { url: string }[] = data.images ?? [];
      const urls = imgs.map((img) => img.url);
      setFlatImages((prev) => [...prev, ...urls]);
    } catch {
      setMessage("Upload failed. Try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { id: `v${++nextVariantId}`, url: "", color: "", size: "", price: "" },
    ]);
  }

  function removeVariant(id: string) {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  }

  function setVariantProp(id: string, key: "color" | "size" | "price", value: string) {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, [key]: value } : v)));
  }

  async function uploadVariant(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
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
      const img = (data.images?.[0] ?? {}) as { url?: string };
      if (img.url) {
        const url = img.url;
        setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, url } : v)));
      }
    } catch {
      setMessage("Upload failed. Try again.");
    } finally {
      e.target.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const imageInputs = [
      ...splitList(form.images).map((u) => ({ url: u })),
      ...flatImages.map((url) => ({ url })),
      ...variants
        .filter((v) => v.url)
        .map((v) => ({
          url: v.url,
          size: v.size || undefined,
          color: v.color || undefined,
          price: v.price ? Number(v.price) || undefined : undefined,
        })),
    ];
    if (imageInputs.length === 0) {
      setMessage("Add at least one photo (browse or paste an image URL).");
      return;
    }
    const url = editingId ? `/api/marketplace/products/${editingId}` : "/api/marketplace/products";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        price: Number(form.price),
        description: form.description,
        colors: splitList(form.colors),
        sizes: splitList(form.sizes),
        stock: parseStock(form.stockText),
        images: imageInputs,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? (editingId ? "Failed to update product" : "Failed to add product"));
      return;
    }
    setMessage(editingId ? "Product updated." : "Product added.");
    setForm(EMPTY);
    setFlatImages([]);
    setVariants([]);
    setEditingId(null);
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

  if (!isSeller) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center">
        <p className="text-lg font-semibold mb-2">Sell on OAMS Marketplace</p>
        <p className="text-sm text-neutral-500 mb-4">
          List your products, reach buyers, and track clicks, views and sales — like Etsy.
        </p>
        <Link
          href="/account/switch-account"
          className="inline-block bg-[#D96BA8] hover:opacity-90 text-white rounded-lg px-5 py-2 text-sm font-semibold"
        >
          Switch to seller
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">My products</h2>
        <div className="flex gap-2">
          <button
          onClick={() => (showForm ? closeForm() : openForm())}
          className="bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm"
        >
          {showForm ? "Close" : "+ Add product"}
        </button>
        </div>
      </div>
      {message && <div className="mb-4 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm">{message}</div>}

{showForm && (
        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{editingId ? "Edit product" : "Add a product"}</h3>
            <button
              type="button"
              onClick={closeForm}
              className="text-sm text-neutral-500 hover:text-neutral-800"
            >
              Cancel
            </button>
          </div>
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
                <label className={labelCls}>Colors *</label>
                <input className={inputCls} value={form.colors} onChange={(e) => set("colors", e.target.value)} placeholder="Black, White, Navy" required />
              </div>
              <div>
                <label className={labelCls}>Sizes *</label>
                <input className={inputCls} value={form.sizes} onChange={(e) => set("sizes", e.target.value)} placeholder="S, M, L, XL" required />
              </div>
            </div>
            <div>
              <label className={labelCls}>Stock (per color: qty per line)</label>
              <textarea className={inputCls} rows={2} value={form.stockText} onChange={(e) => set("stockText", e.target.value)} placeholder="Black: 10" />
            </div>
            <div>
              <label className={labelCls}>Photos *</label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer bg-neutral-100 hover:bg-neutral-200 rounded-lg px-4 py-2 text-sm text-neutral-700">
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={uploadFiles} />
                  {uploading ? "Uploading…" : "📷 Browse images"}
                </label>
                <span className="text-xs text-neutral-400">You can upload more than one image</span>
              </div>

              {flatImages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {flatImages.map((url, i) => (
                    <div key={url} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`photo ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border border-neutral-200" />
                      <button
                        type="button"
                        onClick={() => setFlatImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs leading-none"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3">
                <label className={labelCls}>Or paste image URLs (one per line)</label>
                <textarea className={inputCls} rows={2} value={form.images} onChange={(e) => set("images", e.target.value)} placeholder="/imgs/product.jpg or https://…" />
              </div>

              {/* Variant photos: "+" adds a photo with its own size / color / price */}
              <div className="mt-5 border-t border-neutral-200 pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-700">Variant photos (size / color / price)</p>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 text-white px-3 py-1.5 text-sm"
                  >
                    + Add
                  </button>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Each photo can have its own size, color and price. You can add several photos for the same size.
                </p>

                <div className="mt-3 space-y-3">
                  {variants.length === 0 && (
                    <p className="text-xs text-neutral-400">No variant photos yet — click “+ Add”.</p>
                  )}
                  {variants.map((v, idx) => (
                    <div key={v.id} className="border border-neutral-300 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-neutral-600">Photo {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeVariant(v.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex items-center gap-2 cursor-pointer bg-neutral-100 hover:bg-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-700">
                          <input type="file" accept="image/*" className="sr-only" onChange={(e) => uploadVariant(v.id, e)} />
                          {v.url ? "Change photo" : "📷 Browse"}
                        </label>
                        {v.url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={v.url} alt={`variant ${idx + 1}`} className="w-14 h-14 object-cover rounded-md border border-neutral-200" />
                        )}
                        <input
                          value={v.color}
                          onChange={(e) => setVariantProp(v.id, "color", e.target.value)}
                          placeholder="Color"
                          className="w-28 border border-neutral-300 rounded-lg px-2 py-1.5 text-sm"
                        />
                        <input
                          value={v.size}
                          onChange={(e) => setVariantProp(v.id, "size", e.target.value)}
                          placeholder="Size"
                          className="w-20 border border-neutral-300 rounded-lg px-2 py-1.5 text-sm"
                        />
                        <input
                          value={v.price}
                          type="number"
                          onChange={(e) => setVariantProp(v.id, "price", e.target.value)}
                          placeholder="Price"
                          className="w-24 border border-neutral-300 rounded-lg px-2 py-1.5 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button type="submit" className="bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm font-medium w-fit">
              {editingId ? "Save changes" : "Save product"}
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
                <button onClick={() => startEdit(p)} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200">
                  Edit
                </button>
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