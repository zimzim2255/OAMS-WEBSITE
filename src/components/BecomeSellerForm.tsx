"use client";

import { useState } from "react";
import { STORE_CATEGORIES } from "@/lib/store-categories";

export interface SellerUser {
  role: string;
  sellerStatus: string;
  storeName?: string;
  storeCategory?: string;
}

export default function BecomeSellerForm({
  onDone,
}: {
  onDone: (user: SellerUser) => void;
}) {
  const [storeName, setStoreName] = useState("");
  const [storeCategory, setStoreCategory] = useState(STORE_CATEGORIES[0]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/become-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, storeCategory }),
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