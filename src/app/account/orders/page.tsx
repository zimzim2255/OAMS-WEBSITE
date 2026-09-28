"use client";

import { useEffect, useState } from "react";
import type { OrderDto, OrderStatus } from "@/lib/types";

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-sky-100 text-sky-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-neutral-200 text-neutral-600",
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/account/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders ?? []);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-center py-10 text-neutral-500">Loading orders…</p>;

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center">
        <p className="text-lg font-semibold mb-1">No orders yet</p>
        <p className="text-sm text-neutral-500">Your orders will appear here after you check out.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-semibold">#{o.orderNumber}</span>
              <span className="text-sm text-neutral-500 ml-3">{new Date(o.createdAt).toLocaleDateString()}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>{o.status}</span>
          </div>
          <div className="text-sm text-neutral-600">
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
          <div className="flex justify-between border-t border-neutral-100 pt-2 mt-2 text-sm">
            <span>Total</span>
            <span className="font-semibold">{o.total} {o.currency}</span>
          </div>
        </div>
      ))}
    </div>
  );
}