"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "oams_promo_30_seen";

export default function PromoModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    try {
      // Wait for the splash sequence to finish, then present the promo offer.
      timeout = setTimeout(() => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          setShow(true);
          document.body.style.overflow = "hidden";
        }
      }, 4200);
    } catch {
      setShow(true);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
      document.body.style.overflow = "";
    };
  }, []);

  const onDismiss = () => {
    setShow(false);
    document.body.style.overflow = "";
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <button
        aria-label="Close promotion"
        onClick={onDismiss}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-target"
      />

      {/* Card */}
      <div className="animate-pop-in relative w-full max-w-lg bg-white text-black rounded-sm overflow-hidden shadow-2xl">
        {/* Banner */}
        <div className="bg-[#F4C430] px-6 py-3 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black">
            Limited Time Offer
          </span>
          <button
            onClick={onDismiss}
            aria-label="Close promotion"
            className="cursor-target text-black text-xl leading-none hover:opacity-70 transition-opacity"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 text-center">
          <h2 className="font-['Impact','Anton',sans-serif] text-6xl sm:text-7xl font-bold uppercase tracking-tight text-black leading-none">
            30% OFF
          </h2>
          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-gray-500">
            Everything must go · Flash Sale
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed text-sm sm:text-base max-w-sm mx-auto">
            Check out our latest streetwear drops and save 30% on selected items.
            Limited stock — the sale won&apos;t last long.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/products"
              onClick={onDismiss}
              className="cursor-target w-full sm:w-auto bg-black text-white flex items-center justify-center gap-3 px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
            >
              <span>Shop the Sale</span>
              <span className="text-base">→</span>
            </Link>
            <button
              onClick={onDismiss}
              className="cursor-target w-full sm:w-auto text-xs font-medium uppercase tracking-widest text-gray-500 px-4 py-3.5 hover:text-black transition-colors"
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}