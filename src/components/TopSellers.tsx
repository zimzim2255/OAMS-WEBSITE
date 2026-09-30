"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { flashDesigns } from "@/lib/flashDesigns";

// "Our Top Sellers" — a two-row table of products separated by vertical black
// lines. The two rows are arrow-driven and move in OPPOSITE directions: the top
// row slides right while the bottom row slides left (and the reverse). Text
// sits under the full-width, tall product photos.
export default function TopSellers() {
  const topTrackRef = useRef<HTMLDivElement>(null);
  const bottomTrackRef = useRef<HTMLDivElement>(null);

  // Pick the most popular products (by reviews, falling back to rating).
  const sellers = [...flashDesigns]
    .sort((a, b) => (b.reviews || b.rating) - (a.reviews || a.rating))
    .slice(0, 10);

  // Two rows of 5; duplicate each 3x so both rows have room to scroll in
  // either direction under the arrows.
  const topRow = Array.from({ length: 3 }, () => sellers.slice(0, 5)).flat();
  const bottomRow = Array.from({ length: 3 }, () => sellers.slice(5, 10)).flat();

  // Center both tracks pre-paint (and on resize) so there is equal room to
  // scroll left/right — otherwise the opposite-direction arrow won't move.
  useLayoutEffect(() => {
    const top = topTrackRef.current;
    const bottom = bottomTrackRef.current;
    if (!top || !bottom) return;

    const center = (el: HTMLElement) => {
      const max = el.scrollWidth - el.clientWidth;
      // Avoid the html's `scroll-behavior: smooth` smoothing the snap.
      el.style.scrollBehavior = "auto";
      el.scrollLeft = (max > 0 ? max : 0) / 2;
      el.style.scrollBehavior = "";
    };

    center(top);
    center(bottom);

    const onResize = () => {
      center(top);
      center(bottom);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const step = (dir: 1 | -1) => {
    const top = topTrackRef.current;
    const bottom = bottomTrackRef.current;
    if (!top || !bottom) return;
    const cw = top.querySelector<HTMLElement>("[data-cell]")?.offsetWidth ?? 300;
    const maxTop = top.scrollWidth - top.clientWidth;
    const maxBottom = bottom.scrollWidth - bottom.clientWidth;
    // Top row scrolls +dir, bottom row scrolls -dir (opposite directions).
    const nextTop = Math.max(0, Math.min(maxTop, top.scrollLeft + dir * cw));
    const nextBottom = Math.max(0, Math.min(maxBottom, bottom.scrollLeft - dir * cw));
    top.scrollTo({ left: nextTop, behavior: "smooth" });
    bottom.scrollTo({ left: nextBottom, behavior: "smooth" });
  };

  const renderRow = (row: typeof topRow) =>
    row.map((p, i) => {
      const isSoldOut = Object.values(p.stock).every((s) => s <= 0);
      return (
        <Link
          key={`${p.id}-${i}`}
          href={`/products/${p.id}`}
          data-cell
          className="cursor-target block shrink-0 w-56 sm:w-72 border-l border-black px-6 py-6 transition-colors hover:bg-black"
        >
          {/* Full-width, taller photo with text below */}
          <div className="w-full overflow-hidden bg-[#e9e7e3]">
            <img
              src={p.image}
              alt={p.name}
              className={`w-full aspect-[3/4] object-cover ${isSoldOut ? "opacity-50" : ""}`}
            />
          </div>
          <div className="flex flex-col gap-1 mt-4 text-black">
            <span className="text-xs sm:text-sm uppercase tracking-widest hover:text-white">{p.name}</span>
            <span className="text-sm sm:text-base font-semibold hover:text-white">
              {p.price} DH
              {isSoldOut && <span className="ml-2 text-[10px] text-red-500 uppercase">Sold out</span>}
            </span>
          </div>
        </Link>
      );
    });

  return (
    <section className="w-full bg-[#fcfdf7] py-14 md:py-20 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 sm:px-10 mb-10">
        <h2 className="font-['Impact','Anton',sans-serif] text-3xl md:text-5xl font-bold uppercase text-black tracking-tight">
          Our Top Sellers
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous products"
            className="cursor-target w-12 h-12 flex items-center justify-center border border-black text-black hover:bg-black hover:text-white transition-colors"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next products"
            className="cursor-target w-12 h-12 flex items-center justify-center border border-black text-black hover:bg-black hover:text-white transition-colors"
          >
            &rarr;
          </button>
        </div>
      </div>

      {/* Top row — moves right when "→" is pressed */}
      <div ref={topTrackRef} className="overflow-x-auto border-y border-black [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max will-change-transform">
          {renderRow(topRow)}
        </div>
      </div>

      {/* Bottom row — moves left when "→" is pressed */}
      <div ref={bottomTrackRef} className="overflow-x-auto border-b border-black [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max will-change-transform">
          {renderRow(bottomRow)}
        </div>
      </div>
    </section>
  );
}