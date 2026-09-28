"use client";

import { useEffect, useState } from "react";
import type { ProductDto } from "@/lib/types";

interface Seller {
  id: string;
  email: string;
  name: string;
  storeName: string | null;
  sellerStatus: string;
  createdAt: string;
}

interface Listing extends ProductDto {
  sellerName: string;
}

export default function AdminMarketplacePage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/marketplace");
    if (res.ok) {
      const data = await res.json();
      setSellers(data.sellers ?? []);
      setListings(data.listings ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  async function setSellerStatus(seller: Seller, status: string) {
    const res = await fetch(`/api/admin/users/${seller.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerStatus: status }),
    });
    if (res.ok) {
      setMessage(status === "active" ? `Seller "${seller.name}" approved.` : `Seller "${seller.name}" suspended.`);
      await load();
    }
  }

  async function toggleListing(listing: Listing) {
    const res = await fetch(`/api/admin/products/${listing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !listing.isActive }),
    });
    if (res.ok) await load();
  }

  async function removeListing(listing: Listing) {
    if (!confirm(`Delete the listing "${listing.name}" (by ${listing.sellerName})?`)) return;
    const res = await fetch(`/api/admin/products/${listing.id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  if (loading) return <div className="p-10 text-center">Loading marketplace…</div>;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: "bg-emerald-100 text-emerald-700",
      suspended: "bg-red-100 text-red-700",
      requested: "bg-amber-100 text-amber-700",
    };
    return map[status] ?? "bg-neutral-200 text-neutral-600";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Marketplace</h1>

      {message && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm">{message}</div>
      )}

      <h2 className="text-xl font-semibold mb-3">Sellers</h2>
      {sellers.length === 0 ? (
        <p className="text-neutral-500 mb-6">No sellers yet.</p>
      ) : (
        <div className="space-y-2 mb-8">
          {sellers.map((s) => (
            <div key={s.id} className="bg-white rounded-xl shadow px-4 py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{s.storeName || s.name}</div>
                <div className="text-sm text-neutral-500">{s.email}</div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(s.sellerStatus)}`}>
                  {s.sellerStatus}
                </span>
                {s.sellerStatus !== "active" ? (
                  <button
                    onClick={() => setSellerStatus(s, "active")}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                ) : (
                  <button
                    onClick={() => setSellerStatus(s, "suspended")}
                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-3">Listings</h2>
      {listings.length === 0 ? (
        <p className="text-neutral-500">No marketplace listings yet.</p>
      ) : (
        <div className="space-y-2">
          {listings.map((l) => (
            <div key={l.id} className="bg-white rounded-xl shadow px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {l.images[0]?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.images[0].url} alt={l.name} className="w-12 h-12 object-cover rounded-lg" />
                )}
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-sm text-neutral-500">
                    by {l.sellerName} · {l.price} {l.currency}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${l.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-600"}`}>
                  {l.isActive ? "Live" : "Hidden"}
                </span>
                <button onClick={() => toggleListing(l)} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200">
                  {l.isActive ? "Hide" : "Show"}
                </button>
                <button onClick={() => removeListing(l)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
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