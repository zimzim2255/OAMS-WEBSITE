"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

const SHIPPING_COSTS = {
  casablanca: 20,
  outside: 40,
} as const;

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvkpooqg";

type ShippingZone = keyof typeof SHIPPING_COSTS;

export default function CheckoutPage() {
  const { items, clearCart, getTotalPrice } = useCart();
  const router = useRouter();
  const [shippingZone, setShippingZone] = useState<ShippingZone>("casablanca");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mt-6">Your Cart is Empty</h1>
          <p className="text-gray-500 mt-3">Add some products before checking out.</p>
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

  const subtotal = getTotalPrice();
  const shippingCost = SHIPPING_COSTS[shippingZone];
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const orderItems = items
      .map(
        (item) =>
          `- ${item.product.name} (${item.size} / ${item.color}) x ${item.quantity} = ${
            item.product.price * item.quantity
          } DH`
      )
      .join("\n");

    const data = {
      _subject: `New Order from ${form.fullName}`,
      fullName: form.fullName,
      phone: form.phone,
      address: form.address,
      city: form.city,
      shippingZone: shippingZone === "casablanca" ? "Casablanca (20 DH)" : "Outside Casablanca (40 DH)",
      notes: form.notes || "None",
      orderItems,
      subtotal: `${subtotal} DH`,
      shippingCost: `${shippingCost} DH`,
      total: `${total} DH`,
    };

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to submit order");
      }

      clearCart();
      router.push("/order-confirmation");
    } catch (err) {
      setError("Something went wrong sending your order. Please try again.");
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/cart" className="hover:text-gray-900 transition-colors">Cart</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Checkout</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Shipping Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className={inputClass}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                  placeholder="06 XX XX XX XX"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address *</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={inputClass}
                  placeholder="Street, building, apartment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className={inputClass}
                  placeholder="Your city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={`${inputClass} min-h-[80px] resize-y`}
                  placeholder="Any special instructions for delivery"
                />
              </div>
            </div>
          </div>

          {/* Shipping Method */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Method</h2>
            <div className="space-y-2">
              <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                shippingZone === "casablanca"
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingZone === "casablanca"}
                    onChange={() => setShippingZone("casablanca")}
                    className="accent-gray-900"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Casablanca</span>
                    <p className="text-xs text-gray-500">Delivery within 24-48h</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">20 DH</span>
              </label>
              <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                shippingZone === "outside"
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingZone === "outside"}
                    onChange={() => setShippingZone("outside")}
                    className="accent-gray-900"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Outside Casablanca</span>
                    <p className="text-xs text-gray-500">Delivery within 2-4 days</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">40 DH</span>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-2xl p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

            {/* Items */}
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex items-center gap-3">
                  <div className="relative w-14 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{item.size} / {item.color} × {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.product.price * item.quantity} DH
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{subtotal} DH</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-gray-900">{shippingCost} DH</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-900 text-base">
                <span>Total</span>
                <span>{total} DH</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 bg-gray-900 text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              Cash on delivery • No prepayment required
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}