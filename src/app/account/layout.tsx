"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface Me {
  name: string;
  email: string;
  role: string;
  sellerStatus: string;
}

const BASE_NAV = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/track", label: "Track orders" },
  { href: "/account/switch-account", label: "Switch account" },
  { href: "/account/settings", label: "Settings" },
];

const SELLER_NAV = [
  { href: "/account/my-products", label: "My products" },
  { href: "/account/seller", label: "Seller" },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Me | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Not authenticated — send to the login page instead of My Account.
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      } finally {
        setChecked(true);
      }
    })();
  }, [router]);

  if (!checked) {
    return (
      <div className="w-full min-h-screen px-5 md:px-10 py-8 md:py-10 bg-neutral-50">
        <p className="text-center text-neutral-500 py-10">Loading…</p>
      </div>
    );
  }

  const isSeller = (user?.role === "SELLER" || user?.sellerStatus === "active");
  const NAV = [...BASE_NAV, ...(isSeller ? SELLER_NAV : [])];

  function isActive(item: { href: string }) {
    if (item.href === "/account") return pathname === "/account";
    return pathname.startsWith(item.href);
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore — clear locally anyway
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="w-full min-h-screen px-5 md:px-10 py-8 md:py-10 bg-neutral-50">
      <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">
        My Account
        <span
          className={`ml-2 align-middle text-xs font-bold px-2.5 py-1 rounded-full ${
            isSeller ? "bg-[#D96BA8] text-white" : "bg-neutral-200 text-neutral-700"
          }`}
        >
          {isSeller ? "Seller" : "User"}
        </span>
      </h1>
      {user ? (
        <p className="text-base md:text-lg text-neutral-500 mb-6">
          {user.name} · {user.email}
        </p>
      ) : (
        <p className="text-base md:text-lg text-neutral-500 mb-6">Manage your orders and shop</p>
      )}

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <nav className="lg:w-64 shrink-0 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
          {NAV.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-4 py-3 rounded-xl text-base lg:text-lg font-medium ${
                  active ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Log out — available for both buyers and sellers */}
          <button
            onClick={logout}
            className="whitespace-nowrap px-4 py-3 rounded-xl text-base lg:text-lg font-medium text-red-600 hover:bg-red-50 border-t border-neutral-200 mt-2"
          >
            Log out
          </button>
        </nav>
        <div className="flex-1 min-w-0 grid gap-6">{children}</div>
      </div>
    </div>
  );
}