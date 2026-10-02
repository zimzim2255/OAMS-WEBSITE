"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>("");

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

  async function patch(id: string, payload: { status?: OrderStatus; trackingNumber?: string }) {
    setSaving((s) => ({ ...s, [id]: true }));
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data?.order as OrderDto | undefined;
        if (updated) {
          // Reflect the (possibly auto-generated) tracking number right away.
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
          if (updated.trackingNumber) {
            setTracking((t) => ({ ...t, [updated.id]: updated.trackingNumber ?? "" }));
          }
        } else {
          await load();
        }
      }
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  }

  const trackOf = (o: OrderDto) => (tracking[o.id] ?? o.trackingNumber ?? "").trim();
  const setStatus = (order: OrderDto, status: OrderStatus) =>
    patch(order.id, { status, trackingNumber: trackOf(order) || undefined });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        o.orderNumber,
        o.customerName ?? "",
        o.customerEmail ?? "",
        o.id,
        ...o.items.map((i) => i.name),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [orders, search, statusFilter]);

  if (loading) return <div className="p-10 text-center">Loading orders…</div>;

  const inputCls = "border border-neutral-300 rounded-lg px-3 py-2 text-sm";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order #, customer, email, item…"
          className={`${inputCls} flex-1 min-w-[220px]`}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | OrderStatus)}
          className={`${inputCls} bg-white`}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="text-sm text-neutral-500 self-center">
          {filtered.length} of {orders.length} order(s)
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-neutral-500">No orders match.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center justify-between mb-3 flex-wrap">
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
                    disabled={saving[o.id]}
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
                {(o.customerName || o.customerEmail) && (
                  <div className="text-neutral-700 mb-1">
                    {o.customerName}
                    {o.customerEmail ? ` <${o.customerEmail}>` : ""}
                  </div>
                )}
                {o.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {i.name} × {i.quantity}
                      {i.size ? ` · ${i.size}` : ""}
                      {i.color ? ` (${i.color})` : ""}
                      {i.status && i.status !== o.status ? ` · ${i.status}` : ""}
                    </span>
                    <span>{i.total} {o.currency}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-1">
                <input
                  value={tracking[o.id] ?? o.trackingNumber ?? ""}
                  onChange={(e) => setTracking({ ...tracking, [o.id]: e.target.value })}
                  placeholder="Tracking number"
                  className="border border-neutral-300 rounded-lg px-2 py-1 text-sm w-56"
                />
                <button
                  onClick={() => patch(o.id, { trackingNumber: trackOf(o) || undefined })}
                  disabled={saving[o.id]}
                  className="text-xs bg-neutral-100 hover:bg-neutral-200 rounded-lg px-2.5 py-1.5 border border-neutral-300"
                >
                  Save #
                </button>
              </div>

              <div className="flex justify-between border-t border-neutral-100 pt-2 text-sm">
                <span>
                  Subtotal {o.subtotal} · Shipping {o.shippingCost}
                  {o.trackingNumber ? ` · Tracking ${o.trackingNumber}` : ""}
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