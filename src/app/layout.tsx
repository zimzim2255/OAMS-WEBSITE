import type { Metadata } from "next";
import { Inter, Anton } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import TargetCursor from "@/components/TargetCursor";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

export const metadata: Metadata = {
  title: "VLOM.CUST - Streetwear Brand",
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
      className={`${inter.variable} ${anton.variable} h-full`}
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
          {children}
        </CartProvider>
      </body>
    </html>
  );
}