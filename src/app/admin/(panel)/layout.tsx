"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface Me {
  id: string;
  email: string;
  name: string;
  role: string;
  sellerStatus: string;
}

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/products", label: "Products", icon: "◇" },
  { href: "/admin/dashboards", label: "Dashboards", icon: "▣" },
  { href: "/admin/marketplace", label: "Marketplace", icon: "⬡" },
  { href: "/admin/orders", label: "Orders", icon: "▤" },
];

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Me | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // ignore
      }
      setChecked(true);
    })();
  }, []);

  const needsRedirect = checked && (!user || user.role !== "ADMIN");
  useEffect(() => {
    if (needsRedirect) router.replace("/admin/login");
  }, [needsRedirect, router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  if (!checked) {
    return <div className="min-h-screen bg-neutral-100 p-10 text-center">Checking session…</div>;
  }

  if (needsRedirect) {
    return <div className="min-h-screen bg-neutral-100 p-10 text-center">Redirecting to login…</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="shrink-0 bg-neutral-900 text-white md:w-60 md:min-h-screen flex flex-col">
        <div className="px-5 py-5 font-bold tracking-wide text-lg">OAMS Admin</div>
        <nav className="flex md:flex-col gap-1 px-3 pb-4 overflow-x-auto">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap ${
                  active ? "bg-white/15 text-white font-medium" : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-[#D96BA8]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-5 py-4 border-t border-white/10 text-sm flex items-center justify-between gap-3">
          <span className="truncate text-neutral-300">{user?.email}</span>
          <button onClick={logout} className="shrink-0 text-neutral-200 hover:text-white underline">
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}