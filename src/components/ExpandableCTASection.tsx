'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export default function ExpandableCTASection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [baseHeight, setBaseHeight] = useState<number | null>(null);
  const [viewportH, setViewportH] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );

  // Measure the card's natural height once — on first render height is 'auto'
  // so this captures the exact same size as the original static section.
  useLayoutEffect(() => {
    if (baseHeight === null && cardRef.current) {
      const h = cardRef.current.offsetHeight;
      if (h > 0) setBaseHeight(h);
    }
  }, [baseHeight]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = wrapper.getBoundingClientRect();
          const total = wrapper.offsetHeight - window.innerHeight;
          setProgress(clamp(-rect.top / total, 0, 1));
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleResize = () => setViewportH(window.innerHeight);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    handleScroll();
    handleResize();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // The card sits normal & pinned for the first ~2 scrolls, then slowly
  // expands to fill the whole screen — and contracts again when scrolling up.
  const HOLD = 0.15;
  const t = clamp((progress - HOLD) / (1 - HOLD), 0, 1);
  const eased = easeInOut(t);

  // Full screen minus the p-3 padding (12px top + 12px bottom)
  const targetHeight = Math.max(baseHeight ?? 0, viewportH - 24);
  const cardHeight =
    baseHeight === null ? 'auto' : baseHeight + eased * (targetHeight - baseHeight);

  // Subtle scale-up of the heading as the card fills the screen
  const contentScale = 1 + 0.08 * eased;

  return (
    <div ref={wrapperRef} className="relative bg-black" style={{ height: '250vh' }}>
      <section className="sticky top-0 h-screen w-full overflow-hidden bg-black select-none flex items-center justify-center p-3">
        {/* Centered card → grows up AND down symmetrically as the user scrolls */}
        <div
          ref={cardRef}
          className="bg-black border border-white rounded flex flex-col items-center justify-center px-6 py-24 w-full overflow-hidden"
          style={{ height: cardHeight, willChange: 'height' }}
        >
          <h3
            className="font-['Impact','Anton',sans-serif] text-[clamp(40px,8vw,110px)] font-bold uppercase text-white leading-none tracking-tight text-center"
            style={{
              transform: `scale(${contentScale})`,
              willChange: 'transform',
            }}
          >
            SHOP THE ICONS
          </h3>
          <p className="mt-6 text-xs md:text-sm uppercase tracking-widest text-white/60 text-center">
            Limited stock — restocked weekly
          </p>
          <div className="cursor-target mt-10 bg-white text-black flex items-center justify-between px-8 py-4 cursor-pointer">
            <span className="text-sm font-bold uppercase tracking-wider">VIEW ALL BESTSELLERS</span>
            <span className="text-lg ml-6">→</span>
          </div>
        </div>
      </section>
    </div>
  );
}