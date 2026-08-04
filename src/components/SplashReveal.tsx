'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const PANELS = [
  { color: '#000000', textColor: '#ffffff' },
  { color: '#ffffff', textColor: '#000000' },
  { color: '#000000', textColor: '#ffffff' },
  { color: '#ffffff', textColor: '#000000' },
];

export default function SplashReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSplash, setShowSplash] = useState(false);

  // Play only once per browser session
  useEffect(() => {
    if (sessionStorage.getItem('oams_splash_played')) return;
    sessionStorage.setItem('oams_splash_played', 'true');
    setShowSplash(true);
  }, []);

  // Run the reveal animation
  useEffect(() => {
    if (!showSplash) return;

    const container = containerRef.current;
    const panels = container?.querySelectorAll<HTMLElement>('[data-splash-panel]');
    if (!container || !panels || panels.length === 0) return;

    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        gsap.set(container, { display: 'none' });
      },
    });

    // Panels slide in one by one — each takes the full screen before the next covers it.
    // Directions: right → top → right → left. Colors alternate black/white.
    tl.fromTo(panels[0], { xPercent: 100 }, { xPercent: 0, duration: 0.8, ease: 'power4.inOut' })    // 1st: from right
      .to({}, { duration: 0.3 })                                                                      // hold full display
      .fromTo(panels[1], { yPercent: -100 }, { yPercent: 0, duration: 0.8, ease: 'power4.inOut' })   // 2nd: from top
      .to({}, { duration: 0.3 })                                                                      // hold full display
      .fromTo(panels[2], { xPercent: 100 }, { xPercent: 0, duration: 0.8, ease: 'power4.inOut' })    // 3rd: from right
      .to({}, { duration: 0.3 })                                                                      // hold full display
      .fromTo(panels[3], { xPercent: -100 }, { xPercent: 0, duration: 0.8, ease: 'power4.inOut' })   // 4th: from left
      // Hold the final panel briefly so it's readable
      .to({}, { duration: 0.7 })
      // Final reveal: all panels slide up together like a curtain
      .to(panels, { yPercent: -100, duration: 0.9, ease: 'power4.inOut', stagger: 0.09 });

    return () => {
      document.body.style.overflow = '';
      tl.kill();
    };
  }, [showSplash]);

  if (!showSplash) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100]">
      {PANELS.map((p, i) => (
        <div
          key={i}
          data-splash-panel
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          style={{ backgroundColor: p.color, zIndex: i + 1 }}
        >
          <span
            className="font-['Impact','Anton',sans-serif] text-5xl sm:text-8xl font-bold uppercase tracking-tight"
            style={{ color: p.textColor }}
          >
            OAMS
          </span>
        </div>
      ))}
    </div>
  );
}