import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import TargetCursor from "@/components/TargetCursor";
import Header from "@/components/Header";
import SplashReveal from "@/components/SplashReveal";

const displayFont = localFont({
  src: "../../public/fonts/titel_fonts/AudioNugget.ttf",
  variable: "--font-display",
  display: "swap",
});

const bodyFont = localFont({
  src: "../../public/fonts/subtite_font/toxigenesis bd.otf",
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OAMS - Streetwear Brand",
  description: "Custom streetwear brand creating unique looks since 2018. Hand-operated by our artisans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans antialiased">
        <TargetCursor
          spinDuration={2}
          hideDefaultCursor
          parallaxOn
          hoverDuration={0.2}
          cursorColor="#ffffff"
          cursorColorOnTarget="#B497CF"
        />
        <CartProvider>
          <SplashReveal />
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}