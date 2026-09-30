import Link from "next/link";
import Marquee from "@/components/Marquee";
import HeroSlider from "@/components/HeroSlider";
import TopSellers from "@/components/TopSellers";
import BestsellerSection from "@/components/BestsellerSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* ===== 3. Hero Slide Gallery ===== */}
      <HeroSlider />

      {/* ===== 4. Our Top Sellers card slider ===== */}
      <TopSellers />

      {/* ===== 5. Two Image Cards ===== */}
      <section className="w-full bg-[#fcfdf7]">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <Link
            href="/products"
            className="cursor-target group relative block aspect-[3/4] md:aspect-auto md:h-[85vh] lg:h-[95vh] overflow-hidden"
          >
            <img
              src="/imgs/OAMS-catsimg.jpg"
              alt="OAMS catalog"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-['Impact','Anton',sans-serif] text-3xl md:text-5xl font-bold uppercase text-white tracking-wide text-center px-4">
                OAMS Products
              </span>
            </div>
          </Link>
          <Link
            href="/products"
            className="cursor-target group relative block aspect-[3/4] md:aspect-auto md:h-[85vh] lg:h-[95vh] overflow-hidden"
          >
            <img
              src="/imgs/market-placeimg.jpg"
              alt="Marketplace"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-['Impact','Anton',sans-serif] text-3xl md:text-5xl font-bold uppercase text-white tracking-wide text-center px-4">
                Our Marketplace
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ===== 6. Second Scrolling Banner ===== */}
      <Marquee
        text="OAMS CUSTOM KINGS"
        bgColor="bg-white"
        textColor="text-black"
        fontSize="text-4xl"
        py="py-6"
        className="my-4 rounded-xl border-y-4 border-white ring-4 ring-white ring-offset-4 ring-offset-black"
      />

      {/* ===== 6.5 Full-width Image under the banner ===== */}
      <section className="w-full bg-[#fcfdf7]">
        <img
          src="/imgs/home-1.jpg"
          alt="OAMS home"
          className="w-full h-auto object-cover"
        />
      </section>

      {/* ===== 7. BESTSELLER Expand-on-Scroll Section ===== */}
      <BestsellerSection />

      <Footer />
    </>
  );
}