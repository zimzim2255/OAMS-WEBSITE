"use client";

import { useEffect, useState } from "react";
import type { OrderDto, OrderItemDto, OrderStatus } from "@/lib/types";
import { SELLER_STATUSES } from "@/lib/orders";

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-sky-100 text-sky-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-neutral-200 text-neutral-600",
};

function renderOrder(o: OrderDto, badge: string) {
  return (
    <div key={o.id} className="bg-white rounded-2xl shadow p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="font-semibold">#{o.orderNumber}</span>
          <span className="text-sm text-neutral-500 ml-3">{new Date(o.createdAt).toLocaleDateString()}</span>
          <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
            badge === "Sale" ? "bg-[#D96BA8] text-white" : "bg-neutral-100 text-neutral-600"
          }`}>
            {badge}
          </span>
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
              {i.status && i.status !== o.status ? ` · ${i.status}` : ""}
            </span>
            <span>{i.total} {o.currency}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between border-t border-neutral-100 pt-2 mt-2 text-sm">
        <span>
          Total
          {o.trackingNumber ? ` · Tracking: ${o.trackingNumber}` : ""}
        </span>
        <span className="font-semibold">{o.total} {o.currency}</span>
      </div>
    </div>
  );
}

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

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [sales, setSales] = useState<OrderDto[]>([]);
  const [isSeller, setIsSeller] = useState(false);
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
        const sell = Boolean(u && (u.role === "SELLER" || u.sellerStatus === "active"));
        setIsSeller(sell);

        const res = await fetch("/api/account/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders ?? []);
        }

        if (sell) await loadSales();
      } catch {
        // ignore
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-center py-10 text-neutral-500">Loading orders…</p>;

  const buyerEmpty = orders.length === 0;
  const sellerEmpty = sales.length === 0;

  if ((!isSeller && buyerEmpty) || (isSeller && buyerEmpty && sellerEmpty)) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center">
        <p className="text-lg font-semibold mb-1">No orders yet</p>
        <p className="text-sm text-neutral-500">Your orders will appear here after you check out.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isSeller && (
        <>
          <div className="text-lg font-bold">My sales</div>
          {sellerEmpty ? (
            <p className="text-sm text-neutral-500">No sales yet — they'll appear here when customers order your products.</p>
          ) : (
            <div className="space-y-3">
              {sales.map((o) => (
                <div key={o.id} className="bg-white rounded-2xl shadow p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-semibold">#{o.orderNumber}</span>
                      <span className="text-sm text-neutral-500 ml-3">{new Date(o.createdAt).toLocaleDateString()}</span>
                      <span className="text-xs px-2 py-1 rounded-full ml-2 bg-[#D96BA8] text-white">Sale</span>
                      <span className="text-xs px-2 py-1 rounded-full ml-2 bg-neutral-100 text-neutral-600">
                        {o.status}
                      </span>
                    </div>
                    <span>
                      {o.items.length > 1
                        ? `${o.items.length} items shown`
                        : "Your items"}
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
          )}
          <div className="text-lg font-bold mt-2">My orders</div>
          {buyerEmpty ? (
            <p className="text-sm text-neutral-500">No purchases yet.</p>
          ) : (
            <div className="space-y-3">{orders.map((o) => renderOrder(o, "Purchase"))}</div>
          )}
        </>
      )}

      {!isSeller && (
        <>
          <div className="text-lg font-bold">My orders</div>
          {buyerEmpty ? (
            <p className="text-sm text-neutral-500">No purchases yet.</p>
          ) : (
            <div className="space-y-3">{orders.map((o) => renderOrder(o, "Purchase"))}</div>
          )}
        </>
      )}
    </div>
  );
}