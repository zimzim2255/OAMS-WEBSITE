"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

const SHIPPING_COSTS = {
  casablanca: 20,
  outside: 40,
} as const;

type ShippingZone = keyof typeof SHIPPING_COSTS;

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const [shippingZone, setShippingZone] = useState<ShippingZone>("casablanca");

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-md mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 mx-auto text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">Your Cart is Empty</h1>
          <p className="text-gray-500 mt-3">Looks like you haven't added anything to your cart yet.</p>
          <Link
            href="/products"
            className="inline-block mt-6 bg-gray-900 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingCost = SHIPPING_COSTS[shippingZone];
  const total = subtotal + shippingCost;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Cart</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({items.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.product.id}-${item.size}-${item.color}`}
              className="flex gap-4 sm:gap-6 p-4 sm:p-6 bg-white border border-gray-100 rounded-2xl"
            >
              <div className="relative w-24 h-28 sm:w-28 sm:h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="120px"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/products/${item.product.id}`}
                      className="text-sm sm:text-base font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {item.size} / {item.color}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-2">
                      {item.product.price} DH
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id, item.size, item.color)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3 mt-3">
                  <div className="flex items-center border border-gray-200 rounded-full">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                      className="px-3 py-1.5 text-gray-600 hover:text-gray-900 text-sm"
                    >
                      −
                    </button>
                    <span className="px-3 text-sm font-medium text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                      className="px-3 py-1.5 text-gray-600 hover:text-gray-900 text-sm"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.product.price * item.quantity} DH
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-4">
            <Link
              href="/products"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-2xl p-6 sm:sticky sm:top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{subtotal} DH</span>
              </div>

              {/* Shipping selection */}
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Shipping</h3>
                <div className="space-y-2">
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    shippingZone === "casablanca"
                      ? "border-gray-900 bg-white"
                      : "border-gray-200 hover:border-gray-400"
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingZone === "casablanca"}
                        onChange={() => setShippingZone("casablanca")}
                        className="accent-gray-900"
                      />
                      <span className="text-sm text-gray-700">Casablanca</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">20 DH</span>
                  </label>
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    shippingZone === "outside"
                      ? "border-gray-900 bg-white"
                      : "border-gray-200 hover:border-gray-400"
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingZone === "outside"}
                        onChange={() => setShippingZone("outside")}
                        className="accent-gray-900"
                      />
                      <span className="text-sm text-gray-700">Outside Casablanca</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">40 DH</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-gray-900">{shippingCost} DH</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900 text-base">
                <span>Total</span>
                <span>{total} DH</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full mt-6 bg-gray-900 text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors text-center"
            >
              Proceed to Checkout
            </Link>
            <p className="text-xs text-gray-400 text-center mt-3">
              Delivery in Casablanca: 20 DH • Outside Casablanca: 40 DH
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}