"use client";

import { useEffect, useState } from "react";
import type { OrderDto, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-sky-100 text-sky-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-neutral-200 text-neutral-600",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  async function setStatus(order: OrderDto, status: OrderStatus) {
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) await load();
  }

  if (loading) return <div className="p-10 text-center">Loading orders…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-neutral-500">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-semibold">#{o.orderNumber}</span>
                  <span className="text-sm text-neutral-500 ml-3">
                    {new Date(o.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>
                    {o.status}
                  </span>
                  <select
                    value={o.status}
                    onChange={(e) => setStatus(o, e.target.value as OrderStatus)}
                    className="border border-neutral-300 rounded-lg px-2 py-1 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-sm text-neutral-600 mb-2">
                {o.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {i.name} × {i.quantity}
                      {i.size ? ` · ${i.size}` : ""}
                      {i.color ? ` (${i.color})` : ""}
                    </span>
                    <span>{i.total} {o.currency}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t border-neutral-100 pt-2 text-sm">
                <span>
                  Subtotal {o.subtotal} · Shipping {o.shippingCost}
                </span>
                <span className="font-semibold">Total: {o.total} {o.currency}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}