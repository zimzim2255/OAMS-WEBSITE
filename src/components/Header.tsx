"use client";

import { useState } from "react";
import CatalogNavCard from "./CatalogNavCard";
import CartDropdown from "./CartDropdown";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const { setIsOpen, getTotalItems } = useCart();

  return (
    <header>
      {/* Top Header Bar */}
      <div className="bg-black text-white flex justify-between items-center px-10 py-3">
        <div>
          <p className="text-[12px] uppercase tracking-widest leading-tight">YUDAEV SCHOOL</p>
          <p className="text-[12px] uppercase tracking-widest leading-tight">ARINA SHURUPOVA</p>
        </div>
        <p className="text-[12px]">2024</p>
      </div>

      {/* Navigation Bar */}
      <div className="bg-black flex items-stretch px-10 pt-1 pb-3 gap-1">
        {/* Left: Catalog Card - own border, wider on left side */}
        <div className="flex items-center pl-16 pr-10 py-3 border border-white rounded bg-white">
          <button
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className={`cursor-target flex items-center gap-3 text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
              isCatalogOpen ? "text-[#D96BA8] opacity-100" : "hover:opacity-60"
            }`}
          >
            <span className={`text-lg transition-transform duration-300 ${isCatalogOpen ? "rotate-90" : ""}`}>☰</span>
            <span>CATALOG</span>
          </button>
        </div>

        {/* Center: Logo Section - own border */}
        <div className="flex-1 flex items-center justify-center px-6 py-3 border border-white rounded bg-white">
          <span className="font-['Impact','Anton',sans-serif] text-2xl font-bold tracking-tight uppercase">
            VLOM.CUST
          </span>
        </div>

        {/* Right: Cart button - opens dropdown */}
        <button
          onClick={() => setIsOpen(true)}
          className="cursor-target w-[200px] flex items-center justify-center py-3 pr-6 border border-white rounded bg-white"
        >
          <span className="text-xs text-gray-400 uppercase tracking-widest hover:text-black transition-colors">
            Cart ({getTotalItems()})
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