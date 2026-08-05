import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import TargetCursor from "@/components/TargetCursor";
import Header from "@/components/Header";
import SplashReveal from "@/components/SplashReveal";

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
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-white antialiased">
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
