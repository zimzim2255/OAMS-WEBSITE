'use client';

import { useEffect, useRef, useState } from 'react';

const products = [
  { seed: 'graffititshirt', title: 'T-SHIRT VLOM.CUST', subtitle: 'Vintage black', price: '$39', oldPrice: '$49', tag: '20% OFF' },
  { seed: 'cardholder', title: 'CARDHOLDER VLOM.CUST', subtitle: 'Black', price: '$39' },
  { seed: 'backpack', title: 'CALLIGRAPHY BACKPACK', subtitle: 'Black', price: '$79', oldPrice: '$99', tag: '20% OFF' },
  { seed: 'leatherjacket', title: 'LEATHER JACKET VLOM.CUST', subtitle: 'Vintage grey', price: '$299' },
  { seed: 'sneakers', title: 'SNEAKERS VLOM.CUST', subtitle: 'Black & white', price: '$95', oldPrice: '$119', tag: '15% OFF' },
  { seed: 'hat', title: 'CAP VLOM.CUST', subtitle: 'Black', price: '$29' },
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

  const sidebarWidth = viewportW ? 200 + expandT * (viewportW - 200) : 200;
  const gridOpacity = 1 - expandT;
  const gridScale = 1 - 0.12 * expandT;
  const letterOffset = letterT * viewportW * 0.2;
  const letterGap = letterT * 60;
  const letterScale = 1 + 0.7 * letterT;

  return (
    <>
      {/* ===== Pinned expansion phase: BESTSELLER grows to full display ===== */}
      <div ref={wrapperRef} className="relative bg-black" style={{ height: '320vh' }}>
        <section className="sticky top-0 h-screen w-full overflow-hidden bg-black select-none">
          <div className="flex items-stretch gap-1 w-full h-full p-3">
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
                      className="vertical-text font-['Impact','Anton',sans-serif] text-[clamp(50px,8vh,90px)] font-bold text-black leading-none tracking-tight whitespace-nowrap"
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
              {products.slice(0, 5).map((p) => (
                <div
                  key={p.seed}
                  className={`border border-black rounded p-6 flex flex-col items-center justify-between bg-white overflow-hidden ${
                    p.seed === 'cardholder' ? 'row-span-2' : ''
                  }`}
                >
                  {p.tag && (
                    <div className="flex justify-between w-full">
                      <span className="text-[10px] font-bold text-black uppercase">{p.tag}</span>
                    </div>
                  )}
                  <div className="flex-1 flex items-center justify-center">
                    <img
                      src={`https://picsum.photos/seed/${p.seed}/300/250`}
                      alt={p.title}
                      className="max-h-[220px] w-auto object-contain"
                      style={{ filter: 'grayscale(100%)' }}
                    />
                  </div>
                  <div className="w-full text-center mt-4">
                    <p className="text-sm font-bold uppercase text-black">{p.title}</p>
                    <p className="text-[12px] text-gray-500">{p.subtitle}</p>
                    <p className="text-sm font-bold text-black mt-1">
                      {p.oldPrice && <span className="line-through text-gray-400 mr-2">{p.oldPrice}</span>}
                      <span>{p.price}</span>
                    </p>
                  </div>
                </div>
              ))}

              {/* VIEW MORE card */}
              <div className="border border-black rounded p-6 flex flex-col items-center justify-center bg-white text-black cursor-pointer overflow-hidden">
                <p className="text-sm font-bold uppercase tracking-wider">VIEW MORE</p>
                <span className="text-2xl mt-2">→</span>
              </div>
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
                <div
                  key={p.seed}
                  className="border border-black rounded p-5 flex flex-col items-center justify-between bg-white"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <img
                      src={`https://picsum.photos/seed/${p.seed}/400/320`}
                      alt={p.title}
                      className="max-h-[260px] w-auto object-contain"
                      style={{ filter: 'grayscale(100%)' }}
                    />
                  </div>
                  <div className="w-full text-center mt-4">
                    <p className="text-sm font-bold uppercase text-black">{p.title}</p>
                    <p className="text-[12px] text-gray-500">{p.subtitle}</p>
                    <p className="text-sm font-bold text-black mt-1">
                      {p.oldPrice && <span className="line-through text-gray-400 mr-2">{p.oldPrice}</span>}
                      <span>{p.price}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Editorial story split ===== */}
      <section className="w-full bg-black p-3">
        <div className="bg-white rounded p-6 md:p-16 flex flex-col md:flex-row items-center justify-center gap-10">
          <div className="w-full md:w-1/2 h-[240px] md:h-[420px] border border-black rounded overflow-hidden flex items-center justify-center bg-gray-100">
            <img
              src="https://picsum.photos/seed/bestsellerstory/600/600"
              alt="Bestseller story"
              className="w-full h-full object-cover"
              style={{ filter: 'grayscale(100%)' }}
            />
          </div>
          <div className="w-full md:w-1/2">
            <h3 className="font-['Impact','Anton',sans-serif] text-3xl md:text-5xl font-bold uppercase text-black tracking-tight">
              BUILT TO LAST
            </h3>
            <p className="mt-6 text-sm md:text-base text-gray-600 leading-relaxed max-w-md">
              Every bestseller goes through the same journey — designed in-house,
              tested on the streets, and refined until it earns its place in the
              permanent collection. No seasonal gimmicks. Just pieces that perform.
            </p>
            <div className="mt-8 inline-block border-2 border-black px-8 py-3 text-sm font-bold uppercase tracking-wider text-black cursor-pointer">
              READ THE STORY
            </div>
          </div>
        </div>
      </section>

      {/* ===== Final CTA banner ===== */}
      <section className="w-full bg-black p-3">
        <div className="bg-black border border-white rounded flex flex-col items-center justify-center px-6 py-24">
          <h3 className="font-['Impact','Anton',sans-serif] text-[clamp(40px,8vw,110px)] font-bold uppercase text-white leading-none tracking-tight text-center">
            SHOP THE ICONS
          </h3>
          <p className="mt-6 text-xs md:text-sm uppercase tracking-widest text-white/60 text-center">
            Limited stock — restocked weekly
          </p>
          <div className="mt-10 bg-white text-black flex items-center justify-between px-8 py-4 cursor-pointer">
            <span className="text-sm font-bold uppercase tracking-wider">VIEW ALL BESTSELLERS</span>
            <span className="text-lg ml-6">→</span>
          </div>
        </div>
      </section>
    </>
  );
}