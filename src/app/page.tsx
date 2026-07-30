import Header from "@/components/Header";
import Marquee from "@/components/Marquee";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />

      {/* ===== 3. Hero Section ===== */}
      <section className="relative w-full min-h-[700px] bg-white overflow-hidden">
        {/* Massive "CUSTOMIZATION" text - split */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div className="flex w-full justify-between px-4">
            <span
              className="font-['Impact','Anton',sans-serif] text-[clamp(80px,18vw,250px)] font-bold text-black leading-none tracking-tight"
              style={{ marginLeft: "-2vw" }}
            >
              CUSTO
            </span>
            <span
              className="font-['Impact','Anton',sans-serif] text-[clamp(80px,18vw,250px)] font-bold text-black leading-none tracking-tight"
              style={{ marginRight: "-2vw" }}
            >
              ZATION
            </span>
          </div>
        </div>

        {/* Model Image - centered, on top of text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-auto h-[600px]">
            <img
              src="https://picsum.photos/seed/model1/500/700"
              alt="Streetwear model"
              className="h-full w-auto object-contain relative z-10"
              style={{ filter: "grayscale(100%) contrast(1.1)" }}
            />
          </div>
        </div>

        {/* CTA Bar - bottom center */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-black text-white flex items-center justify-between w-[400px] max-w-[90vw] px-10 py-5">
            <span className="text-sm font-bold uppercase tracking-wider">SHOP NOW</span>
            <span className="text-lg">→</span>
          </div>
        </div>
      </section>

      {/* ===== 4. Scrolling Text Banner (Marquee) ===== */}
      <Marquee text="ABOUT THE BRAND" />

      {/* ===== 5. Brand Story Section ===== */}
      <section className="relative w-full min-h-[800px] bg-black text-white overflow-hidden">
        {/* Background atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('https://picsum.photos/seed/brandbg/1920/1080')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Top Left: About label */}
        <div className="absolute top-12 left-10 z-10">
          <p className="text-sm font-bold uppercase tracking-wider text-white">ABOUT THE BRAND</p>
        </div>

        {/* Top Left: Description */}
        <div className="absolute top-24 left-10 z-10 max-w-[300px]">
          <p className="text-[12px] text-white leading-relaxed">
            VLOM.CUST is a clothing brand that creates unique look. It involves clothes. We make a design in the form customized made shades of darkness allocated in oil, since 2018.
          </p>
        </div>

        {/* Massive "VLOM.CUST" text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span
            className="font-['Impact','Anton',sans-serif] text-[clamp(60px,12vw,150px)] font-bold text-white leading-none tracking-tight opacity-90"
          >
            VLOM.CUST
          </span>
        </div>

        {/* Product Display Image - centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[600px] max-w-[80vw]">
            <img
              src="https://picsum.photos/seed/blacktshirt/600/700"
              alt="Black t-shirt on hanger"
              className="w-full h-auto object-contain relative z-10"
              style={{ filter: "grayscale(100%) contrast(1.2)" }}
            />
          </div>
        </div>

        {/* Right Side Text */}
        <div className="absolute bottom-16 right-10 z-10 max-w-[250px] text-right">
          <p className="text-[11px] text-white leading-relaxed">
            Each piece is hand-operated by our artisans, which guarantees the absence of faults absolutely identical products. In this approach you can choose among several elements to create your own clothes.
          </p>
          <p className="text-base font-bold uppercase text-white mt-4">
            create your own unique look
          </p>
        </div>
      </section>

      {/* ===== 6. Second Scrolling Banner ===== */}
      <Marquee text="BESTSELLER" />

      {/* ===== 7. Product Grid Section ===== */}
      <section className="bg-white px-10 py-16">
        <div className="flex gap-10">
          {/* Left Sidebar - Vertical Text */}
          <div className="w-[200px] flex-shrink-0 hidden lg:flex items-center justify-center">
            <span className="vertical-text font-['Impact','Anton',sans-serif] text-[80px] font-bold text-black leading-none tracking-tight select-none">
              BESTSELLER
            </span>
          </div>

          {/* Product Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[400px]">
            {/* Card 1: T-Shirt */}
            <div className="border border-black p-6 flex flex-col items-center justify-between bg-white">
              <div className="flex justify-between w-full">
                <span className="text-[10px] font-bold text-black uppercase">20% OFF</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <img
                  src="https://picsum.photos/seed/graffititshirt/300/250"
                  alt="T-Shirt VLOM.CUST"
                  className="max-h-[220px] w-auto object-contain"
                  style={{ filter: "grayscale(100%)" }}
                />
              </div>
              <div className="w-full text-center mt-4">
                <p className="text-sm font-bold uppercase text-black">T-SHIRT VLOM.CUST</p>
                <p className="text-[12px] text-gray-500">Vintage black</p>
                <p className="text-sm font-bold text-black mt-1">
                  <span className="line-through text-gray-400 mr-2">$49</span>
                  <span>$39</span>
                </p>
              </div>
            </div>

            {/* Card 2: Cardholder (Double Height) */}
            <div className="border border-black p-6 flex flex-col items-center justify-between bg-white row-span-2">
              <div className="flex-1 flex items-center justify-center">
                <img
                  src="https://picsum.photos/seed/cardholder/300/450"
                  alt="Cardholder VLOM.CUST"
                  className="max-h-[400px] w-auto object-contain"
                  style={{ filter: "grayscale(100%)" }}
                />
              </div>
              <div className="w-full text-center mt-4">
                <p className="text-sm font-bold uppercase text-black">CARDHOLDER VLOM.CUST</p>
                <p className="text-[12px] text-gray-500">Black</p>
                <p className="text-sm font-bold text-black mt-1">$39</p>
              </div>
            </div>

            {/* Card 3: Backpack */}
            <div className="border border-black p-6 flex flex-col items-center justify-between bg-white">
              <div className="flex justify-between w-full">
                <span className="text-[10px] font-bold text-black uppercase">20% OFF</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <img
                  src="https://picsum.photos/seed/backpack/300/250"
                  alt="Calligraphy Backpack"
                  className="max-h-[220px] w-auto object-contain"
                  style={{ filter: "grayscale(100%)" }}
                />
              </div>
              <div className="w-full text-center mt-4">
                <p className="text-sm font-bold uppercase text-black">CALLIGRAPHY BACKPACK</p>
                <p className="text-[12px] text-gray-500">Black</p>
                <p className="text-sm font-bold text-black mt-1">
                  <span className="line-through text-gray-400 mr-2">$99</span>
                  <span>$79</span>
                </p>
              </div>
            </div>

            {/* Card 4: Leather Jacket */}
            <div className="border border-black p-6 flex flex-col items-center justify-between bg-white">
              <div className="flex-1 flex items-center justify-center">
                <img
                  src="https://picsum.photos/seed/leatherjacket/300/250"
                  alt="Leather Jacket VLOM.CUST"
                  className="max-h-[220px] w-auto object-contain"
                  style={{ filter: "grayscale(100%)" }}
                />
              </div>
              <div className="w-full text-center mt-4">
                <p className="text-sm font-bold uppercase text-black">LEATHER JACKET VLOM.CUST</p>
                <p className="text-[12px] text-gray-500">Vintage grey</p>
                <p className="text-sm font-bold text-black mt-1">$299</p>
              </div>
            </div>

            {/* Card 5: Sneakers */}
            <div className="border border-black p-6 flex flex-col items-center justify-between bg-white">
              <div className="flex justify-between w-full">
                <span className="text-[10px] font-bold text-black uppercase">15% OFF</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <img
                  src="https://picsum.photos/seed/sneakers/300/250"
                  alt="Sneakers VLOM.CUST"
                  className="max-h-[220px] w-auto object-contain"
                  style={{ filter: "grayscale(100%)" }}
                />
              </div>
              <div className="w-full text-center mt-4">
                <p className="text-sm font-bold uppercase text-black">SNEAKERS VLOM.CUST</p>
                <p className="text-[12px] text-gray-500">Black & white</p>
                <p className="text-sm font-bold text-black mt-1">
                  <span className="line-through text-gray-400 mr-2">$119</span>
                  <span>$95</span>
                </p>
              </div>
            </div>

            {/* Card 6: View More */}
            <div className="border border-black p-6 flex flex-col items-center justify-center bg-black text-white cursor-pointer hover:bg-gray-900 transition-colors">
              <p className="text-sm font-bold uppercase tracking-wider">VIEW MORE</p>
              <span className="text-2xl mt-2">→</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}