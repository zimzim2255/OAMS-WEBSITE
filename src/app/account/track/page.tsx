"use client";

import { useEffect, useState } from "react";
import type { OrderDto, OrderItemDto, OrderStatus } from "@/lib/types";
import { SELLER_STATUSES } from "@/lib/orders";

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

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-sky-100 text-sky-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-neutral-200 text-neutral-600",
};

/** A buyer's order card with the status progress bar. */
function renderPurchaseCard(o: OrderDto) {
  const done = stepIndex(o.status);
  const cancelled = o.status === "CANCELLED" || o.status === "REFUNDED";
  return (
    <div key={o.id} className="space-y-0">
      <div className="bg-white rounded-2xl shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold">#{o.orderNumber}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${cancelled ? "bg-red-100 text-red-700" : STATUS_COLORS[o.status]}`}>
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
    </div>
  );
}

/** A seller's line item inside a client's order — lets them manage status + tracking. */
function SaleItemRow({
  item,
  currency,
  onChanged,
}: {
  item: OrderItemDto;
  currency: string;
  onChanged: () => Promise<void>;
}) {
  const [status, setSt] = useState<OrderStatus>(item.status ?? "PENDING");
  const [track, setTr] = useState(item.trackingNumber ?? "");
  const [busy, setBusy] = useState(false);

  async function patch(payload: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/marketplace/orders/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-sm text-neutral-600">
        {item.name} × {item.quantity}
        {item.size ? ` · ${item.size}` : ""}
        {item.color ? ` (${item.color})` : ""}
        — {item.total} {currency}
      </span>
      <div className="flex items-center gap-2">
        <input
          value={track}
          onChange={(e) => setTr(e.target.value)}
          onBlur={() => {
            if (track !== (item.trackingNumber ?? "")) void patch({ trackingNumber: track });
          }}
          placeholder="Tracking #"
          className="border border-neutral-300 rounded-lg px-2 py-1 text-sm w-40"
        />
        <select
          value={status}
          disabled={busy}
          onChange={(e) => {
            const v = e.target.value as OrderStatus;
            setSt(v);
            void patch({ status: v });
          }}
          className={`text-xs px-2 py-1 rounded-lg border border-neutral-300 ${STATUS_COLORS[status]}`}
        >
          {SELLER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function AccountTrackPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [sales, setSales] = useState<OrderDto[]>([]);
  const [isSeller, setIsSeller] = useState(false);
  const [tab, setTab] = useState<"purchases" | "sales">("purchases");
  const [loading, setLoading] = useState(true);

  async function loadSales() {
    const sres = await fetch("/api/marketplace/orders");
    if (sres.ok) {
      const sdata = await sres.json();
      setSales(sdata.orders ?? []);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch("/api/auth/me").then((r) => r.json());
        const u = me.user;
        setIsSeller(Boolean(u && (u.role === "SELLER" || u.sellerStatus === "active")));

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

  useEffect(() => {
    if (isSeller) void loadSales();
  }, [isSeller]);

  if (loading) return <p className="text-center py-10 text-neutral-500">Loading…</p>;

  // Buyers just see their own order tracking.
  if (!isSeller) {
    return orders.length === 0 ? (
      <div className="bg-white rounded-2xl shadow p-8 text-center text-neutral-500">
        No orders to track yet.
      </div>
    ) : (
      <div className="space-y-4">{orders.map(renderPurchaseCard)}</div>
    );
  }

  const tabBase = "px-4 py-2 text-sm font-medium rounded-lg border transition-colors ";
  const active = "border-neutral-900 bg-neutral-900 text-white";
  const idle = "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400";

  // Seller view: two separate interfaces — their own purchases and their clients' orders.
  return (
    <div>
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab("purchases")}
          className={`${tabBase} ${tab === "purchases" ? active : idle}`}
        >
          My purchases ({orders.length})
        </button>
        <button
          onClick={() => setTab("sales")}
          className={`${tabBase} ${tab === "sales" ? active : idle}`}
        >
          Clients&apos; orders ({sales.length})
        </button>
      </div>

      {tab === "purchases" &&
        (orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-neutral-500">
            No purchases yet.
          </div>
        ) : (
          <div className="space-y-4">{orders.map(renderPurchaseCard)}</div>
        ))}

      {tab === "sales" &&
        (sales.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-neutral-500">
            No client orders yet — they&apos;ll appear when a customer orders your products.
          </div>
        ) : (
          <div className="space-y-3">
            {sales.map((o) => (
              <div key={`sale-${o.id}`} className="bg-white rounded-2xl shadow p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-semibold">#{o.orderNumber}</span>
                    <span className="text-sm text-neutral-500 ml-3">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ml-2 bg-neutral-100 text-neutral-600`}>
                      {o.status}
                    </span>
                  </div>
                  <span>
                    {o.items.length > 1 ? `${o.items.length} items shown` : "Your items"}
                  </span>
                </div>
                <div className="space-y-2">
                  {o.items.map((i) => (
                    <SaleItemRow
                      key={`${i.id}-${i.status}`}
                      item={i}
                      currency={o.currency}
                      onChanged={loadSales}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}