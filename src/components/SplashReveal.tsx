"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const PANELS = [
  { color: "#000000", textColor: "#ffffff" },
  { color: "#ffffff", textColor: "#000000" },
  { color: "#000000", textColor: "#ffffff" },
  { color: "#ffffff", textColor: "#000000" },
];

export default function SplashReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Splash starts VISIBLE so it's in the initial server-rendered HTML.
  const [showSplash, setShowSplash] = useState(true);

  // Skip instantly (before paint) for visitors who already saw it this session.
  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem("oams_splash_played")) {
        setShowSplash(false);
      }
    } catch {
      // If storage is unavailable, just play the splash.
    }
  }, []);

  // CRITICAL: park every panel off-screen BEFORE the browser paints.
  // The container is opaque black, so the very first frame is a black screen —
  // the homepage content underneath is never visible before the splash.
  useLayoutEffect(() => {
    if (!showSplash) return;
    const panels = containerRef.current?.querySelectorAll<HTMLElement>("[data-splash-panel]");
    if (!panels || panels.length === 0) return;
    gsap.set(panels[0], { xPercent: 100 });
    gsap.set(panels[1], { yPercent: -100 });
    gsap.set(panels[2], { xPercent: 100 });
    gsap.set(panels[3], { xPercent: -100 });
  }, [showSplash]);

  // Run the reveal animation.
  useEffect(() => {
    if (!showSplash) return;

    const container = containerRef.current;
    const panels = container?.querySelectorAll<HTMLElement>("[data-splash-panel]");
    if (!container || !panels || panels.length === 0) return;

    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        try {
          sessionStorage.setItem("oams_splash_played", "true");
        } catch {
          // ignore
        }
        setShowSplash(false);
        gsap.set(container, { display: "none" });
      },
    });

    // Panels slide in one by one — each takes the full screen before the next covers it.
    // Directions: right → top → right → left. Colors alternate black/white.
    tl.fromTo(panels[0], { xPercent: 100 }, { xPercent: 0, duration: 0.8, ease: "power4.inOut" })    // 1st: from right
      .to({}, { duration: 0.2 })                                                                      // hold full display
      .fromTo(panels[1], { yPercent: -100 }, { yPercent: 0, duration: 0.8, ease: "power4.inOut" })   // 2nd: from top
      .to({}, { duration: 0.2 })                                                                      // hold full display
      .fromTo(panels[2], { xPercent: 100 }, { xPercent: 0, duration: 0.8, ease: "power4.inOut" })    // 3rd: from right
      .to({}, { duration: 0.2 })                                                                      // hold full display
      .fromTo(panels[3], { xPercent: -100 }, { xPercent: 0, duration: 0.8, ease: "power4.inOut" })   // 4th: from left
      // Hold the final panel briefly so it's readable
      .to({}, { duration: 0.6 })
      // Final reveal: all panels slide up together like a curtain
      .to(panels, { yPercent: -100, duration: 0.9, ease: "power4.inOut", stagger: 0.09 });

    return () => {
      document.body.style.overflow = "";
      tl.kill();
    };
  }, [showSplash]);

  if (!showSplash) return null;

  return (
    // Opaque black background: guarantees the splash is the FIRST thing faced,
    // even before the JS animation starts. The homepage stays hidden behind it.
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-black">
      {PANELS.map((p, i) => (
        <div
          key={i}
          data-splash-panel
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          style={{ backgroundColor: p.color, zIndex: i + 1 }}
        >
          <span
            className="font-['Impact','Anton',sans-serif] text-[clamp(44px,18vw,132px)] font-bold uppercase tracking-tight leading-none text-center px-3 py-2"
            style={{ color: p.textColor }}
          >
            OAMS
          </span>
        </div>
      ))}
    </div>
  );
}