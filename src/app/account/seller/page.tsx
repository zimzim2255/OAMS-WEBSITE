"use client";

import { useEffect, useState } from "react";
import type { SellerStatsDto } from "@/lib/types";

export default function AccountSellerPage() {
  const [isSeller, setIsSeller] = useState(false);
  const [summary, setSummary] = useState<SellerStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch("/api/auth/me").then((r) => r.json());
        const u = me.user;
        const sell = Boolean(u && (u.role === "SELLER" || u.sellerStatus === "active"));
        setIsSeller(sell);
        if (sell) {
          const res = await fetch("/api/marketplace/stats");
          if (res.ok) {
            const data = await res.json();
            setSummary(data.summary);
          }
        }
      } catch {
        // ignore
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-center py-10 text-neutral-500">Loading…</p>;

  if (!isSeller) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center text-neutral-500">
        Become a seller to see your sales dashboard.
      </div>
    );
  }

  if (!summary) {
    return <div className="bg-white rounded-2xl shadow p-8 text-center text-neutral-500">No data yet.</div>;
  }

  const cards = [
    { label: "Clicks", value: summary.totalClicks },
    { label: "Views", value: summary.totalViews },
    { label: "Added to cart", value: summary.totalAddToCarts },
    { label: "Sales", value: summary.totalSales },
    { label: "Revenue", value: summary.totalRevenue },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Seller dashboard</h2>
        <span className="text-sm text-neutral-500">All time</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl shadow p-4">
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-sm text-neutral-500">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 font-semibold">Product performance</div>
        {summary.products.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500">No products yet — add one from My products.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="text-left font-medium px-5 py-2">Product</th>
                <th className="text-right font-medium px-3 py-2">Clicks</th>
                <th className="text-right font-medium px-3 py-2">Views</th>
                <th className="text-right font-medium px-3 py-2">Sold</th>
                <th className="text-right font-medium px-5 py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {summary.products.map((p) => (
                <tr key={p.productId} className="border-t border-neutral-100">
                  <td className="px-5 py-3">{p.name}</td>
                  <td className="text-right px-3 py-3">{p.clicks}</td>
                  <td className="text-right px-3 py-3">{p.views}</td>
                  <td className="text-right px-3 py-3">{p.sales}</td>
                  <td className="text-right px-5 py-3 font-semibold">MAD {p.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}