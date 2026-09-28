"use client";

import { useEffect, useState } from "react";
import type { ProductDto } from "@/lib/types";

export default function AccountFavoritesPage() {
  const [favorites, setFavorites] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/account/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites ?? []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  async function remove(p: ProductDto) {
    await fetch(`/api/account/favorites/${p.id}`, { method: "DELETE" });
    setFavorites((prev) => prev.filter((x) => x.id !== p.id));
  }

  if (loading) return <p className="text-center py-10 text-neutral-500">Loading…</p>;

  if (favorites.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center">
        <p className="text-lg font-semibold mb-1">No favourites yet</p>
        <p className="text-sm text-neutral-500">Products you favourite will show up here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {favorites.map((p) => (
        <div key={p.id} className="bg-white rounded-2xl shadow p-4">
          {p.images[0]?.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.images[0].url} alt={p.name} className="w-full h-28 object-cover rounded-xl mb-3" />
          )}
          <div className="font-semibold text-sm">{p.name}</div>
          <div className="text-sm text-neutral-500 mb-2">{p.price} {p.currency}</div>
          <button
            onClick={() => remove(p)}
            className="text-sm text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}