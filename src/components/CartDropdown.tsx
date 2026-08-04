"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CartDropdown() {
  const { items, removeItem, updateQuantity, isOpen, setIsOpen } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => setIsOpen(false)}
      />

      {/* Dropdown panel */}
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Footer — shown at TOP on mobile so buttons are always visible */}
        {items.length > 0 && (
          <div className="order-first sm:order-last border-b sm:border-t border-gray-100 px-4 sm:px-6 py-3 flex-shrink-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs sm:text-sm text-gray-500">Total Items</span>
              <span className="text-sm sm:text-lg font-bold text-gray-900">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm text-gray-500">Subtotal</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900">{items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)} DH</span>
            </div>
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="block w-full bg-black text-white text-center py-2.5 text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              View Cart
            </Link>
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full mt-1.5 border border-black text-black text-center py-2.5 text-sm font-medium uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
            >
              Checkout
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="order-2 sm:order-1 flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
            Cart ({items.length})
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="cursor-target text-2xl text-gray-400 hover:text-gray-900 transition-colors"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Cart items */}
        <div className="order-3 flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">Your cart is empty</p>
              <Link
                href="/products"
                onClick={() => setIsOpen(false)}
                className="inline-block mt-4 bg-black text-white px-6 py-2.5 text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4">
                  <div className="relative w-20 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.size} / {item.color}
                        </p>
                        <p className="text-xs font-semibold text-gray-900 mt-1">
                          {item.product.price} DH
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.size, item.color)}
                        className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-full">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                          className="px-2.5 py-1 text-gray-600 hover:text-gray-900 text-xs"
                        >
                          −
                        </button>
                        <span className="px-2 text-xs font-medium text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                          className="px-2.5 py-1 text-gray-600 hover:text-gray-900 text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}