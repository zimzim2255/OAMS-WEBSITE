"use client";

import { useEffect, useState } from "react";
import type { OrderDto, ProductDto } from "@/lib/types";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [o, p] = await Promise.all([
          fetch("/api/admin/orders").then((r) => r.json()),
          fetch("/api/admin/products").then((r) => r.json()),
        ]);
        setOrders(o.orders ?? []);
        setProducts(p.products ?? []);
      } catch {
        // ignore
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading dashboard…</div>;

  const pending = orders.filter((o) => o.status === "PENDING").length;
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const outOfStock = products.filter((p) =>
    Object.values(p.stock ?? {}).every((v) => v <= 0)
  ).length;
  const recent = orders.slice(0, 8);

  const cards = [
    { label: "Products", value: products.length.toString() },
    { label: "Orders", value: orders.length.toString() },
    { label: "Pending", value: pending.toString() },
    { label: "Revenue", value: revenue.toString() },
    { label: "Out of stock", value: outOfStock.toString() },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow p-4">
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-sm text-neutral-500">{c.label}</div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-3">Recent orders</h2>
      {recent.length === 0 ? (
        <p className="text-neutral-500">No orders yet.</p>
      ) : (
        <div className="space-y-2">
          {recent.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-xl shadow px-4 py-3 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">#{o.orderNumber}</div>
                <div className="text-sm text-neutral-500">{o.items.length} item(s)</div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    o.status === "PENDING"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {o.status}
                </span>
                <span className="font-semibold">{o.total} {o.currency}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}