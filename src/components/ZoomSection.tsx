'use client';

import { useEffect, useRef, useState } from 'react';

const leftProducts = [
  { seed: 'graffititshirt', title: 'T-SHIRT VLOM.CUST', subtitle: 'Vintage black', price: '$39', oldPrice: '$49' },
  { seed: 'backpack', title: 'CALLIGRAPHY BACKPACK', subtitle: 'Black', price: '$79', oldPrice: '$99' },
  { seed: 'sneakers', title: 'SNEAKERS VLOM.CUST', subtitle: 'Black & white', price: '$95', oldPrice: '$119' },
  { seed: 'hat', title: 'CAP VLOM.CUST', subtitle: 'Black', price: '$29' },
  { seed: 'bag', title: 'SHOPPER BAG VLOM.CUST', subtitle: 'Canvas black', price: '$49' },
  { seed: 'scarf', title: 'SCARF VLOM.CUST', subtitle: 'Black wool', price: '$69' },
  { seed: 'socks', title: 'SOCKS VLOM.CUST', subtitle: 'Black cotton', price: '$19', oldPrice: '$29' },
];

const rightProducts = [
  { seed: 'wallet', title: 'WALLET VLOM.CUST', subtitle: 'Black leather', price: '$89' },
  { seed: 'gloves', title: 'GLOVES VLOM.CUST', subtitle: 'Black knit', price: '$34', oldPrice: '$44' },
  { seed: 'scarf', title: 'SCARF VLOM.CUST', subtitle: 'Black wool', price: '$69' },
  { seed: 'belt', title: 'BELT VLOM.CUST', subtitle: 'Black leather', price: '$59', oldPrice: '$79' },
  { seed: 'hoodie', title: 'HOODIE VLOM.CUST', subtitle: 'Oversized black', price: '$89', oldPrice: '$109' },
  { seed: 'watch', title: 'WATCH VLOM.CUST', subtitle: 'Black steel', price: '$199', oldPrice: '$249' },
  { seed: 'leatherjacket', title: 'LEATHER JACKET VLOM.CUST', subtitle: 'Vintage grey', price: '$299' },
  { seed: 'cardholder', title: 'CARDHOLDER VLOM.CUST', subtitle: 'Black', price: '$39' },
];

export default function ZoomSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'idle' | 'opening' | 'scrolling'>('idle');
  const [progress, setProgress] = useState(0);

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

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'opening') return;
    const timer = setTimeout(() => {
      setPhase('scrolling');
      document.body.style.overflow = '';
    }, 1600);
    return () => { clearTimeout(timer); document.body.style.overflow = ''; };
  }, [phase]);

  const contentHeight = 800;
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

  const cardBase = "bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden group hover:bg-white/20 transition-all duration-500 w-[280px] max-w-[38vw]";

  return (
    <>
      <div ref={wrapperRef} className="relative h-[840vh]">
        <section className="sticky top-0 h-screen w-full overflow-hidden bg-black flex items-center justify-center">
          {/* Everything scales together as one unit */}
          <div className="w-full h-full will-change-transform" style={{ transform: `scale(${displayScale})`, transformOrigin: 'center center', transition: transitionStyle }}>
            
            {/* Background image */}
            <div className="absolute inset-0">
              <img src="/imgs/aboutus.png" alt="" className="w-full h-full object-cover" style={{ filter: "grayscale(100%) contrast(1.2)" }} />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
            </div>

            {/* White border */}
            <div className="absolute inset-0 z-20 pointer-events-none" style={{ border: `${borderWidth}px solid white`, transition: phase === 'opening' ? 'none' : 'border-width 0.4s ease-out' }} />

            {/* Cards content */}
            <div className="relative w-full h-[800vh] text-white z-10">
              <h2 className="text-3xl md:text-5xl font-bold uppercase font-['Impact','Anton',sans-serif] tracking-tight text-center pt-8 pb-4">
                Our Collection
              </h2>

              <div className="flex justify-center gap-16 mt-[160vh]">
                <div className="flex flex-col items-center gap-6" style={{ transform: `translateY(${phase === 'scrolling' ? displayTranslateY * 0.35 : 0}vh)`, transition: 'transform 0.2s ease-out' }}>
                  {leftProducts.map((p, idx) => (
                    <div key={idx} className={cardBase}>
                      <div className="h-48 overflow-hidden">
                        <img src={`https://picsum.photos/seed/${p.seed}/300/250`} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" style={{ filter: "grayscale(100%)" }} />
                      </div>
                      <div className="p-3 border-t border-white/10">
                        <h3 className="text-sm font-bold uppercase">{p.title}</h3>
                        <p className="text-[11px] text-white/60">{p.subtitle}</p>
                        <p className="text-sm font-bold mt-1">
                          {p.oldPrice && <span className="line-through text-white/40 mr-2">{p.oldPrice}</span>}
                          <span>{p.price}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className={`${cardBase} flex items-center justify-center cursor-pointer min-h-[100px]`}>
                    <div className="text-center p-4">
                      <p className="text-sm font-bold uppercase tracking-wider">VIEW MORE</p>
                      <span className="text-xl mt-1 block transition-transform duration-500 group-hover:translate-x-2">→</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-6" style={{ transform: `translateY(${phase === 'scrolling' ? -240 + scrollT * 160 : -240}vh)`, transition: 'transform 0.3s ease-out' }}>
                  {rightProducts.map((p, idx) => (
                    <div key={idx} className={cardBase}>
                      <div className="h-48 overflow-hidden">
                        <img src={`https://picsum.photos/seed/${p.seed}/300/250`} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" style={{ filter: "grayscale(100%)" }} />
                      </div>
                      <div className="p-3 border-t border-white/10">
                        <h3 className="text-sm font-bold uppercase">{p.title}</h3>
                        <p className="text-[11px] text-white/60">{p.subtitle}</p>
                        <p className="text-sm font-bold mt-1">
                          {p.oldPrice && <span className="line-through text-white/40 mr-2">{p.oldPrice}</span>}
                          <span>{p.price}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className={`${cardBase} flex items-center justify-center cursor-pointer min-h-[100px]`}>
                    <div className="text-center p-4">
                      <p className="text-sm font-bold uppercase tracking-wider">VIEW MORE</p>
                      <span className="text-xl mt-1 block transition-transform duration-500 group-hover:translate-x-2">→</span>
                    </div>
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