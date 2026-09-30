"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProductDto } from "@/lib/types";

interface Seller {
  id: string;
  email: string;
  name: string;
  storeName: string | null;
  storeCategory: string | null;
  avatarUrl: string | null;
  bio: string | null;
  sellerStatus: string;
  createdAt: string;
  listingsCount: number;
  activeListings: number;
  salesCount: number;
  unitsSold: number;
  revenue: number;
}

interface Listing extends ProductDto {
  sellerName: string;
}

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  suspended: "bg-red-100 text-red-700",
  requested: "bg-amber-100 text-amber-700",
  none: "bg-neutral-200 text-neutral-600",
};

const statusClass = (s: string) => STATUS_BADGE[s] ?? "bg-neutral-200 text-neutral-600";

export default function AdminMarketplacePage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  async function load() {
    const qs = new URLSearchParams();
    if (search.trim()) qs.set("search", search.trim());
    if (status !== "all") qs.set("status", status);
    const res = await fetch(`/api/admin/marketplace?${qs.toString()}`);
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

  // Reload when the status filter changes.
  useEffect(() => {
    void load();
  }, [status]);

  // Debounce search input.
  useEffect(() => {
    const t = setTimeout(() => void load(), 300);
    return () => clearTimeout(t);
  }, [search]);

  async function setSellerStatus(seller: Seller, newStatus: string) {
    const res = await fetch(`/api/admin/users/${seller.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerStatus: newStatus }),
    });
    if (res.ok) {
      setMessage(
        newStatus === "active"
          ? `Seller "${seller.storeName || seller.name}" approved.`
          : `Seller "${seller.storeName || seller.name}" suspended.`
      );
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

  const thCls = "text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-3 py-2";
  const tdCls = "px-3 py-3 text-sm align-middle";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Marketplace</h1>

      {message && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm">
          {message}
          <button className="ml-2 text-neutral-300 hover:text-white" onClick={() => setMessage(null)}>✕</button>
        </div>
      )}

      {/* Toolbar: search + filter + count */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search seller, store, email or category…"
          className="border border-neutral-300 rounded-lg px-3 py-2 text-sm w-72"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="requested">Requested</option>
          <option value="suspended">Suspended</option>
          <option value="none">None</option>
        </select>
        <span className="text-sm text-neutral-500">
          {sellers.length} seller{sellers.length === 1 ? "" : "s"}
          {status !== "all" ? ` · ${status}` : ""}
        </span>
      </div>
{/* Sellers table */}
      <h2 className="text-xl font-semibold mb-3">Sellers</h2>
      {sellers.length === 0 ? (
        <p className="text-neutral-500 mb-8">No sellers match your filters.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow mb-8">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className={thCls}>Seller</th>
                <th className={thCls}>Contact</th>
                <th className={thCls}>Category</th>
                <th className={thCls}>Status</th>
                <th className={`${thCls} text-center`}>Listings</th>
                <th className={`${thCls} text-center`}>Sales</th>
                <th className={`${thCls} text-right`}>Revenue</th>
                <th className={thCls}>Joined</th>
                <th className={`${thCls} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sellers.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50">
                  <td className={tdCls}>
                    <div className="flex items-center gap-2">
                      {s.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600">
                          {(s.storeName || s.name).slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{s.storeName || s.name}</div>
                        <div className="text-xs text-neutral-400">{s.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className={tdCls}>
                    <span className="text-xs text-neutral-500">{s.email}</span>
                  </td>
                  <td className={tdCls}>
                    <span className="text-xs text-neutral-500">{s.storeCategory || "—"}</span>
                  </td>
                  <td className={tdCls}>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusClass(s.sellerStatus)}`}>
                      {s.sellerStatus}
                    </span>
                  </td>
                  <td className={`${tdCls} text-center`}>
                    <span className="font-medium">{s.activeListings}</span>
                    <span className="text-neutral-400">/{s.listingsCount}</span>
                  </td>
                  <td className={`${tdCls} text-center`}>
                    <span className="font-medium">{s.salesCount}</span>
                    <span className="text-neutral-400"> ({s.unitsSold} units)</span>
                  </td>
                  <td className={`${tdCls} text-right font-medium`}>{s.revenue} DH</td>
                  <td className={`${tdCls} text-xs text-neutral-500`}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className={`${tdCls} text-right whitespace-nowrap`}>
                    <Link
                      href={`/admin/marketplace/sellers/${s.id}`}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800"
                    >
                      View
                    </Link>
                    {s.sellerStatus !== "active" ? (
                      <button
                        onClick={() => setSellerStatus(s, "active")}
                        className="ml-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => setSellerStatus(s, "suspended")}
                        className="ml-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
{/* Listings table */}
      <h2 className="text-xl font-semibold mb-3">Listings</h2>
      {listings.length === 0 ? (
        <p className="text-neutral-500">No marketplace listings yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className={thCls}>Product</th>
                <th className={thCls}>Seller</th>
                <th className={`${thCls} text-right`}>Price</th>
                <th className={`${thCls} text-center`}>Status</th>
                <th className={`${thCls} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-neutral-50">
                  <td className={tdCls}>
                    <div className="flex items-center gap-3">
                      {l.images[0]?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.images[0].url} alt={l.name} className="w-10 h-10 object-cover rounded-lg" />
                      )}
                      <span className="font-medium">{l.name}</span>
                    </div>
                  </td>
                  <td className={tdCls}>
                    <span className="text-xs text-neutral-500">{l.sellerName}</span>
                  </td>
                  <td className={`${tdCls} text-right font-medium`}>{l.price} {l.currency}</td>
                  <td className={`${tdCls} text-center`}>
                    <span className={`px-2 py-1 rounded-full text-xs ${l.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-600"}`}>
                      {l.isActive ? "Live" : "Hidden"}
                    </span>
                  </td>
                  <td className={`${tdCls} text-right whitespace-nowrap`}>
                    <button onClick={() => toggleListing(l)} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200">
                      {l.isActive ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => removeListing(l)}
                      className="ml-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}