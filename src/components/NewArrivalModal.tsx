"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { flashDesigns } from "@/lib/flashDesigns";

const STORAGE_KEY = "oams_new_arrival_seen";

export default function NewArrivalModal() {
  const [show, setShow] = useState(false);
  // Newest arrival is the first product in the list (kept at the top on purpose)
  const product = flashDesigns[0];

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    try {
      // Wait for the splash sequence to finish, then present the new arrival.
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

  const onNavigate = () => {
    setShow(false);
    document.body.style.overflow = "";
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
  };

  if (!show || !product) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <button
        aria-label="Close new arrival announcement"
        onClick={onNavigate}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-target"
      />

      {/* Card */}
      <div className="animate-pop-in relative w-full max-w-lg bg-white text-black rounded-sm overflow-hidden shadow-2xl">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="bg-[#F4C430] text-black text-[10px] font-bold uppercase tracking-[0.25em] px-3 py-1.5">
              New Arrival
            </span>
          </div>
          <div className="absolute bottom-4 left-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white">
              {product.colors.join(" · ")} · {product.price} DH
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <h2 className="font-['Impact','Anton',sans-serif] text-4xl sm:text-5xl font-bold uppercase tracking-tight text-black leading-none">
            {product.name}
          </h2>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gray-500">
            Just Dropped · {product.price} DH
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed text-sm">
            {product.description}
          </p>

          <div className="mt-7 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest">In stock</p>
              <p className="text-xl font-bold text-black">{product.price} DH</p>
            </div>
            <Link
              href={`/products/${product.id}`}
              onClick={onNavigate}
              className="cursor-target bg-black text-white flex items-center gap-3 px-6 py-3.5 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
            >
              <span>See the Product</span>
              <span className="text-base">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}