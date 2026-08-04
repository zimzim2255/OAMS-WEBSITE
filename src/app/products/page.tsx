import Link from "next/link";
import { flashDesigns } from "@/lib/flashDesigns";

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

const categories = [
  { id: "all", label: "All" },
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "kids", label: "Kids" },
  { id: "new", label: "New" },
];

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category || "all";

  const filtered = category === "all" || category === "new"
    ? flashDesigns
    : flashDesigns.filter((p) => p.category === category);

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
        {filtered.map((product, index) => (
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
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm md:text-base font-medium text-white">
                  {product.price}$
                </p>
                <div className="w-3 h-3 bg-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}