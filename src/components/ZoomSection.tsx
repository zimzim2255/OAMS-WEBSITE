'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const leftProducts = [
  { id: 1, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846845/blackshort_casse28pcs_grayclair40pcs_grayfonce116pcs_vert_36_noir186pcs-prix80dh_xnlqg7.png' },
  { id: 2, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846844/nikeshort_reed36_green_28_mint_11_marron_40pcs_grayclair_32_bleu39pcs_grayfance71pcs_noir120pcs-prix65dh_rzwyiq.png' },
  { id: 3, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785922185/50pcsinblue_green_brown_prix70dh_ac5pvh.png_rezifm.png' },
  { id: 4, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846823/swdpentes_black60pcs_grayclair60pcs_vert24pcs_marron30pcs_grayfance30pcs_prix80dh_jummmi.png' },
  { id: 5, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846788/greenshort_in_stock_36pcs_reed28pcs_grayfonce144pcs_casse40pcs_noir116pcs80dh_ufcu5l.png' },
  { id: 6, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846787/ensombleswdbrand_noir30pcs_grayfoncee30pcs_graydh4pcs-125dh_dskvgv.png' },
  { id: 1, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846845/blackshort_casse28pcs_grayclair40pcs_grayfonce116pcs_vert_36_noir186pcs-prix80dh_xnlqg7.png' },
];

const rightProducts = [
  { id: 2, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846844/nikeshort_reed36_green_28_mint_11_marron_40pcs_grayclair_32_bleu39pcs_grayfance71pcs_noir120pcs-prix65dh_rzwyiq.png' },
  { id: 3, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785922185/50pcsinblue_green_brown_prix70dh_ac5pvh.png_rezifm.png' },
  { id: 4, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846823/swdpentes_black60pcs_grayclair60pcs_vert24pcs_marron30pcs_grayfance30pcs_prix80dh_jummmi.png' },
  { id: 5, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846788/greenshort_in_stock_36pcs_reed28pcs_grayfonce144pcs_casse40pcs_noir116pcs80dh_ufcu5l.png' },
  { id: 6, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846787/ensombleswdbrand_noir30pcs_grayfoncee30pcs_graydh4pcs-125dh_dskvgv.png' },
  { id: 1, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846845/blackshort_casse28pcs_grayclair40pcs_grayfonce116pcs_vert_36_noir186pcs-prix80dh_xnlqg7.png' },
  { id: 2, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846844/nikeshort_reed36_green_28_mint_11_marron_40pcs_grayclair_32_bleu39pcs_grayfance71pcs_noir120pcs-prix65dh_rzwyiq.png' },
  { id: 3, image: 'https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785922185/50pcsinblue_green_brown_prix70dh_ac5pvh.png_rezifm.png' },
];

export default function ZoomSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'idle' | 'opening' | 'scrolling'>('idle');
  const [progress, setProgress] = useState(0);
  const [viewportW, setViewportW] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = wrapper.getBoundingClientRect();
          const start = wrapper.offsetTop;
          const end = start + wrapper.offsetHeight - window.innerHeight;
          const scrollY = window.scrollY;

          if (rect.top <= 0 && rect.bottom > 0 && phase === 'idle') {
            setPhase('opening');
            document.body.style.overflow = 'hidden';
          }

          if (rect.top > window.innerHeight && phase !== 'idle') {
            setPhase('idle');
            setProgress(0);
            document.body.style.overflow = '';
          }

          if (phase === 'scrolling') {
            const newProgress = Math.max(0, Math.min(1, (scrollY - start) / (end - start)));
            setProgress(newProgress);
          }

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
  }, [phase]);

  useEffect(() => {
    if (phase !== 'opening') return;
    const timer = setTimeout(() => {
      setPhase('scrolling');
      document.body.style.overflow = '';
    }, 1600);
    return () => { clearTimeout(timer); document.body.style.overflow = ''; };
  }, [phase]);

  const isMobile = viewportW < 640;
  const contentHeight = isMobile ? 350 : 800;
  const scrollableContent = contentHeight - 100;
  const scrollT = phase === 'scrolling' ? Math.max(0, Math.min(1, (progress - 0.05) / 0.9)) : 0;

  let displayScale: number;
  let displayTranslateY: number;
  let borderWidth: number;
  let transitionStyle: string;

  if (phase === 'idle') {
    displayScale = 0.25;
    displayTranslateY = 0;
    borderWidth = 40;
    transitionStyle = 'none';
  } else if (phase === 'opening') {
    displayScale = 1.0;
    displayTranslateY = 0;
    borderWidth = 40;
    transitionStyle = 'transform 1.5s cubic-bezier(0.22, 1, 0.36, 1)';
  } else {
    if (progress < 0.05) {
      const t = progress / 0.05;
      displayScale = 0.85 + t * 0.15;
      displayTranslateY = 0;
    } else if (progress < 0.95) {
      const t = (progress - 0.05) / 0.9;
      displayScale = 1.0;
      displayTranslateY = -t * scrollableContent;
    } else {
      const t = (progress - 0.95) / 0.05;
      displayScale = 1.0 - t * 0.15;
      displayTranslateY = -scrollableContent;
    }
    borderWidth = scrollT < 0.15 ? 40 - scrollT * 266 : 0;
    transitionStyle = 'none';
  }

  const cardBase = "bg-white/10 backdrop-blur-md border border-white/20 rounded-[4px] overflow-hidden group hover:bg-white/20 transition-all duration-500 w-[160px] sm:w-[240px] lg:w-[340px] max-w-[42vw]";

  return (
    <>
      <div ref={wrapperRef} className="relative" style={{ height: isMobile ? '350vh' : '840vh' }}>
        <section className="sticky top-0 h-screen w-full overflow-hidden bg-black flex items-center justify-center">
          {/* Everything scales together as one unit */}
          <div className="w-full h-full will-change-transform" style={{ transform: `scale(${displayScale})`, transformOrigin: 'center center', transition: transitionStyle }}>
            
            {/* Background image */}
            <div className="absolute inset-0">
              <img src="/OAMS-WEBSITE/imgs/aboutus.png" alt="" className="w-full h-full object-cover" style={{ filter: "grayscale(100%) contrast(1.2)" }} />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
            </div>

            {/* White border */}
            <div className="absolute inset-0 z-20 pointer-events-none" style={{ border: `${borderWidth}px solid white`, transition: phase === 'opening' ? 'none' : 'border-width 0.4s ease-out' }} />

            {/* Cards content */}
            <div className="relative w-full z-10" style={{ height: isMobile ? '350vh' : '800vh' }}>
              <div className="flex justify-center gap-4 sm:gap-8 lg:gap-16" style={{ marginTop: isMobile ? '60vh' : '160vh' }}>
                <div className="flex flex-col items-center gap-3 sm:gap-6" style={{ transform: `translateY(${phase === 'scrolling' ? displayTranslateY * (isMobile ? 0.25 : 0.35) : 0}vh)`, transition: 'transform 0.2s ease-out' }}>
                  {leftProducts.map((p, idx) => (
                    <Link key={idx} href={`/products/${p.id}`}>
                      <div className={`${cardBase} cursor-pointer`}>
                        <div className="h-[200px] sm:h-[300px] lg:h-[420px] overflow-hidden">
                          <img src={p.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" style={{ filter: "grayscale(100%)" }} />
                        </div>
                      </div>
                    </Link>
                  ))}
                  <div className={`${cardBase} flex items-center justify-center cursor-pointer min-h-[60px] sm:min-h-[100px]`}>
                    <span className="text-xl sm:text-3xl transition-transform duration-500 group-hover:translate-x-2">→</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 sm:gap-6" style={{ transform: `translateY(${phase === 'scrolling' ? (isMobile ? -100 + scrollT * 80 : -240 + scrollT * 160) : (isMobile ? -100 : -240)}vh)`, transition: 'transform 0.3s ease-out' }}>
                  {rightProducts.map((p, idx) => (
                    <Link key={idx} href={`/products/${p.id}`}>
                      <div className={`${cardBase} cursor-pointer`}>
                        <div className="h-[200px] sm:h-[300px] lg:h-[420px] overflow-hidden">
                          <img src={p.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" style={{ filter: "grayscale(100%)" }} />
                        </div>
                      </div>
                    </Link>
                  ))}
                  <div className={`${cardBase} flex items-center justify-center cursor-pointer min-h-[60px] sm:min-h-[100px]`}>
                    <span className="text-xl sm:text-3xl transition-transform duration-500 group-hover:translate-x-2">→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}