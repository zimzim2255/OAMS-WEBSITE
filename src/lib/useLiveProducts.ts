"use client";

import { useEffect, useState } from "react";
import type { Product, ProductDto } from "./types";

// Convert a database product (ProductDto) into the legacy Product shape used by
// the storefront components + cart. The id keeps its string value at runtime so
// cart matching and the product URL stay consistent.
export function toProductType(p: ProductDto): Product {
  const urls = (p.images ?? []).map((i) => i.url);
  return {
    id: p.id as unknown as number,
    name: p.name,
    category: p.category,
    price: p.price,
    originalPrice: p.originalPrice,
    description: p.description,
    image: urls[0] ?? "",
    images: urls,
    sizes: p.sizes,
    colors: p.colors,
    stock: p.stock,
    isNew: p.isNew,
    isSale: p.isSale,
  };
}

// Module-level cache so every storefront section shares one fetch, and keeps
// the same product list across navigation/remounts.
let cache: Product[] | null = null;

/**
 * Load the live catalogue (official + marketplace products) from /api/shop/products.
 * Returns `limit` items when provided, otherwise the full list. Safe to use from
 * any client component — this replaces the previously hardcoded product arrays.
 */
export function useLiveProducts(limit?: number): Product[] {
  // Read any already-fetched catalogue synchronously so remounts start populated.
  const [list, setList] = useState<Product[]>(cache ?? []);

  useEffect(() => {
    if (cache) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/shop/products");
        const data = await res.json();
        const mapped = (data.products ?? []).map(toProductType);
        cache = mapped;
        if (active) setList(mapped);
      } catch {
        // Ignore — fall back to whatever we have (empty on first paint).
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return limit ? list.slice(0, limit) : list;
}