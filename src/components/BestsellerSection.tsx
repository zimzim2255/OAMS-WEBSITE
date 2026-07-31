'use client';

import { useEffect, useRef, useState } from 'react';

const products = [
  { seed: 'graffititshirt', title: 'T-SHIRT VLOM.CUST', subtitle: 'Vintage black', price: '$39', oldPrice: '$49', tag: '20% OFF' },
  { seed: 'cardholder', title: 'CARDHOLDER VLOM.CUST', subtitle: 'Black', price: '$39', tall: true },
  { seed: 'backpack', title: 'CALLIGRAPHY BACKPACK', subtitle: 'Black', price: '$79', oldPrice: '$99', tag: '20% OFF' },
  { seed: 'leatherjacket', title: 'LEATHER JACKET VLOM.CUST', subtitle: 'Vintage grey', price: '$299' },
  { seed: 'sneakers', title: 'SNEAKERS VLOM.CUST', subtitle: 'Black & white', price: '$95', oldPrice: '$119', tag: '15% OFF' },
];

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
          setProgress(Math.max(0, Math.min(1, raw)));
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

  // Expansion starts partway through the pinned scroll and completes at the end
  const expandT = Math.max(0, Math.min(1, (progress - 0.4) / 0.6));

  // BESTSELLER sidebar grows from 200px to full viewport width
  const sidebarWidth = viewportW ? 200 + expandT * (viewportW - 200) : 200;

  // Product grid gets squeezed out
  const gridOpacity = 1 - expandT;
  const gridScale = 1 - 0.12 * expandT;
  const cardRadius = 0.25 * (1 - expandT);

  return (
    <div ref={wrapperRef} className="relative bg-black" style={{ height: '280vh' }}>
      <section className="sticky top-0 h-screen w-full overflow-hidden bg-black select-none">
        <div className="flex items-stretch gap-1 w-full h-full p-3">
          {/* BESTSELLER sidebar card — expands to full display on scroll */}
          <div className="flex-shrink-0 h-full z-20" style={{ width: `${sidebarWidth}px` }}>
            <div
              className="border border-black bg-white w-full h-full flex items-center justify-center"
              style={{
                borderRadius: `${cardRadius}rem`,
                willChange: 'width, border-radius',
              }}
            >
              <span className="vertical-text font-['Impact','Anton',sans-serif] text-[clamp(50px,8vh,90px)] font-bold text-black leading-none tracking-tight whitespace-nowrap">
                BESTSELLER
              </span>
            </div>
          </div>

          {/* Product grid — squeezed out as the sidebar expands */}
          <div
            className="flex-1 min-w-0 h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 auto-rows-fr overflow-hidden"
            style={{
              transform: `scale(${gridScale})`,
              transformOrigin: 'center center',
              opacity: gridOpacity,
              willChange: 'transform, opacity',
            }}
          >
            {products.map((p) => (
              <div
                key={p.seed}
                className={`border border-black rounded p-6 flex flex-col items-center justify-between bg-white overflow-hidden ${p.tall ? 'row-span-2' : ''}`}
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
  );
}