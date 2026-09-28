"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ...(mode === "register" ? { name } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? (mode === "login" ? "Login failed" : "Registration failed"));
        return;
      }
      router.replace("/account");
      router.refresh();
    } catch {
      setError("Network error — is the dev server running?");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setPassword("");
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded shadow p-10">
        <h1 className="text-2xl font-bold mb-1">My Account</h1>
        <p className="text-sm text-neutral-500 mb-6">
          {mode === "login" ? "Sign in to manage your orders and favourites." : "Create an account to get started."}
        </p>

        {mode === "register" && (
          <>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-neutral-300 rounded px-3 py-2.5 mb-4"
              required
            />
          </>
        )}

        <label className="block text-sm font-medium mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-neutral-300 rounded px-3 py-2.5 mb-4"
          required
        />

        <label className="block text-sm font-medium mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-neutral-300 rounded px-3 py-2.5 mb-4"
          required
        />

        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-neutral-900 text-white rounded py-2.5 font-medium disabled:opacity-50"
        >
          {loading ? (mode === "login" ? "Signing in…" : "Creating account…") : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <div className="mt-5 text-center text-sm text-neutral-500">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button type="button" onClick={() => switchMode("register")} className="text-neutral-900 font-medium underline">
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => switchMode("login")} className="text-neutral-900 font-medium underline">
                Sign in
              </button>
            </>
          )}
        </div>

        <div className="mt-6 border-t border-neutral-100 pt-4">
          <Link href="/" className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
            &larr; Back to shop
          </Link>
        </div>
      </form>
    </div>
  );
}