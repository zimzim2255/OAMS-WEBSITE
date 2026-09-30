'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ExpandableCTASection from './ExpandableCTASection';
import { flashDesigns } from '@/lib/flashDesigns';

const products = [
  { id: 1, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846845/blackshort_casse28pcs_grayclair40pcs_grayfonce116pcs_vert_36_noir186pcs-prix80dh_xnlqg7.png', title: 'BLACK SHORT', subtitle: 'Premium quality', soldOut: false },
  { id: 2, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846844/nikeshort_reed36_green_28_mint_11_marron_40pcs_grayclair_32_bleu39pcs_grayfance71pcs_noir120pcs-prix65dh_rzwyiq.png', title: 'NIKE SHORT', subtitle: 'Premium quality', soldOut: false },
  { id: 3, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785922185/50pcsinblue_green_brown_prix70dh_ac5pvh.png_rezifm.png', title: 'STWD SHIRT', subtitle: 'Blue, green, brown', soldOut: false },
  { id: 4, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846823/swdpentes_black60pcs_grayclair60pcs_vert24pcs_marron30pcs_grayfance30pcs_prix80dh_jummmi.png', title: 'STWD PANTS', subtitle: 'Premium quality', soldOut: true },
  { id: 5, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846788/greenshort_in_stock_36pcs_reed28pcs_grayfonce144pcs_casse40pcs_noir116pcs80dh_ufcu5l.png', title: 'GREEN SHORT', subtitle: 'In stock', soldOut: false },
  { id: 6, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846787/ensombleswdbrand_noir30pcs_grayfoncee30pcs_graydh4pcs-125dh_dskvgv.png', title: 'ENSEMBLE STWD', subtitle: 'Brand set', soldOut: false },
];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function BestsellerSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [viewportW, setViewportW] = useState(1200);
  // Marketplace-style category filter for "THE PICKS".
  const [category, setCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'shorts', label: 'Shorts' },
    { id: 't-shirt', label: 'T-Shirt' },
    { id: 'pants', label: 'Pants' },
    { id: 'full-outfits', label: 'Full Outfits' },
  ];

  const filtered =
    category === 'all'
      ? flashDesigns
      : category === 'full-outfits'
      ? flashDesigns.filter((p) => p.category === 'ensemble')
      : category === 't-shirt'
      ? flashDesigns.filter((p) => p.category === 'shirts')
      : flashDesigns.filter((p) => p.category === category);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = wrapper.getBoundingClientRect();
          const total = wrapper.offsetHeight - window.innerHeight;
          const raw = -rect.top / total;
          setProgress(clamp(raw, 0, 1));
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleResize = () => setViewportW(window.innerWidth);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    handleScroll();
    handleResize();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Easing for smoother scroll-driven motion
  const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  // Expansion — slowed down over the first 65% of the pinned phase
  const expandT = easeInOut(clamp(progress / 0.65, 0, 1));

  // After full display, letters split: 20% left/right + 70% scale — slowed over the last 35%
  const letterT = easeInOut(clamp((progress - 0.65) / 0.35, 0, 1));

  // Alternate directions for each letter of OAMS
  const letterDirs = [1, -1, 1, -1];

  const isMobile = viewportW < 640;
  const sidebarWidth = viewportW
    ? (isMobile ? 70 + expandT * (viewportW - 70) : 200 + expandT * (viewportW - 200))
    : 200;
  const gridOpacity = 1 - expandT;
  const gridScale = 1 - 0.12 * expandT;
  const letterOffset = letterT * viewportW * (isMobile ? 0.12 : 0.2);
  const letterGap = letterT * (isMobile ? 30 : 60);
  const letterScale = 1 + 0.7 * letterT;

  return (
    <>
      {/* ===== Pinned expansion phase: BESTSELLER grows to full display ===== */}
      <div ref={wrapperRef} className="relative bg-black" style={{ height: isMobile ? '200vh' : '320vh' }}>
        <section className="sticky top-0 h-screen w-full overflow-hidden bg-black select-none">
          <div className="flex items-stretch gap-1 w-full h-full p-2 sm:p-3">
            {/* BESTSELLER card — expands to full display, text stays visible */}
            <div className="flex-shrink-0 h-full z-20" style={{ width: `${sidebarWidth}px` }}>
              <div className="relative border border-black bg-white w-full h-full overflow-hidden">
                <div
                  className="absolute left-1/2 top-1/2 z-30 pointer-events-none flex flex-col items-center"
                  style={{
                    transform: 'translate(-50%, -50%)',
                    gap: `${letterGap}px`,
                    willChange: 'gap',
                  }}
                >
                  {'OAMS'.split('').map((letter, i) => (
                    <span
                      key={i}
                      className="vertical-text font-['Impact','Anton',sans-serif] text-[clamp(28px,5vh,90px)] sm:text-[clamp(50px,8vh,90px)] font-bold text-black leading-none tracking-tight whitespace-nowrap"
                      style={{
                        transform: `rotate(180deg) translateX(${
                          letterDirs[i] * letterOffset
                        }px) scale(${letterScale})`,
                        willChange: 'transform',
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Product grid — squeezed out as BESTSELLER expands */}
            <div
              className="flex-1 min-w-0 h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 auto-rows-fr overflow-hidden"
              style={{
                transform: `scale(${gridScale})`,
                transformOrigin: 'center center',
                opacity: gridOpacity,
                willChange: 'transform, opacity',
              }}
            >
              {products.slice(0, 5).map((p, i) => (
                <Link
                  key={p.title}
                  href={`/products/${p.id}`}
                  className={`cursor-pointer border border-black rounded p-1 sm:p-2 flex flex-col items-center justify-between bg-white overflow-hidden ${
                    i === 1 ? 'sm:row-span-2' : ''
                  }`}
                >
                  <div className="flex-1 flex items-center justify-center w-full min-h-0 relative">
                    <img
                      src={p.image}
                      alt={p.title}
                      className={`w-full h-full max-h-[200px] sm:max-h-[600px] object-contain ${p.soldOut ? 'grayscale opacity-60' : ''}`}
                      style={{ filter: p.soldOut ? 'grayscale(100%)' : 'grayscale(100%)' }}
                    />
                    {p.soldOut && (
                      <span className="absolute top-2 left-2 bg-black/80 text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/40">
                        Sold Out
                      </span>
                    )}
                  </div>
                  <div className="w-full text-center mt-1 sm:mt-2">
                    <p className="text-[10px] sm:text-sm font-bold uppercase text-black">{p.title}</p>
                    <p className="text-[8px] sm:text-[12px] text-gray-500 hidden sm:block">{p.soldOut ? 'Sold out — will be back soon' : p.subtitle}</p>
                  </div>
                </Link>
              ))}

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
        </section>
      </div>

      {/* ===== After full display: THE PICKS — normal flow section ===== */}
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