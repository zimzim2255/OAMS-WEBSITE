"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

export default function Header() {
  const { getTotalItems, items, removeItem, updateQuantity, getTotalPrice, isOpen, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-gray-900">OAMS</span>
              <span className="text-xs font-medium text-gray-500 hidden sm:block">• fashion</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/products?category=men" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Men
              </Link>
              <Link href="/products?category=women" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Women
              </Link>
              <Link href="/products?category=kids" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Kids
              </Link>
              <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                All
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="Open cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems() > 9 ? "9+" : getTotalItems()}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-gray-900"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-3">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-gray-900">Home</Link>
              <Link href="/products?category=men" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-gray-900">Men</Link>
              <Link href="/products?category=women" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-gray-900">Women</Link>
              <Link href="/products?category=kids" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-gray-900">Kids</Link>
              <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-gray-900">All Products</Link>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Shopping Cart ({getTotalItems()})</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4 px-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p className="text-lg">Your cart is empty</p>
                <button onClick={() => setIsOpen(false)} className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4 py-4 border-b border-gray-50">
                      <div className="relative w-20 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{item.size} / {item.color}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">${item.product.price.toFixed(2)}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-gray-200 rounded-full">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                              className="px-2.5 py-1 text-gray-600 hover:text-gray-900 text-sm"
                            >
                              −
                            </button>
                            <span className="px-2 text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                              className="px-2.5 py-1 text-gray-600 hover:text-gray-900 text-sm"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.size, item.color)}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 px-6 py-4 space-y-4">
                  <div className="flex justify-between text-base font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="block w-full bg-black text-white text-center py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    View Cart & Checkout
                  </Link>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}