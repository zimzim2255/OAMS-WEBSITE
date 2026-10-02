"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "login" | "register";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Surfaces failures from the Google OAuth callback (?error=…).
  const googleError = searchParams.get("error");
  const googleErrorMessage =
    googleError === "google_config"
      ? "Google login isn't configured yet on the server."
      : googleError === "google_failed"
      ? "Google login didn't complete. Please try again."
      : null;

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
    <div className="relative min-h-screen overflow-hidden flex items-stretch">
      {/* Background video fills the whole page */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/login-page-video/b_animat_this_elemnt_t.mp4" type="video/mp4" />
      </video>

      {/* Full-height transparent card on the left, taking a large part of the page */}
      <div className="relative z-10 w-full md:w-1/2 lg:w-[34%] xl:w-[26%] min-h-screen bg-black/50 backdrop-blur-md border-l border-white/20 ml-auto flex items-center justify-start px-6 sm:px-12 md:px-12 lg:px-14 py-12">
        <form onSubmit={onSubmit} className="w-full max-w-lg">
        <h1 className="text-3xl font-black mb-1 text-white tracking-tight">My Account</h1>
        <p className="text-sm font-medium text-white/80 mb-8">
          {mode === "login" ? "Sign in to manage your orders and favourites." : "Create an account to get started."}
        </p>

{googleErrorMessage && (
          <div className="text-red-300 text-sm font-medium mb-4 bg-black/50 backdrop-blur-md rounded px-3 py-2">{googleErrorMessage}</div>
        )}

        {/* ===== Sign in with Google ===== */}
        <button
          type="button"
          onClick={() => { window.location.href = "/api/auth/google"; }}
          className="w-full flex items-center justify-center gap-2 border border-white/60 bg-white text-black rounded py-3 font-bold hover:bg-gray-100 transition-colors"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="#4285F4" />
            <text x="12" y="16" textAnchor="middle" fontSize="13" fontFamily="Arial, sans-serif" fontWeight="700" fill="#ffffff">G</text>
          </svg>
          Continue with Google
        </button>

        <div className="mt-4 flex items-center gap-3">
          <span className="flex-1 h-0.5 bg-white/20" />
          <span className="text-xs font-semibold text-white/60">or with email</span>
          <span className="flex-1 h-0.5 bg-white/20" />
        </div>
        {mode === "register" && (
          <>
            <label className="block text-sm font-bold mb-1 text-white/80" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-white/40 rounded px-3 py-3 mb-4 bg-transparent text-white placeholder-white/40 font-medium"
              placeholder="Your name"
              required
            />
          </>
        )}

        <label className="block text-sm font-bold mb-1 text-white/80" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-white/40 rounded px-3 py-3 mb-4 bg-transparent text-white placeholder-white/40 font-medium"
          placeholder="you@example.com"
          required
        />

        <label className="block text-sm font-bold mb-1 text-white/80" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-white/40 rounded px-3 py-3 mb-4 bg-transparent text-white placeholder-white/40 font-medium"
          placeholder="••••••••"
          required
        />

        {error && <div className="text-red-300 text-sm font-medium mb-4">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-transparent border border-white/50 text-white rounded py-3 font-bold disabled:opacity-40 hover:bg-white/20 transition-colors"
        >
          {loading ? (mode === "login" ? "Signing in…" : "Creating account…") : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <div className="mt-5 text-center text-sm font-medium text-white/80">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button type="button" onClick={() => switchMode("register")} className="text-white font-bold underline">
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => switchMode("login")} className="text-white font-bold underline">
                Sign in
              </button>
            </>
          )}
        </div>

        <div className="mt-6 border-t border-white/20 pt-4">
          <Link href="/" className="text-xs font-semibold text-white/60 hover:text-white transition-colors">
            &larr; Back to shop
          </Link>
        </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginForm />
    </Suspense>
  );
}