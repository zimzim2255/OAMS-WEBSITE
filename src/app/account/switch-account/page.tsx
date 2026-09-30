"use client";

import { useEffect, useState } from "react";
import BecomeSellerForm from "@/components/BecomeSellerForm";

interface Me {
  id: string;
  email: string;
  name: string;
  role: string;
  sellerStatus: string;
  storeName?: string | null;
  storeCategory?: string | null;
  avatarUrl?: string | null;
}

export default function AccountSwitchAccountPage() {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // "Seller" = SELLER role, or an admin who opened a store (sellerStatus active).
  const isSeller = user?.role === "SELLER" || user?.sellerStatus === "active";

  async function switchBack() {
    const ok = window.confirm(
      "Switch back to a normal user?\n\nYour store will close and ALL your listed products and their orders will be permanently deleted. This cannot be undone."
    );
    if (!ok) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/account/back-to-user", { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      setError("Could not switch back. Try again.");
      return;
    }
    // Reload so the sidebar nav and this card reflect the switch back.
    window.location.reload();
  }

  function onSellerDone() {
    // Reload so the sidebar nav and this card reflect the new seller role.
    window.location.reload();
  }

  if (loading) return <p className="text-center py-16 text-neutral-500">Loading…</p>;

  const cardCls =
    "w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 md:p-8 text-center border border-neutral-100";

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center py-10">
      <div className={cardCls}>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#D96BA8] text-white text-xl">
          {isSeller ? "🛍️" : "👤"}
        </div>
        <h2 className="text-2xl font-bold">Switch account</h2>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          You are signed in as{" "}
          <span className="font-semibold text-neutral-800">{isSeller ? "SELLER" : (user?.role ?? "…")}</span>
        </p>

        {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

        {isSeller ? (
          <div className="space-y-5">
            <div className="rounded-xl bg-neutral-50 p-4 text-left text-sm text-neutral-600">
              <p className="font-medium text-neutral-800 mb-1">Your store</p>
              <div className="flex items-center gap-2">
                {user?.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="store logo" className="w-8 h-8 rounded-full object-cover border border-neutral-200" />
                )}
                <p>
                  <b>{user?.storeName || "No brand"}</b> · {user?.storeCategory || "general"}
                </p>
              </div>
              <p className="mt-1 text-neutral-500">Your listings are live on the marketplace.</p>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-left text-sm text-amber-800">
              <p className="font-semibold mb-1">⚠️ Switching back will delete your store</p>
              <p className="text-amber-700">
                All your listed products and their orders will be permanently deleted. This cannot be undone.
              </p>
            </div>

            <button
              type="button"
              onClick={switchBack}
              disabled={busy}
              className="w-full bg-neutral-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
            >
              {busy ? "Switching…" : "Switch back to normal user"}
            </button>
            <p className="text-xs text-neutral-400">
              You can always switch back to seller again from here.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            <p className="text-sm text-neutral-600">
              Switch to a seller account to list products and track clicks, views and sales. No approval needed.
            </p>
            <BecomeSellerForm onDone={onSellerDone} />
            <p className="text-xs text-neutral-400 text-center">
              After switching you can come back here to switch to a normal user.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}