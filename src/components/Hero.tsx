import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gray-900 text-white overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/fashionhero/1920/800')] bg-cover bg-center opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-44">
        <div className="max-w-2xl">
          <span className="inline-block text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">
            Summer Collection 2026
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Elevate Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              Everyday Style
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-lg">
            Discover premium fashion that blends comfort with sophistication. 
            From casual essentials to statement pieces, find your perfect look.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-3 bg-white text-gray-900 font-medium rounded-full hover:bg-gray-100 transition-colors"
            >
              Shop Now
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/products?category=women"
              className="inline-flex items-center px-8 py-3 border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-colors"
            >
              Women's Collection
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
            <div>
              <p className="text-2xl font-bold">500+</p>
              <p className="text-xs text-gray-400 mt-1">Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold">50k+</p>
              <p className="text-xs text-gray-400 mt-1">Happy Customers</p>
            </div>
            <div>
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-xs text-gray-400 mt-1">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}