"use client";

export default function Header() {
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
          <button className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide hover:opacity-60 transition-opacity">
            <span className="text-lg">☰</span>
            <span>CATALOG</span>
          </button>
        </div>

        {/* Center: Logo Section - own border */}
        <div className="flex-1 flex items-center justify-center px-6 py-3 border border-white rounded bg-white">
          <span className="font-['Impact','Anton',sans-serif] text-2xl font-bold tracking-tight uppercase">
            VLOM.CUST
          </span>
        </div>

        {/* Right: Empty card - own border, wider on right side */}
        <div className="w-[200px] flex items-center justify-center py-3 pr-6 border border-white rounded bg-white">
          <span className="text-xs text-gray-400 uppercase tracking-widest">Cart</span>
        </div>
      </div>
    </header>
  );
}