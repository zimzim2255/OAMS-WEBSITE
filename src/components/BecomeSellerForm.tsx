"use client";

import { useState } from "react";
import { STORE_CATEGORIES } from "@/lib/store-categories";

export interface SellerUser {
  role: string;
  sellerStatus: string;
  storeName?: string;
  storeCategory?: string;
  avatarUrl?: string | null;
}

export default function BecomeSellerForm({
  onDone,
}: {
  onDone: (user: SellerUser) => void;
}) {
  const [storeName, setStoreName] = useState("");
  const [storeCategory, setStoreCategory] = useState(STORE_CATEGORIES[0]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Logo upload failed");
        return;
      }
      const img = (data.images?.[0] ?? {}) as { url?: string };
      if (img.url) setAvatarUrl(img.url);
    } catch {
      setError("Logo upload failed. Try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/become-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, storeCategory, avatarUrl: avatarUrl || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not switch to seller");
        return;
      }
      onDone(data.user);
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Brand name</label>
        <input
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Your brand or store name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Store category</label>
        <select
          value={storeCategory}
          onChange={(e) => setStoreCategory(e.target.value)}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          {STORE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Store logo *</label>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 cursor-pointer bg-neutral-100 hover:bg-neutral-200 rounded-lg px-4 py-2 text-sm text-neutral-700">
            <input type="file" accept="image/*" className="sr-only" onChange={uploadLogo} />
            {uploading ? "Uploading…" : "📷 Browse logo"}
          </label>
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="logo preview" className="w-10 h-10 rounded-full object-cover border border-neutral-200" />
          )}
        </div>
        <p className="text-xs text-neutral-400 mt-1">Shown next to your products on the marketplace.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="bg-[#D96BA8] hover:opacity-90 disabled:opacity-50 text-white rounded-lg px-5 py-2 text-sm font-semibold"
      >
        {busy ? "Saving…" : "Open my store"}
      </button>
    </form>
  );
}