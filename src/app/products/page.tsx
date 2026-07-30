import { Suspense } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/lib/products";

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category || "all";

  const filtered = category === "all" || category === "new"
    ? products
    : products.filter((p) => p.category === category);

  const currentCategory = categories.find((c) => c.id === category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">
          {currentCategory?.name || category === "new" ? "New Arrivals" : "All Products"}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
            <div className="flex flex-wrap lg:flex-col gap-2">
              <Link
                href="/products"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category === "all"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                All Products
              </Link>
              {categories.filter((c) => c.id !== "all").map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    category === cat.id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/products?category=new"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category === "new"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                New Arrivals
              </Link>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {currentCategory?.name || category === "new" ? "New Arrivals" : "All Products"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{filtered.length} products</p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products found in this category.</p>
              <Link
                href="/products"
                className="inline-block mt-4 text-sm font-medium text-gray-900 underline hover:text-gray-600"
              >
                View all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}