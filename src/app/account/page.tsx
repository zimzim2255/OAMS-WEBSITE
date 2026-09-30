"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Me {
  id: string;
  email: string;
  name: string;
  role: string;
  sellerStatus: string;
}

export default function AccountOverviewPage() {
  const [user, setUser] = useState<Me | null>(null);
  const [orders, setOrders] = useState<unknown[]>([]);
  const [checked, setChecked] = useState(false);

  async function load() {
    try {
      const [m, o] = await Promise.all([
        fetch("/api/auth/me").then((r) => r.json()),
        fetch("/api/account/orders").then((r) => r.json()),
      ]);
      if (m.user) setUser(m.user);
      if (o.orders) setOrders(o.orders);
    } catch {
      // ignore
    }
    setChecked(true);
  }

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  if (!checked) return <p className="text-center text-neutral-500 py-10">Loading…</p>;

  if (!user) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center">
        <p className="text-lg font-semibold mb-2">Sign in to manage your account</p>
        <p className="text-sm text-neutral-500 mb-4">View orders and your seller shop.</p>
        <Link
          href="/login"
          className="inline-block bg-neutral-900 text-white rounded-lg px-5 py-2 text-sm"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const isSeller = user.role === "SELLER" || user.sellerStatus === "active";

  const cards = [
    { label: "Orders", value: orders.length.toString(), href: "/account/orders" },
    { label: "My products", value: isSeller ? "Manage" : "—", href: "/account/my-products" },
  ];

  return (
    <div>
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Welcome back, {user.name}</h2>
            <p className="text-sm text-neutral-500 mt-1">
              {user.email} · Role: {user.role}
              {user.sellerStatus && user.sellerStatus !== "none" ? ` · Seller (${user.sellerStatus})` : ""}
            </p>
          </div>
          {isSeller && (
            <Link href="/account/seller" className="bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm">
              Seller dashboard
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-sm text-neutral-500">{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}