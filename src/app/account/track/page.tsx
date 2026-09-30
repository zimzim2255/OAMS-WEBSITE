"use client";

import { useEffect, useState } from "react";
import type { OrderDto, OrderStatus } from "@/lib/types";

const FLOW: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

function stepIndex(status: OrderStatus): number {
  const idx = FLOW.indexOf(status);
  return idx === -1 ? -1 : idx + 1; // +1 = completed steps
}

const STEP_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export default function AccountTrackPage() {
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

  if (loading) return <p className="text-center py-10 text-neutral-500">Loading…</p>;

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center text-neutral-500">
        No orders to track yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const done = stepIndex(o.status);
        const cancelled = o.status === "CANCELLED" || o.status === "REFUNDED";
        return (
          <div key={o.id} className="bg-white rounded-2xl shadow p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold">#{o.orderNumber}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${cancelled ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                {STEP_LABEL[o.status]}
              </span>
            </div>

            {cancelled ? (
              <p className="text-sm text-red-600">
                This order was {o.status === "REFUNDED" ? "refunded" : "cancelled"}.
              </p>
            ) : (
              <div className="flex items-center gap-2">
                {FLOW.map((s, i) => {
                  const current =
                    o.status === s ||
                    (i === FLOW.length - 1 && done >= FLOW.length);
                  const reached = done >= i + 1;
                  return (
                    <div key={s} className="flex-1">
                      <div
                        className={`h-2 rounded-full ${reached ? "bg-emerald-500" : "bg-neutral-200"}`}
                      />
                      <div
                        className={`text-xs mt-1 ${
                          current ? "font-semibold text-neutral-900" : reached ? "text-emerald-600" : "text-neutral-400"
                        }`}
                      >
                        {STEP_LABEL[s]}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

{o.trackingNumber && (
              <p className="text-sm text-neutral-600 mt-2">
                Tracking number: <b>{o.trackingNumber}</b>
              </p>
            )}
            <div className="border-t border-neutral-100 mt-4 pt-3 flex justify-between text-sm">
              <span className="text-neutral-500">{new Date(o.createdAt).toLocaleDateString()}</span>
              <span className="font-semibold">{o.total} {o.currency}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}