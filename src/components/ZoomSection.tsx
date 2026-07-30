'use client';

import { useEffect, useRef, useState } from 'react';

export default function ZoomSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inset, setInset] = useState(40); // 40% → 0% as user scrolls
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleScroll = () => {
      const rect = wrapper.getBoundingClientRect();

      // When the wrapper is at the top of the viewport or being scrolled through
      if (rect.top <= 0 && rect.bottom > 0) {
        // Calculate progress: how much of the extra scroll space has been used
        const scrollSpace = rect.height - window.innerHeight; // 150vh - 100vh = 50vh
        const scrolled = Math.abs(rect.top);
        const progress = Math.min(scrolled / scrollSpace, 1);

        // Map progress to inset: 40% → 0%
        const newInset = 40 - progress * 40;
        setInset(newInset);

        if (progress >= 1) {
          setIsComplete(true);
          setInset(0);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={wrapperRef} className="relative h-[150vh]">
      <section
        className="sticky top-0 h-screen w-full bg-black text-white overflow-hidden"
        style={{
          clipPath: `inset(${inset}% ${inset}% ${inset}% ${inset}%)`,
          transition: isComplete
            ? 'clip-path 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            : 'clip-path 0.1s ease-out',
        }}
      >
        {/* Background atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />

        {/* Image - always fills the section fully */}
        <div className="absolute inset-0">
          <img
            src="/imgs/aboutus.png"
            alt="Black t-shirt on hanger"
            className="w-full h-full object-cover"
            style={{ filter: "grayscale(100%) contrast(1.2)" }}
          />
        </div>

        {/* Top Left: About label */}
        <div className="absolute top-12 left-10 z-20">
          <p className="text-sm font-bold uppercase tracking-wider text-white">ABOUT THE BRAND</p>
        </div>

        {/* Top Left: Description */}
        <div className="absolute top-24 left-10 z-20 max-w-[300px]">
          <p className="text-[12px] text-white leading-relaxed">
            VLOM.CUST is a clothing brand that creates unique look. It involves clothes. We make a design in the form customized made shades of darkness allocated in oil, since 2018.
          </p>
        </div>

        {/* Right Side Text */}
        <div className="absolute bottom-24 right-20 z-20 max-w-[250px] text-right">
          <p className="text-[11px] text-white leading-relaxed">
            Each piece is hand-operated by our artisans, which guarantees the absence of faults absolutely identical products. In this approach you can choose among several elements to create your own clothes.
          </p>
          <p className="text-base font-bold uppercase text-white mt-4">
            create your own unique look
          </p>
        </div>

        {/* Scroll hint */}
        {!isComplete && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        )}
      </section>
    </div>
  );
}