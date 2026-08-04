"use client";

import { useState } from "react";
import Link from "next/link";
import CatalogNavCard from "./CatalogNavCard";
import CartDropdown from "./CartDropdown";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const { setIsOpen, getTotalItems } = useCart();

  return (
    <header>
      {/* Navigation Bar */}
      <div className="bg-black flex items-stretch px-2 sm:px-10 pt-1 pb-3 gap-1 overflow-hidden">
        {/* Left: Catalog Card - icon-only on mobile, full button on larger screens */}
        <div className="flex items-center justify-center w-12 sm:w-auto sm:pl-16 sm:pr-10 py-3 border border-white rounded bg-white">
          <button
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className={`cursor-target flex items-center gap-2 sm:gap-3 text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
              isCatalogOpen ? "text-[#D96BA8] opacity-100" : "hover:opacity-60"
            }`}
            aria-label="Open catalog"
          >
            <span className={`text-lg transition-transform duration-300 ${isCatalogOpen ? "rotate-90" : ""}`}>☰</span>
            <span className="hidden sm:inline">CATALOG</span>
          </button>
        </div>

        {/* Center: Logo Section - own border, links to home */}
        <Link href="/" className="flex-1 min-w-0 flex items-center justify-center px-2 sm:px-6 py-3 border border-white rounded bg-white">
          <span className="font-['Impact','Anton',sans-serif] text-xl sm:text-2xl font-bold tracking-tight uppercase">
            OAMS
          </span>
        </Link>

        {/* Right: Cart button - icon-only on mobile, full button on larger screens */}
        <button
          onClick={() => setIsOpen(true)}
          className="cursor-target w-10 sm:w-[200px] flex items-center justify-center py-3 px-2 sm:pr-6 border border-white rounded bg-white"
          aria-label="Open cart"
        >
          <span className="text-xs text-gray-400 uppercase tracking-widest hover:text-black transition-colors whitespace-nowrap">
            <span className="sm:hidden">🛒</span>
            <span className="hidden sm:inline">Cart ({getTotalItems()})</span>
          </span>
        </button>
      </div>

      {/* Catalog Navigation Card */}
      <CatalogNavCard isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />

      {/* Cart Dropdown */}
      <CartDropdown />
    </header>
  );
}