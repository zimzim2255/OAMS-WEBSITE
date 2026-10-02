'use client';

import { useState } from 'react';
import Link from 'next/link';
import ExpandableCTASection from './ExpandableCTASection';
import { useLiveProducts } from '@/lib/useLiveProducts';

export default function BestsellerSection() {
  // Marketplace-style category filter for "THE PICKS".
  const [category, setCategory] = useState('all');
  // Live catalogue from the database (admin + marketplace products).
  const live = useLiveProducts();

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'shorts', label: 'Shorts' },
    { id: 't-shirt', label: 'T-Shirt' },
    { id: 'pants', label: 'Pants' },
    { id: 'full-outfits', label: 'Full Outfits' },
  ];

  const featured = live.slice(0, 5);
  const isSoldOut = (p: { stock: Record<string, number> }) =>
    Object.values(p.stock).every((s) => s <= 0);

  const filtered =
    category === 'all'
      ? live
      : category === 'full-outfits'
      ? live.filter((p) => p.category === 'ensemble')
      : category === 't-shirt'
      ? live.filter((p) => p.category === 'shirts')
      : live.filter((p) => p.category === category);

  return (
    <>
      {/* ===== BESTSELLER — static section (normal scroll, no animation) ===== */}
      <section className="w-full bg-black p-1">
        <div className="bg-black rounded p-4 md:p-8">
          <div className="bg-white rounded p-6 md:p-10">
            <div className="flex flex-col md:flex-row gap-1 items-stretch">
              {/* BESTSELLER card with OAMS vertical wordmark */}
              <div className="relative border border-black bg-white overflow-hidden min-h-[220px] md:w-48 md:flex-shrink-0 md:min-h-[320px]">
                <div
                  className="absolute left-1/2 top-1/2 z-30 pointer-events-none flex flex-col items-center"
                  style={{ transform: 'translate(-50%, -50%)' }}
                >
                  {'OAMS'.split('').map((letter, i) => (
                    <span
                      key={i}
                      className="vertical-text font-['Impact','Anton',sans-serif] text-[clamp(28px,5vh,90px)] sm:text-[clamp(50px,8vh,90px)] font-bold text-black leading-none tracking-tight whitespace-nowrap"
                      style={{ transform: 'rotate(180deg)' }}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              </div>

              {/* Product grid */}
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 auto-rows-fr">
                {featured.map((p, i) => {
                  const soldOut = isSoldOut(p);
                  return (
                    <Link
                      key={String(p.id)}
                      href={`/products/${p.id}`}
                      className={`cursor-pointer border border-black rounded p-1 sm:p-2 flex flex-col items-center justify-between bg-white overflow-hidden ${
                        i === 1 ? 'sm:row-span-2' : ''
                      }`}
                    >
                      <div className="flex-1 flex items-center justify-center w-full min-h-0 relative">
                        <img
                          src={p.image}
                          alt={p.name}
                          className={`w-full h-full max-h-[200px] sm:max-h-[600px] object-contain ${soldOut ? 'grayscale opacity-60' : ''}`}
                          style={{ filter: 'grayscale(100%)' }}
                        />
                        {soldOut && (
                          <span className="absolute top-2 left-2 bg-black/80 text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/40">
                            Sold Out
                          </span>
                        )}
                      </div>
                      <div className="w-full text-center mt-1 sm:mt-2">
                        <p className="text-[10px] sm:text-sm font-bold uppercase text-black">{p.name}</p>
                        <p className="text-[8px] sm:text-[12px] text-gray-500 hidden sm:block">{soldOut ? 'Sold out — will be back soon' : `${p.price} DH`}</p>
                      </div>
                    </Link>
                  );
                })}

                {/* VIEW MORE card */}
                <Link
                  href="/products"
                  className="cursor-pointer border border-black rounded p-4 sm:p-6 flex flex-col items-center justify-center bg-white text-black overflow-hidden hover:bg-gray-50 transition-colors"
                >
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wider">VIEW MORE</p>
                  <span className="text-xl sm:text-2xl mt-2">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full bg-black p-1">
        <div className="bg-black rounded p-4 md:p-8">
          <div className="bg-white px-6 md:px-12 py-8 md:py-12 rounded">
            <h3 className="font-['Impact','Anton',sans-serif] text-3xl md:text-5xl font-bold uppercase text-black tracking-tight mb-8">
              THE PICKS
            </h3>

            {/* Category filter — marketplace style */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`cursor-target px-5 py-2 text-xs font-bold uppercase tracking-widest border transition-all duration-300 ${
                    category === cat.id
                      ? "bg-black text-white border-black"
                      : "bg-transparent text-black border-black/30 hover:border-black hover:bg-black/5"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Marketplace-style product grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
              {filtered.map((p) => {
                const isSoldOut = Object.values(p.stock).every((s) => s <= 0);
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="cursor-target group block"
                  >
                    <div className="relative aspect-[3/4] bg-[#e9e7e3] overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                          isSoldOut ? "opacity-60 grayscale" : ""
                        }`}
                      />
                      {p.isNew && (
                        <span className="absolute top-3 left-3 text-xs font-medium bg-white text-black px-2.5 py-1 uppercase tracking-widest border border-black">
                          New
                        </span>
                      )}
                      {isSoldOut && (
                        <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border border-white/40">
                          Sold Out
                        </span>
                      )}
                    </div>
                    <div className="pt-3 flex flex-col gap-1">
                      <p className="text-sm font-bold uppercase text-black">{p.name}</p>
                      <p className="text-sm text-black">
                        {p.price} DH
                        {isSoldOut && <span className="ml-2 text-[10px] text-red-500 uppercase font-semibold">Sold out</span>}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Marketplace features — fit for a marketplace site ===== */}
      <section className="w-full bg-black py-16 md:py-24 px-5 md:px-10">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-['Impact','Anton',sans-serif] text-3xl md:text-6xl font-bold uppercase text-white tracking-tight">
            A marketplace built for streetwear
          </h2>
          <p className="mt-4 md:text-lg text-white/70 max-w-2xl mx-auto">
            Buy from official OAMS pieces and independent sellers — all in one feed.
            Transparent pricing, tracked shipping and buyer protection on every order.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px md:gap-px gap-8 mt-12">
            {[
              { n: '01', t: 'Sell', d: 'List your own pieces and reach real streetwear buyers.' },
              { n: '02', t: 'Buy Direct', d: 'Shop verified listings straight from the seller.' },
              { n: '03', t: 'Tracked Shipping', d: 'Every order is tracked to your door.' },
              { n: '04', t: 'Buyer Protection', d: 'Pay securely with full order protection.' },
            ].map((f) => (
              <div key={f.n} className="border border-white/20 p-6 rounded transition-colors hover:bg-white/5">
                <p className="text-xs text-white/50 uppercase tracking-widest">{f.n}</p>
                <h3 className="font-['Impact','Anton',sans-serif] text-xl md:text-2xl font-bold uppercase text-white mt-2">{f.t}</h3>
                <p className="text-sm text-white/70 mt-2 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>

          <Link
            href="/products"
            className="cursor-target mt-10 inline-block border border-white/40 text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            Explore the marketplace
          </Link>
        </div>
      </section>

      {/* ===== Final CTA banner — expands to full screen on scroll ===== */}
      <ExpandableCTASection />
    </>
  );
}