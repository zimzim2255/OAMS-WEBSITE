"use client";

import { useEffect, useState } from "react";
import type { ProductDto } from "@/lib/types";

interface Stat {
  productId: string;
  stock: number;
  sold: number;
  revenue: number;
  views: number;
  clicks: number;
}

interface FormState {
  name: string;
  category: string;
  price: string;
  originalPrice: string;
  brand: string;
  description: string;
  sizes: string;
  colors: string;
  stockText: string;
  images: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  category: "",
  price: "",
  originalPrice: "",
  brand: "",
  description: "",
  sizes: "",
  colors: "",
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

function stockToText(stock?: Record<string, number>): string {
  return Object.entries(stock ?? {})
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

function splitList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

interface ImageInput {
  url: string;
  size?: string;
  color?: string;
  price?: number;
}

interface Variant {
  id: string;
  url: string;
  color: string;
  size: string;
  price: string;
}

function buildPayload(form: FormState, imageInputs: ImageInput[]) {
  return {
    name: form.name,
    category: form.category,
    price: Number(form.price),
    originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
    brand: form.brand || undefined,
    description: form.description,
    sizes: splitList(form.sizes),
    colors: splitList(form.colors),
    stock: parseStock(form.stockText),
    images: imageInputs,
  };
}

let nextVariantId = 0;

function productToForm(p: ProductDto): FormState {
  return {
    name: p.name,
    category: p.category,
    price: String(p.price),
    originalPrice: p.originalPrice ? String(p.originalPrice) : "",
    brand: p.brand ?? "",
    description: p.description,
    sizes: p.sizes.join(", "),
    colors: p.colors.join(", "),
    stockText: stockToText(p.stock),
    images: p.images.map((i) => i.url).join("\n"),
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [stats, setStats] = useState<Record<string, Stat>>({});
  const [selected, setSelected] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [flatImages, setFlatImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [uploading, setUploading] = useState(false);

  async function refresh() {
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (category && category !== "all") qs.set("category", category);
    qs.set("page", String(page));
    qs.set("pageSize", String(pageSize));
    const res = await fetch(`/api/admin/products?${qs.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products ?? []);
      setTotal(data.total ?? 0);
      setCategories(data.categories ?? []);
    }
  }

  // Load product stats once.
  useEffect(() => {
    (async () => {
      const sres = await fetch("/api/admin/products/stats");
      if (sres.ok) {
        const sdata = await sres.json();
        const map: Record<string, Stat> = {};
        for (const s of sdata.stats ?? []) map[s.productId] = s;
        setStats(map);
      }
    })();
  }, []);

  // Reload the (filtered) list when filters or page change.
  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, page, pageSize]);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const imageInputs: ImageInput[] = [
      ...splitList(form.images).map((url) => ({ url })),
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
    const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(form, imageInputs)),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? (editingId ? "Failed to update product" : "Failed to add product"));
      return;
    }
    setMessage(editingId ? "Product updated." : "Product added.");
    setForm(EMPTY_FORM);
    setFlatImages([]);
    setVariants([]);
    setEditingId(null);
    setShowForm(false);
    await refresh();
  }

  function startEdit(p: ProductDto) {
    setEditingId(p.id);
    // The pasted-URL field is kept empty on edit; existing images are split
    // into the browsed list (plain images) and variant photos (size/color/price).
    setForm({ ...productToForm(p), images: "" });
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
    setShowForm(true);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFlatImages([]);
    setVariants([]);
    setShowForm(false);
    setMessage(null);
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
      setFlatImages((prev) => [...prev, ...imgs.map((img) => img.url)]);
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

  async function toggleActive(p: ProductDto) {
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    if (res.ok) await refresh();
  }

  async function remove(p: ProductDto) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    if (res.ok) await refresh();
  }

  if (loading) return <div className="p-10 text-center">Loading products…</div>;

  const inputCls = "w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm";
  const labelCls = "block text-sm font-medium mb-1";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {message && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm">
          {message}
        </div>
      )}

      {/* Toolbar: search, category filter, add button */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search products…"
          className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setEditingId(null);
            setForm(EMPTY_FORM);
            setFlatImages([]);
            setVariants([]);
            setMessage(null);
            setShowForm((v) => !v);
          }}
          className="bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap"
        >
          {showForm ? "Close form" : "+ Add Product"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">{editingId ? "Edit product" : "Add a product"}</h2>
            <button
              type="button"
              onClick={cancelEdit}
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
                <input className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)} required placeholder="shorts" />
              </div>
              <div>
                <label className={labelCls}>Price (MAD) *</label>
                <input className={inputCls} type="number" value={form.price} onChange={(e) => set("price", e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Original price (sale)</label>
                <input className={inputCls} type="number" value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Brand</label>
                <input className={inputCls} value={form.brand} onChange={(e) => set("brand", e.target.value)} />
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
                        <label className="inline-flex items-center gap-2 cursor-pointer bg-neutral-100 hover:bg-neutral-200 rounded-lg px-4 py-2 text-sm text-neutral-700">
                          <input type="file" accept="image/*" className="sr-only" onChange={(e) => uploadVariant(v.id, e)} />
                          {v.url ? "Change photo" : "📷 Browse photo"}
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
          </div>
          <button type="submit" className="mt-6 bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm font-medium w-fit">
            {editingId ? "Save changes" : "Save product"}
          </button>
        </form>
      )}

      {/* Result count + pagination */}
      <div className="flex items-center justify-between mt-4 mb-2 text-sm">
        <span className="text-neutral-500">
          Showing {products.length} of {total} product{total === 1 ? "" : "s"}
        </span>
        <div className="flex gap-2 items-center">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border border-neutral-300 rounded-lg px-2 py-1 text-sm bg-white"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-3 py-1.5">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * pageSize >= total}
            className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

<div className="space-y-2">
        {products.length === 0 && <p className="text-neutral-500">No products yet.</p>}
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {p.images[0]?.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0].url} alt={p.name} className="w-12 h-12 object-cover rounded-lg" />
              )}
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-neutral-500">
                  {p.category} · {p.price} {p.currency}
                </div>
                <div className="text-xs text-neutral-500">
                  In stock: {stats[p.id]?.stock ?? 0} · Sold: {stats[p.id]?.sold ?? 0} · {stats[p.id]?.views ?? 0} views
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-1 rounded-full text-xs ${p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-600"}`}>
                {p.isActive ? "Active" : "Hidden"}
              </span>
              <button onClick={() => setSelected(p)} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200">
                View
              </button>
              <button onClick={() => toggleActive(p)} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200">
                {p.isActive ? "Hide" : "Show"}
              </button>
              <button onClick={() => startEdit(p)} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200">
                Edit
              </button>
              <button onClick={() => remove(p)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold">{selected.name}</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-neutral-400 hover:text-neutral-700 text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-neutral-100 rounded-lg p-3">
                <div className="text-lg font-bold">{stats[selected.id]?.stock ?? 0}</div>
                <div className="text-xs text-neutral-500">Total stock</div>
              </div>
              <div className="bg-neutral-100 rounded-lg p-3">
                <div className="text-lg font-bold">{stats[selected.id]?.sold ?? 0}</div>
                <div className="text-xs text-neutral-500">Sold</div>
              </div>
              <div className="bg-neutral-100 rounded-lg p-3">
                <div className="text-lg font-bold">{stats[selected.id]?.revenue ?? 0}</div>
                <div className="text-xs text-neutral-500">Revenue</div>
              </div>
              <div className="bg-neutral-100 rounded-lg p-3">
                <div className="text-lg font-bold">{stats[selected.id]?.views ?? 0}</div>
                <div className="text-xs text-neutral-500">Views</div>
              </div>
              <div className="bg-neutral-100 rounded-lg p-3">
                <div className="text-lg font-bold">{stats[selected.id]?.clicks ?? 0}</div>
                <div className="text-xs text-neutral-500">Clicks</div>
              </div>
              <div className="bg-neutral-100 rounded-lg p-3">
                <div className="text-lg font-bold">{selected.images.length}</div>
                <div className="text-xs text-neutral-500">Images</div>
              </div>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div>
                <span className="inline-block w-28 font-medium">Category</span>
                {selected.category}
              </div>
              <div>
                <span className="inline-block w-28 font-medium">Price</span>
                {selected.price} {selected.currency}
                {selected.originalPrice ? ` (was ${selected.originalPrice})` : ""}
              </div>
              {selected.brand && (
                <div>
                  <span className="inline-block w-28 font-medium">Brand</span>
                  {selected.brand}
                </div>
              )}
              <div>
                <span className="inline-block w-28 font-medium">Sizes</span>
                {selected.sizes.join(", ") || "—"}
              </div>
              <div>
                <span className="inline-block w-28 font-medium">Colors</span>
                {selected.colors.join(", ") || "—"}
              </div>
              <div>
                <span className="inline-block w-28 font-medium">Status</span>
                {selected.isActive ? "Active" : "Hidden"}
                {selected.marketplaceEnabled ? " · Marketplace" : ""}
              </div>
              <div>
                <span className="inline-block w-28 font-medium align-top">Description</span>
              </div>
              <p className="text-neutral-600">{selected.description}</p>
            </div>

            {Object.keys(selected.stock ?? {}).length > 0 && (
              <div className="border-t border-neutral-100 pt-3">
                <div className="text-sm font-medium mb-2">Stock by color</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selected.stock ?? {}).map(([color, qty]) => (
                    <div key={color} className="flex justify-between bg-neutral-50 rounded px-3 py-2 text-sm">
                      <span>{color}</span>
                      <span className={qty > 0 ? "font-semibold" : "text-red-500"}>{qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}