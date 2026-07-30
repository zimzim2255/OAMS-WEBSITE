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
      <div className="bg-white flex justify-between items-center px-10 py-4 border-b border-black">
        {/* Left: Catalog Button */}
        <button className="flex items-center gap-3 border border-black px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-black hover:text-white transition-colors">
          <span className="text-lg">☰</span>
          <span>CATALOG</span>
        </button>

        {/* Center: Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="font-['Impact','Anton',sans-serif] text-2xl font-bold tracking-tight uppercase">
            VLOM.CUST
          </span>
        </div>

        {/* Right: Spacer for balance */}
        <div className="w-[130px]" />
      </div>
    </header>
  );
}