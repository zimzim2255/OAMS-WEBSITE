'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ExpandableCTASection from './ExpandableCTASection';

const products = [
  { id: 1, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846845/blackshort_casse28pcs_grayclair40pcs_grayfonce116pcs_vert_36_noir186pcs-prix80dh_xnlqg7.png', title: 'BLACK SHORT', subtitle: 'Premium quality' },
  { id: 2, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846844/nikeshort_reed36_green_28_mint_11_marron_40pcs_grayclair_32_bleu39pcs_grayfance71pcs_noir120pcs-prix65dh_rzwyiq.png', title: 'NIKE SHORT', subtitle: 'Premium quality' },
  { id: 3, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846842/50pcsinblue_green_brown_prix70dh_ac5pvh.png', title: 'STWD SHIRT', subtitle: 'Blue, green, brown' },
  { id: 4, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846823/swdpentes_black60pcs_grayclair60pcs_vert24pcs_marron30pcs_grayfance30pcs_prix80dh_jummmi.png', title: 'STWD PANTS', subtitle: 'Premium quality' },
  { id: 5, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846788/greenshort_in_stock_36pcs_reed28pcs_grayfonce144pcs_casse40pcs_noir116pcs80dh_ufcu5l.png', title: 'GREEN SHORT', subtitle: 'In stock' },
  { id: 6, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846787/ensombleswdbrand_noir30pcs_grayfoncee30pcs_graydh4pcs-125dh_dskvgv.png', title: 'ENSEMBLE STWD', subtitle: 'Brand set' },
];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function BestsellerSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [viewportW, setViewportW] = useState(1200);

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
                  <div className="flex-1 flex items-center justify-center w-full min-h-0">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full max-h-[200px] sm:max-h-[600px] object-contain"
                      style={{ filter: 'grayscale(100%)' }}
                    />
                  </div>
                  <div className="w-full text-center mt-1 sm:mt-2">
                    <p className="text-[10px] sm:text-sm font-bold uppercase text-black">{p.title}</p>
                    <p className="text-[8px] sm:text-[12px] text-gray-500 hidden sm:block">{p.subtitle}</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
              {products.map((p) => (
                <Link
                  key={p.title}
                  href={`/products/${p.id}`}
                  className="block"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="max-h-[260px] w-auto object-contain"
                      style={{ filter: 'grayscale(100%)' }}
                    />
                  </div>
                  <div className="w-full text-center mt-4">
                    <p className="text-sm font-bold uppercase text-black">{p.title}</p>
                    <p className="text-[12px] text-gray-500">{p.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Editorial story — single bg image with paragraphs in the corners ===== */}
      <section className="w-full bg-black p-3">
        <div className="relative w-full h-[560px] md:h-[760px] border border-black rounded overflow-hidden">
          {/* Full background image with dark overlay for readability */}
          <img
            src="https://picsum.photos/seed/bestsellerstory/1600/1100"
            alt="Bestseller story"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'grayscale(100%)' }}
          />
          <div className="absolute inset-0 bg-black/30" />

          {/* Paragraph + heading — top-left corner */}
          <div className="absolute top-4 left-4 md:top-12 md:left-12 max-w-[90%] sm:max-w-sm">
            <p className="text-xs md:text-base text-white/90 leading-relaxed">
              Every bestseller goes through the same journey — designed in-house,
              tested on the streets, and refined until it earns its place in the
              permanent collection. No seasonal gimmicks.
            </p>
            <h3 className="mt-4 md:mt-6 font-['Impact','Anton',sans-serif] text-2xl md:text-6xl font-bold uppercase text-white leading-none tracking-tight">
              BUILT TO LAST
            </h3>
          </div>

          {/* Paragraph + heading — bottom-right corner */}
          <div className="absolute bottom-4 right-4 md:bottom-12 md:right-12 max-w-[90%] sm:max-w-sm text-right">
            <p className="text-xs md:text-base text-white/90 leading-relaxed">
              Six years of streetwear research, three collaborations and one
              permanent collection later — every piece carries the same hand-drawn
              signature, stitched and printed in-house.
            </p>
            <h3 className="mt-4 md:mt-6 font-['Impact','Anton',sans-serif] text-2xl md:text-5xl font-bold uppercase text-white leading-none tracking-tight">
              FOR THE STREETS
            </h3>
          </div>
        </div>
      </section>

      {/* ===== Final CTA banner — expands to full screen on scroll ===== */}
      <ExpandableCTASection />
    </>
  );
}