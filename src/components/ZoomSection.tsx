'use client';

import { useEffect, useRef, useState } from 'react';

export default function ZoomSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Scroll-driven expand animation (only while in sticky mode)
  useEffect(() => {
    if (isExpanded) return;

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleScroll = () => {
      const rect = wrapper.getBoundingClientRect();

      if (rect.top <= 0 && rect.bottom > 0) {
        const scrollSpace = rect.height - window.innerHeight;
        const scrolled = Math.abs(rect.top);
        const newProgress = Math.min(scrolled / scrollSpace, 1);
        setProgress(newProgress);

        if (newProgress >= 1) {
          setIsExpanded(true);
        }
      } else if (rect.top > 0) {
        setProgress(0);
      } else if (rect.bottom <= 0) {
        setIsExpanded(true);
        setProgress(1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isExpanded]);

  // ===== EXPANDED STATE: normal flow layout, no nested overflow =====
  if (isExpanded) {
    return (
      <>
        {/* Fixed background image — covers the whole viewport */}
        <div className="fixed inset-0 z-0 bg-black">
          <img
            src="/imgs/aboutus.png"
            alt="Black t-shirt on hanger"
            className="w-full h-full object-cover"
            style={{ filter: "grayscale(100%) contrast(1.2)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
        </div>

        {/* Scrollable content on top of the fixed background */}
        <div className="relative z-10 text-white">
          {/* Hero intro */}
          <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
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
          <section className="min-h-screen flex flex-col justify-center px-6 md:px-20 py-20">
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
          <section className="min-h-screen flex flex-col justify-center px-6 md:px-20 py-20">
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
          <section className="px-6 md:px-20 pb-20">
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
      </>
    );
  }

  // ===== EXPANDING STATE: sticky section with clip-path animation =====
  const inset = 15 - progress * 15;

  return (
    <div ref={wrapperRef} className="relative h-[200vh]">
      <section
        className="sticky top-0 h-screen w-full bg-black text-white overflow-hidden"
        style={{
          clipPath: `inset(${inset}% ${inset}% ${inset}% ${inset}%)`,
        }}
      >
        {/* Background atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />

        {/* Image */}
        <div className="absolute inset-0">
          <img
            src="/imgs/aboutus.png"
            alt="Black t-shirt on hanger"
            className="w-full h-full object-cover"
            style={{ filter: "grayscale(100%) contrast(1.2)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
        </div>

        {/* Top Left: About label */}
        <div className="absolute top-12 left-10 z-10">
          <p className="text-sm font-bold uppercase tracking-wider text-white">ABOUT THE BRAND</p>
        </div>

        {/* Top Left: Description */}
        <div className="absolute top-24 left-10 z-10 max-w-[300px]">
          <p className="text-[12px] text-white leading-relaxed">
            VLOM.CUST is a clothing brand that creates unique look. It involves clothes. We make a design in the form customized made shades of darkness allocated in oil, since 2018.
          </p>
        </div>

        {/* Right Side Text */}
        <div className="absolute bottom-24 right-20 z-10 max-w-[250px] text-right">
          <p className="text-[11px] text-white leading-relaxed">
            Each piece is hand-operated by our artisans, which guarantees the absence of faults absolutely identical products. In this approach you can choose among several elements to create your own clothes.
          </p>
          <p className="text-base font-bold uppercase text-white mt-4">
            create your own unique look
          </p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>
    </div>
  );
}