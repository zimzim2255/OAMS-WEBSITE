'use client';

import { useEffect, useRef, useState } from 'react';

export default function ZoomSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentInnerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0 → 1, one single timeline

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentInnerRef.current;
    if (!wrapper || !content) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Total scroll distance = wrapper top → end of content
          const start = wrapper.offsetTop;
          const end = start + wrapper.offsetHeight - window.innerHeight;
          const scrollY = window.scrollY;
          const newProgress = Math.max(0, Math.min(1, (scrollY - start) / (end - start)));
          setProgress(newProgress);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Content height — used to calculate translateY
  const contentHeight = 400; // in vh units (hero: 100 + story: 100 + more: 100 + cards: ~100)
  const scrollableContent = contentHeight - 100; // content height minus viewport = translate range

  // Three phases from one progress value:
  // 0–0.1: expand    (scale 0.85 → 1.0)
  // 0.1–0.9: scroll  (translateY 0 → contentHeight - 100vh)
  // 0.9–1.0: shrink  (scale 1.0 → 0.85)

  let scale: number;
  let translateY: number;

  if (progress < 0.1) {
    // Expanding
    const t = progress / 0.1;
    scale = 0.85 + t * 0.15;
    translateY = 0;
  } else if (progress < 0.9) {
    // Scrolling content
    const t = (progress - 0.1) / 0.8;
    scale = 1.0;
    translateY = -t * scrollableContent; // in vh
  } else {
    // Shrinking
    const t = (progress - 0.9) / 0.1;
    scale = 1.0 - t * 0.15;
    translateY = -scrollableContent; // stay at bottom
  }

  // Background opacity: fades in during expand, stays, fades out during shrink
  let bgOpacity: number;
  if (progress < 0.1) {
    bgOpacity = progress / 0.1; // 0 → 1
  } else if (progress < 0.9) {
    bgOpacity = 1;
  } else {
    bgOpacity = 1 - (progress - 0.9) / 0.1; // 1 → 0
  }

  return (
    <>
      {/* Fixed background — fades in/out */}
      <div
        className="fixed inset-0 z-0 bg-black pointer-events-none"
        style={{
          opacity: bgOpacity,
          transition: 'opacity 0.3s ease',
        }}
      >
        <img
          src="/imgs/aboutus.png"
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: "grayscale(100%) contrast(1.2)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      </div>

      {/* Sticky wrapper — height = viewport + total scroll room */}
      <div
        ref={wrapperRef}
        className="relative h-[440vh]"
      >
        <section className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          {/* Content scales and translates as one GPU-accelerated layer */}
          <div
            ref={contentInnerRef}
            className="w-full h-full will-change-transform"
            style={{
              transform: `scale(${scale}) translateY(${translateY}vh)`,
              transformOrigin: 'center center',
            }}
          >
            {/* Hero intro */}
            <section className="h-screen flex flex-col items-center justify-center px-6 text-center">
              <h1 className="text-5xl md:text-8xl font-bold uppercase mb-8 font-['Impact','Anton',sans-serif] tracking-tight">
                Black t-shirt<br />on hanger
              </h1>
              <p className="text-sm font-bold uppercase tracking-[0.3em] mb-12 text-white/80">
                ABOUT THE BRAND
              </p>
              <p className="max-w-3xl text-lg md:text-xl leading-relaxed text-white/90">
                VLOM.CUST is a clothing brand that creates unique look. It involves clothes. We make a design in the form customized made shades of darkness allocated in oil, since 2018.
              </p>
            </section>

            {/* Story section */}
            <section className="h-screen flex flex-col justify-center px-6 md:px-20 py-20">
              <div className="max-w-4xl">
                <p className="text-base md:text-lg leading-relaxed mb-8 text-white/80">
                  Each piece is hand-operated by our artisans, which guarantees the absence of faults absolutely identical products. In this approach you can choose among several elements to create your own clothes.
                </p>
                <p className="text-2xl md:text-4xl font-bold uppercase font-['Impact','Anton',sans-serif] tracking-tight">
                  create your own<br />unique look
                </p>
              </div>
            </section>

            {/* More story */}
            <section className="h-screen flex flex-col justify-center px-6 md:px-20 py-20">
              <div className="max-w-4xl">
                <p className="text-base md:text-lg leading-relaxed mb-8 text-white/80">
                  VLOM.CUST is a clothing brand that creates unique look. It involves clothes. We make a design in the form customized made shades of darkness allocated in oil, since 2018.
                </p>
                <p className="text-base md:text-lg leading-relaxed text-white/80">
                  Each piece is hand-operated by our artisans, which guarantees the absence of faults absolutely identical products. In this approach you can choose among several elements to create your own clothes.
                </p>
              </div>
            </section>

            {/* Product Cards */}
            <section className="h-auto px-6 md:px-20 py-20">
              <h2 className="text-3xl md:text-5xl font-bold uppercase mb-16 font-['Impact','Anton',sans-serif] tracking-tight text-center">
                Our Collection
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Card 1: T-Shirt */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden group hover:bg-white/20 transition-all duration-500">
                  <div className="h-72 flex items-center justify-center p-8">
                    <img
                      src="https://picsum.photos/seed/graffititshirt/300/250"
                      alt="T-Shirt VLOM.CUST"
                      className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                      style={{ filter: "grayscale(100%)" }}
                    />
                  </div>
                  <div className="p-6 border-t border-white/10">
                    <h3 className="text-lg font-bold uppercase">T-SHIRT VLOM.CUST</h3>
                    <p className="text-sm text-white/60">Vintage black</p>
                    <p className="text-lg font-bold mt-2">
                      <span className="line-through text-white/40 mr-2">$49</span>
                      <span>$39</span>
                    </p>
                  </div>
                </div>

                {/* Card 2: Cardholder */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden group hover:bg-white/20 transition-all duration-500">
                  <div className="h-72 flex items-center justify-center p-8">
                    <img
                      src="https://picsum.photos/seed/cardholder/300/450"
                      alt="Cardholder VLOM.CUST"
                      className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                      style={{ filter: "grayscale(100%)" }}
                    />
                  </div>
                  <div className="p-6 border-t border-white/10">
                    <h3 className="text-lg font-bold uppercase">CARDHOLDER VLOM.CUST</h3>
                    <p className="text-sm text-white/60">Black</p>
                    <p className="text-lg font-bold mt-2">$39</p>
                  </div>
                </div>

                {/* Card 3: Backpack */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden group hover:bg-white/20 transition-all duration-500">
                  <div className="h-72 flex items-center justify-center p-8">
                    <img
                      src="https://picsum.photos/seed/backpack/300/250"
                      alt="Calligraphy Backpack"
                      className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                      style={{ filter: "grayscale(100%)" }}
                    />
                  </div>
                  <div className="p-6 border-t border-white/10">
                    <h3 className="text-lg font-bold uppercase">CALLIGRAPHY BACKPACK</h3>
                    <p className="text-sm text-white/60">Black</p>
                    <p className="text-lg font-bold mt-2">
                      <span className="line-through text-white/40 mr-2">$99</span>
                      <span>$79</span>
                    </p>
                  </div>
                </div>

                {/* Card 4: Leather Jacket */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden group hover:bg-white/20 transition-all duration-500">
                  <div className="h-72 flex items-center justify-center p-8">
                    <img
                      src="https://picsum.photos/seed/leatherjacket/300/250"
                      alt="Leather Jacket VLOM.CUST"
                      className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                      style={{ filter: "grayscale(100%)" }}
                    />
                  </div>
                  <div className="p-6 border-t border-white/10">
                    <h3 className="text-lg font-bold uppercase">LEATHER JACKET VLOM.CUST</h3>
                    <p className="text-sm text-white/60">Vintage grey</p>
                    <p className="text-lg font-bold mt-2">$299</p>
                  </div>
                </div>

                {/* Card 5: Sneakers */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden group hover:bg-white/20 transition-all duration-500">
                  <div className="h-72 flex items-center justify-center p-8">
                    <img
                      src="https://picsum.photos/seed/sneakers/300/250"
                      alt="Sneakers VLOM.CUST"
                      className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                      style={{ filter: "grayscale(100%)" }}
                    />
                  </div>
                  <div className="p-6 border-t border-white/10">
                    <h3 className="text-lg font-bold uppercase">SNEAKERS VLOM.CUST</h3>
                    <p className="text-sm text-white/60">Black & white</p>
                    <p className="text-lg font-bold mt-2">
                      <span className="line-through text-white/40 mr-2">$119</span>
                      <span>$95</span>
                    </p>
                  </div>
                </div>

                {/* Card 6: View More */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer group hover:bg-white/20 transition-all duration-500 min-h-[300px]">
                  <div className="text-center">
                    <p className="text-lg font-bold uppercase tracking-wider">VIEW MORE</p>
                    <span className="text-3xl mt-2 block transition-transform duration-500 group-hover:translate-x-2">→</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </>
  );
}