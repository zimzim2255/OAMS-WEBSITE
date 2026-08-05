"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";

interface CatalogNavCardProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryCards = [
  { id: "all", name: "ALL PRODUCTS", href: "/products", image: "https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846845/blackshort_casse28pcs_grayclair40pcs_grayfonce116pcs_vert_36_noir186pcs-prix80dh_xnlqg7.png" },
  { id: "shorts", name: "SHORTS", href: "/products?category=shorts", image: "https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846844/nikeshort_reed36_green_28_mint_11_marron_40pcs_grayclair_32_bleu39pcs_grayfance71pcs_noir120pcs-prix65dh_rzwyiq.png" },
  { id: "shirts", name: "SHIRTS", href: "/products?category=shirts", image: "https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785922185/50pcsinblue_green_brown_prix70dh_ac5pvh.png_rezifm.png" },
  { id: "pants", name: "PANTS", href: "/products?category=pants", image: "https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846823/swdpentes_black60pcs_grayclair60pcs_vert24pcs_marron30pcs_grayfance30pcs_prix80dh_jummmi.png" },
  { id: "ensemble", name: "ENSEMBLE", href: "/products?category=ensemble", image: "https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846787/ensombleswdbrand_noir30pcs_grayfoncee30pcs_graydh4pcs-125dh_dskvgv.png" },
  { id: "contact", name: "CONTACT", href: "/contact", image: "https://res.cloudinary.com/dlfbj1ix5/image/upload/v1785846788/greenshort_in_stock_36pcs_reed28pcs_grayfonce144pcs_casse40pcs_noir116pcs80dh_ufcu5l.png" },
];

export default function CatalogNavCard({ isOpen, onClose }: CatalogNavCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Mount state for initial animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Full-page overlay animation on open/close
  useEffect(() => {
    if (!cardRef.current) return;

    const lines = cardRef.current.querySelectorAll("[data-reveal-line]");
    const cards = cardRef.current.querySelectorAll("[data-reveal-card]");

    if (isOpen) {
      // Reset states
      gsap.set(lines, { opacity: 0, y: 20 });
      gsap.set(cards, { opacity: 0, y: 40 });

      // Full page slides in from top
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: -60 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );

      // Header lines reveal
      gsap.to(lines, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.06,
        ease: "power2.out",
        delay: 0.2,
      });

      // Category cards reveal one by one
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.35,
      });
    } else {
      // Hide cards first
      gsap.to(cards, {
        opacity: 0,
        y: 20,
        duration: 0.25,
        stagger: 0.03,
        ease: "power2.in",
      });

      gsap.to(lines, { opacity: 0, y: 10, duration: 0.2, ease: "power2.in" });

      // Full page slides up and fades out
      gsap.to(cardRef.current, {
        opacity: 0,
        y: -40,
        duration: 0.3,
        ease: "power2.in",
        delay: 0.15,
      });
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div
      ref={cardRef}
      className="fixed inset-0 z-50 bg-black overflow-y-auto"
      style={{ opacity: 0, pointerEvents: isOpen ? "auto" : "none" }}
    >
      <div className="min-h-full flex flex-col px-4 sm:px-10 md:px-20 py-6 sm:py-8 md:py-10">
        {/* ===== Top Header Row ===== */}
        <div className="flex items-start justify-between gap-4 mb-8 sm:mb-10 md:mb-14">
          {/* CATALOG + ✦ */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0" data-reveal-line>
            <h1 className="font-['Impact','Anton',sans-serif] text-[40px] sm:text-[56px] md:text-[80px] font-black uppercase tracking-[-0.02em] text-white leading-none">
              Catalog
            </h1>
            <span className="text-[20px] sm:text-[32px] text-white leading-none">✦</span>
          </div>

          {/* EXPLORE COLLECTIONS → */}
          <div className="hidden md:flex items-center gap-3 mt-6" data-reveal-line>
            <span className="text-[11px] md:text-[12px] uppercase tracking-[0.2em] text-white font-medium">
              Explore Collections
            </span>
            <span className="text-[16px] text-white">→</span>
          </div>

          {/* CLOSE ✕ — white button, icon-only on mobile, full button on larger screens */}
          <button
            onClick={onClose}
            className="cursor-target flex items-center justify-center gap-3 mt-2 sm:mt-4 w-11 h-11 sm:w-auto sm:h-auto sm:px-5 sm:py-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors duration-300 flex-shrink-0"
            data-reveal-line
            aria-label="Close catalog"
          >
            <span className="hidden sm:inline text-[11px] md:text-[12px] uppercase tracking-[0.15em] font-bold">
              Close
            </span>
            <span className="text-[18px] leading-none">✕</span>
          </button>
        </div>

        {/* ===== Main Content Area ===== */}
        <div className="flex-1 flex">
          {/* Left vertical text */}
          <div className="hidden lg:flex items-center mr-8" data-reveal-line>
            <span
              className="text-[10px] uppercase tracking-[0.3em] text-white whitespace-nowrap"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Discover What Defines You
            </span>
          </div>

          {/* Grid Cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {categoryCards.map((cat, index) => (
              <Link
                key={cat.id}
                href={cat.href}
                onClick={onClose}
                className="cursor-target group relative aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden"
                data-reveal-card
              >
                {/* Background image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-0 group-hover:scale-105 transition-all duration-500 ease-out"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-colors duration-300" />

                {/* White overlay on hover - makes card whiten */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Card number - top left */}
                <span
                  className={`absolute top-6 left-6 text-[20px] md:text-[24px] font-normal transition-colors duration-300 ${
                    index === 5
                      ? "text-[#F4C430] group-hover:text-black"
                      : "text-white group-hover:text-black"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Plus icon - top right */}
                <span className="absolute top-6 right-6 text-[20px] text-white group-hover:text-black font-light transition-colors duration-300">
                  +
                </span>

                {/* Category name - bottom left */}
                <span className="absolute bottom-[80px] left-6 font-['Impact','Anton',sans-serif] text-[28px] md:text-[36px] font-black uppercase tracking-tight text-white group-hover:text-black leading-none transition-colors duration-300">
                  {cat.name}
                </span>

                {/* Arrow - below category name */}
                <span className="absolute bottom-[48px] left-6 text-[20px] text-white group-hover:text-black transition-colors duration-300">
                  →
                </span>

                {/* Bottom line - bottom right */}
                <span className="absolute bottom-6 right-6 w-[60px] md:w-[80px] h-px bg-white group-hover:bg-black transition-colors duration-300" />
              </Link>
            ))}
          </div>
        </div>

        {/* ===== Bottom Footer Row ===== */}
        <div className="flex items-center justify-between mt-10 md:mt-14" data-reveal-line>
          <span className="text-[10px] uppercase tracking-[0.1em] text-white">
            © All Rights Reserved
          </span>
          <span className="text-[10px] uppercase tracking-[0.1em] text-white">
            SS / 2024
          </span>
        </div>
      </div>
    </div>
  );
}