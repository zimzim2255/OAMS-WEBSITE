import Link from "next/link";
import Marquee from "@/components/Marquee";
import ZoomSection from "@/components/ZoomSection";
import BestsellerSection from "@/components/BestsellerSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* ===== 3. Hero Section ===== */}
      <section className="relative w-full min-h-[500px] sm:min-h-[700px] bg-white overflow-hidden">
        {/* Massive "URBAN STREET" text - split */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div className="flex w-full justify-between px-2 sm:px-4">
            <span
              className="font-['Impact','Anton',sans-serif] text-[clamp(28px,9vw,250px)] sm:text-[clamp(80px,18vw,250px)] font-bold text-black leading-none tracking-tight"
              style={{ marginLeft: "-2vw" }}
            >
              URBAN
            </span>
            <span
              className="font-['Impact','Anton',sans-serif] text-[clamp(28px,9vw,250px)] sm:text-[clamp(80px,18vw,250px)] font-bold text-black leading-none tracking-tight"
              style={{ marginRight: "-2vw" }}
            >
              STREET
            </span>
          </div>
        </div>

        {/* Model Image - centered, on top of text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-auto h-[420px] sm:h-[650px] lg:h-[850px]">
            <img
              src="/imgs/hero.png"
              alt="Streetwear model"
              className="h-full w-auto object-contain relative z-10"
            />
          </div>
        </div>

        {/* CTA Bar - bottom center */}
        <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 w-full px-4 sm:px-0 sm:w-auto">
          <Link
            href="/products"
            className="cursor-target bg-black text-white flex items-center justify-between w-full sm:w-[400px] max-w-full sm:max-w-[90vw] px-6 sm:px-10 py-4 sm:py-5"
          >
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">SHOP NOW</span>
            <span className="text-base sm:text-lg">→</span>
          </Link>
        </div>
      </section>

      {/* ===== 4. Scrolling Text Banner (Marquee) ===== */}
      <Marquee
        text="OAMS STREET CULTURE"
        bgColor="bg-white"
        textColor="text-black"
        fontSize="text-4xl"
        py="py-6"
        className="my-4 rounded-xl border-y-4 border-white ring-4 ring-white ring-offset-4 ring-offset-black"
      />

      {/* ===== 5. Brand Story Section with Zoom Animation ===== */}
      <ZoomSection />

      {/* ===== 6. Second Scrolling Banner ===== */}
      <Marquee
        text="OAMS CUSTOM KINGS"
        bgColor="bg-white"
        textColor="text-black"
        fontSize="text-4xl"
        py="py-6"
        className="my-4 rounded-xl border-y-4 border-white ring-4 ring-white ring-offset-4 ring-offset-black"
      />

      {/* ===== 7. BESTSELLER Expand-on-Scroll Section ===== */}
      <BestsellerSection />

      <Footer />
    </>
  );
}