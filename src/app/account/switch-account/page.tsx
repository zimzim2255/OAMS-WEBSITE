"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BecomeSellerForm from "@/components/BecomeSellerForm";

interface Me {
  id: string;
  email: string;
  name: string;
  role: string;
  sellerStatus: string;
  storeName?: string | null;
  storeCategory?: string | null;
}

export default function AccountSwitchAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  async function switchBack() {
    setMessage(null);
    const res = await fetch("/api/account/back-to-user", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setUser((prev) => (prev ? { ...prev, ...data.user } : prev));
      setMessage("You are now using a personal (user) account.");
    } else {
      setMessage("Could not switch account. Try again.");
    }
  }

  function onSellerDone() {
    setMessage("You are now a seller. Your store is open.");
    router.refresh();
  }

  if (loading) return <p className="text-center py-10 text-neutral-500">Loading…</p>;

  const isSeller = user?.role === "SELLER";

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-2">Switch account</h2>
        <p className="text-sm text-neutral-500 mb-4">
          You are currently signed in as a{" "}
          <span className="font-semibold text-neutral-800">{isSeller ? "SELLER" : (user?.role ?? "...")}</span>.
        </p>

        {message && <div className="mb-4 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm">{message}</div>}

        {isSeller ? (
          <div>
            <p className="text-sm text-neutral-600 mb-4">
              Your store: <b>{user?.storeName || "no brand"}</b> ({user?.storeCategory || "general"}). Your listings
              are live on the marketplace.
            </p>
            <button
              onClick={switchBack}
              className="text-sm border border-neutral-300 rounded-lg px-4 py-2 hover:bg-neutral-100"
            >
              Switch to personal account
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-neutral-600 mb-3">
              Switch to a seller account to list products and track clicks, views and sales. No approval needed.
            </p>
            <BecomeSellerForm onDone={onSellerDone} />
          </div>
        )}
      </div>
    </div>
  );
}