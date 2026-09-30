"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * HeroSlider — the homepage hero slide gallery, driven by the database.
 * Admins manage the slides (add / remove / reorder / activate) in the
 * admin panel under "Hero Slides". This component just fetches the active
 * slides from `/api/hero-slides`, auto-plays through them, and lets the
 * visitor navigate with the arrow buttons or the dot indicators.
 */

interface Slide {
  id: string;
  title?: string;
  imageUrl: string;
  route?: string;
}

const AUTOPLAY_MS = 5000;

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/hero-slides");
        if (res.ok) {
          const data = await res.json();
          setSlides(data.slides ?? []);
        }
      } catch {
        // ignore network errors — the hero simply stays empty
      }
    })();
  }, []);

  // Auto-advance the gallery; pause while the pointer hovers over it.
  useEffect(() => {
    if (slides.length === 0 || paused) return;
    const id = setTimeout(() => setIndex((index + 1) % slides.length), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, slides.length, paused]);

  const go = (dir: 1 | -1) => setIndex((index + dir + Math.max(slides.length, 1)) % slides.length);

  if (slides.length === 0) return null;

  const showControls = slides.length > 1;

  return (
    <section
      className="relative w-full min-h-[80vh] sm:min-h-[90vh] lg:min-h-[100vh] bg-[#f2f1ef] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides stacked; only the active one is visible */}
      {slides.map((s, i) => {
        const image = (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.imageUrl} alt={s.title ?? "OAMS slide"} className="absolute inset-0 w-full h-full object-cover" />
        );
        return (
          <div
            key={s.id}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          >
            {s.route ? (
              <Link href={s.route} className="absolute inset-0 block">
                {image}
              </Link>
            ) : (
              image
            )}
          </div>
        );
      })}

      {showControls && (
        <>
          {/* Prev / next arrows */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 cursor-target w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border border-black bg-white/90 text-black hover:bg-black hover:text-white transition-colors"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 cursor-target w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border border-black bg-white/90 text-black hover:bg-black hover:text-white transition-colors"
          >
            &rarr;
          </button>

          {/* Slide indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-black" : "w-2 bg-black/40 hover:bg-black/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}