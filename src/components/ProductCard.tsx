"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isSoldOut = Object.values(product.stock).every((s) => s <= 0);

  return (
    <Link href={`/products/${product.id}`} className="cursor-target group">
      <div className="relative aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden mb-3">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-500 ease-out ${
            isSoldOut ? "grayscale opacity-60" : "group-hover:scale-105"
          }`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
        />
        {product.isNew && (
          <span className={`absolute top-3 text-xs font-medium px-2.5 py-1 rounded-full ${
            isSoldOut ? "right-3 bg-white/90 text-gray-600" : "left-3 bg-black text-white"
          }`}>
            New
          </span>
        )}
        {product.isSale && product.originalPrice && (
          <span className={`absolute top-3 bg-red-500 text-white text-xs font-medium px-2.5 py-1 rounded-full ${
            isSoldOut ? "top-12 right-3" : "right-3"
          }`}>
            Sale
          </span>
        )}
        {isSoldOut && (
          <span className="absolute top-3 left-3 bg-black/80 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/30">
            Sold Out
          </span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>
      <div className="px-1">
        <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
      </div>
    </Link>
  );
}