"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProductDto, OrderStatus } from "@/lib/types";

interface SellerDetail {
  id: string;
  email: string;
  name: string;
  storeName: string | null;
  storeCategory: string | null;
  avatarUrl: string | null;
  bio: string | null;
  sellerStatus: string;
  createdAt: string;
  updatedAt: string;
  totalProducts: number;
  activeProducts: number;
  revenue: number;
  unitsSold: number;
  salesCount: number;
  ordersCount: number;
}

interface Listing extends ProductDto {
  sellerName: string;
}

interface Sale {
  id: string;
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  trackingNumber: string | null;
  currency: string;
  customer: { name?: string; email?: string } | null;
  name: string;
  quantity: number;
  price: number;
  total: number;
  size: string | null;
  color: string | null;
}

const sBadge = (status: string) =>
  status === "active"
    ? "bg-emerald-100 text-emerald-700"
    : status === "suspended"
    ? "bg-red-100 text-red-700"
    : status === "requested"
    ? "bg-amber-100 text-amber-700"
    : "bg-neutral-200 text-neutral-600";

const orderBadge: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-sky-100 text-sky-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-neutral-200 text-neutral-600",
};

export default function AdminSellerDetailClient({ id }: { id: string }) {
  const [data, setData] = useState<{ seller: SellerDetail; listings: Listing[]; sales: Sale[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/admin/marketplace/sellers/${encodeURIComponent(id)}`);
    if (res.ok) {
      setData(await res.json());
    } else if (res.status === 404) {
      setNotFound(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [id]);

  async function setSellerStatus(newStatus: string) {
    if (!data) return;
    const res = await fetch(`/api/admin/users/${data.seller.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerStatus: newStatus }),
    });
    if (res.ok) {
      setMessage(newStatus === "active" ? "Seller approved." : "Seller suspended.");
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
    if (!confirm(`Delete the listing "${listing.name}"?`)) return;
    const res = await fetch(`/api/admin/products/${listing.id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  if (loading) return <div className="p-10 text-center">Loading seller…</div>;
  if (notFound || !data) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center">
        <p className="text-lg font-semibold mb-2">Seller not found</p>
        <Link href="/admin/marketplace" className="inline-block mt-4 text-sm text-neutral-700 underline">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const seller = data.seller;

  const stat = (label: string, value: string) => (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-neutral-500">{label}</div>
    </div>
  );
return (
    <div>
      <p className="mb-4">
        <Link href="/admin/marketplace" className="text-sm text-neutral-700 underline">
          ← Marketplace
        </Link>
      </p>

      <h1 className="text-2xl font-bold mb-6">{seller.storeName || seller.name}</h1>

      {message && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm">
          {message}
          <button className="ml-2 text-neutral-300 hover:text-white" onClick={() => setMessage(null)}>✕</button>
        </div>
      )}

      {/* Profile */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="flex flex-wrap items-start gap-4">
          {seller.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={seller.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center text-xl font-bold text-neutral-600">
              {(seller.storeName || seller.name).slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-lg font-semibold">{seller.storeName || seller.name}</div>
            <div className="text-sm text-neutral-500">
              {seller.name} · {seller.email}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              {seller.storeCategory ? `Category: ${seller.storeCategory} · ` : ""}Joined{" "}
              {new Date(seller.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${sBadge(seller.sellerStatus)}`}>
              {seller.sellerStatus}
            </span>
            {seller.sellerStatus !== "active" ? (
              <button
                onClick={() => setSellerStatus("active")}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Approve
              </button>
            ) : (
              <button
                onClick={() => setSellerStatus("suspended")}
                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
              >
                Suspend
              </button>
            )}
          </div>
        </div>
        {seller.bio && <p className="text-sm text-neutral-600 mt-3">{seller.bio}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {stat("Listings", `${seller.activeProducts}/${seller.totalProducts}`)}
        {stat("Orders", String(seller.ordersCount))}
        {stat("Items sold", String(seller.unitsSold))}
        {stat("Sales (lines)", String(seller.salesCount))}
        {stat("Revenue", `${seller.revenue} DH`)}
      </div>
{/* Listings */}
      <h2 className="text-xl font-semibold mb-3">
        Listed products ({data.listings.length})
      </h2>
      {data.listings.length === 0 ? (
        <p className="text-neutral-500 mb-8">This seller has no listings yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow mb-8">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-3 py-2">Product</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-3 py-2">Category</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 px-3 py-2">Price</th>
                <th className="text-center text-xs font-semibold uppercase tracking-wider text-neutral-500 px-3 py-2">Status</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.listings.map((l) => (
                <tr key={l.id} className="hover:bg-neutral-50">
                  <td className="px-3 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      {l.images[0]?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.images[0].url} alt={l.name} className="w-10 h-10 object-cover rounded-lg" />
                      )}
                      <span className="font-medium">{l.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-neutral-500">{l.category}</td>
                  <td className="px-3 py-3 text-sm text-right font-medium">{l.price} {l.currency}</td>
                  <td className="px-3 py-3 text-sm text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${l.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-600"}`}>
                      {l.isActive ? "Live" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-right whitespace-nowrap">
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
{/* Sales */}
      <h2 className="text-xl font-semibold mb-3">Sales ({data.sales.length})</h2>
      {data.sales.length === 0 ? (
        <p className="text-neutral-500">No sales yet for this seller.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-3 py-2">Order</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-3 py-2">Date</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-3 py-2">Item</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 px-3 py-2">Qty</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 px-3 py-2">Total</th>
                <th className="text-center text-xs font-semibold uppercase tracking-wider text-neutral-500 px-3 py-2">Status</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-3 py-2">Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.sales.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50">
                  <td className="px-3 py-3 text-xs font-medium">#{s.orderNumber}</td>
                  <td className="px-3 py-3 text-xs text-neutral-500">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    {s.name}
                    {s.size ? ` · ${s.size}` : ""}
                    {s.color ? ` (${s.color})` : ""}
                  </td>
                  <td className="px-3 py-3 text-sm text-right">{s.quantity}</td>
                  <td className="px-3 py-3 text-sm text-right font-medium">{s.total} {s.currency}</td>
                  <td className="px-3 py-3 text-sm text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${orderBadge[s.status] ?? "bg-neutral-200 text-neutral-600"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-neutral-500">
                    {s.trackingNumber || "—"}
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