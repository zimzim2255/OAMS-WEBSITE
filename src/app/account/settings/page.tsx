"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { STORE_CATEGORIES } from "@/lib/store-categories";

interface Me {
  id: string;
  email: string;
  name: string;
  role: string;
  sellerStatus: string;
  storeName?: string | null;
  storeCategory?: string | null;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function readPref(key: string) {
  try {
    return localStorage.getItem(key) === "on";
  } catch {
    return false;
  }
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeCategory, setStoreCategory] = useState("general");
  const [message, setMessage] = useState<string | null>(null);
  const [cookies, setCookies] = useState(false);
  const [notifications, setNotifications] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const u = data.user as Me;
          setUser(u);
          setName(u.name);
          setStoreName(u.storeName ?? "");
          setStoreCategory(u.storeCategory ?? "general");
        }
      } catch {
        // ignore
      }
      setCookies(readPref("oams_cookies"));
      setNotifications(readPref("oams_notifications"));
    })();
  }, []);

  function togglePref(key: string, set: (v: boolean) => void, value: boolean) {
    set(value);
    try {
      localStorage.setItem(key, value ? "on" : "off");
    } catch {
      // ignore
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const payload: Record<string, string> = { name };
    if (user?.role === "SELLER") {
      payload.storeName = storeName;
      payload.storeCategory = storeCategory;
    }
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Could not save profile");
      return;
    }
    setUser((prev) => (prev ? { ...prev, ...data.user } : prev));
    setMessage("Profile saved.");
  }

  async function deleteAccount() {
    if (!confirm("Delete your account permanently? This cannot be undone.")) return;
    if (!confirm("Are you absolutely sure? All your data will be removed.")) return;
    const res = await fetch("/api/account", { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  }

  if (!user) {
    return <p className="text-center text-neutral-500 py-10">Loading…</p>;
  }

  const inputCls = "w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm";
  const labelCls = "block text-sm font-medium mb-1";
  const isSeller = user.role === "SELLER";

  return (
    <div className="space-y-6">
      {message && <div className="px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm">{message}</div>}

<Section title="Profile">
        <form onSubmit={saveProfile} className="space-y-4 max-w-lg">
          <div>
            <label className={labelCls}>Name</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls} value={user.email} disabled />
          </div>
          {isSeller && (
            <>
              <div>
                <label className={labelCls}>Brand / store name</label>
                <input className={inputCls} value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Store category</label>
                <select
                  className={inputCls + " bg-white"}
                  value={storeCategory}
                  onChange={(e) => setStoreCategory(e.target.value)}
                >
                  {STORE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <button type="submit" className="bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm font-medium">
            Save
          </button>
        </form>
      </Section>

      <Section title="Preferences">
        <div className="space-y-3 max-w-lg">
          <label className="flex items-center justify-between gap-4 text-sm">
            <span>Functional & analytics cookies</span>
            <input
              type="checkbox"
              checked={cookies}
              onChange={(e) => togglePref("oams_cookies", setCookies, e.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between gap-4 text-sm">
            <span>Order & seller notifications</span>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => togglePref("oams_notifications", setNotifications, e.target.checked)}
            />
          </label>
        </div>
      </Section>

      <Section title="Contact & support">
        <p className="text-sm text-neutral-600 mb-3">
          Need help with an order, your seller account, or anything else? Open a support ticket and we’ll get back to you.
        </p>
        <Link href="/support" className="text-sm bg-neutral-900 text-white rounded-lg px-4 py-2 inline-block">
          Contact support
        </Link>
      </Section>

      <Section title="Danger zone">
        <p className="text-sm text-neutral-600 mb-3">Permanently delete your account and all associated data.</p>
        <button
          onClick={deleteAccount}
          className="text-sm bg-red-50 text-red-600 rounded-lg px-4 py-2 hover:bg-red-100"
        >
          Delete my account
        </button>
      </Section>
    </div>
  );
}