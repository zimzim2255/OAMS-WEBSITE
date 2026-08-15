"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { flashDesigns } from "@/lib/flashDesigns";

const categories = [
  { id: "all", label: "All" },
  { id: "shorts", label: "Shorts" },
  { id: "t-shirt", label: "T-Shirt" },
  { id: "pants", label: "Pants" },
  { id: "full-outfits", label: "Full Outfits" },
];

const PAGE_SIZE = 10;

function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "all";
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset visible count when category changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category]);

  const filtered = useMemo(() => {
    if (category === "all") return flashDesigns;
    if (category === "full-outfits") return flashDesigns.filter((p) => p.category === "ensemble");
    if (category === "t-shirt") return flashDesigns.filter((p) => p.category === "shirts");
    return flashDesigns.filter((p) => p.category === category);
  }, [category]);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleViewMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  return (
    <section className="bg-black min-h-screen">
      {/* ===== Top Navigation Bar ===== */}
      <div className="flex justify-between items-center bg-black px-6 py-3 border-b border-white/20"></div>

      {/* ===== Filter Bar ===== */}
      <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6 lg:px-10 pt-8">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={cat.id === "all" ? "/products" : `/products?category=${cat.id}`}
            className={`cursor-target px-5 py-2 text-xs font-medium uppercase tracking-widest border transition-all duration-300 ${
              category === cat.id
                ? "bg-white text-black border-white"
                : "bg-transparent text-white border-white/30 hover:border-white hover:bg-white/10"
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* ===== Product Grid ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 w-full px-4 sm:px-6 lg:px-10 py-12">
        {visibleProducts.map((product, index) => (
          <div key={product.id} className="group">
            {/* Card - full width/height image with border radius */}
            <Link
              href={`/products/${product.id}`}
              className="cursor-target block relative aspect-[3/4] rounded-md overflow-hidden bg-gray-100"
            >
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:opacity-0 group-hover:scale-105 transition-all duration-500 ease-out"
              />

              {/* Available badge - only on first card */}
              {index === 0 && (
                <span className="absolute top-4 right-4 text-[10px] text-gray-500 bg-white/80 px-2 py-1 rounded-full">
                  Available
                </span>
              )}

              {/* Red "END ONE" overlay - only on second card */}
              {index === 1 && (
                <span className="absolute top-6 right-6 text-red-600 text-2xl md:text-3xl font-bold uppercase tracking-tighter opacity-80 rotate-6 group-hover:opacity-100 transition-opacity duration-300">
                  END ONE
                </span>
              )}

              {/* White overlay on hover - makes card fully white like catalog cards */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-90 transition-opacity duration-300" />

              {/* "Click to discover" text on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-black text-sm md:text-base font-medium uppercase tracking-[0.15em]">
                  Click to discover
                </span>
              </div>
            </Link>

            {/* Text outside the card */}
            <div className="pt-4">
              <h3 className="text-sm md:text-base font-normal text-white">
                {product.name}
              </h3>
              <p className="text-xs md:text-sm text-gray-400 mt-1 leading-relaxed line-clamp-2">
                {product.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm md:text-base font-medium text-white">
                  {product.price} DH
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-500 line-through">
                    {product.originalPrice} DH
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== View More Button ===== */}
      {hasMore && (
        <div className="flex justify-center pb-16">
          <button
            onClick={handleViewMore}
            className="cursor-target px-10 py-3 text-xs font-medium uppercase tracking-widest border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300"
          >
            View More
          </button>
        </div>
      )}
    </section>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<section className="bg-black min-h-screen" />}>
      <ProductsContent />
    </Suspense>
  );
}