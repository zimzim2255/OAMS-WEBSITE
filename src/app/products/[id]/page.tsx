"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductById, products } from "@/lib/products";
import { getFlashDesignById, flashDesigns } from "@/lib/flashDesigns";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const id = Number(params.id);
  const product = getProductById(id) || getFlashDesignById(id);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
        <p className="text-gray-500 mt-2">The product you're looking for doesn't exist.</p>
        <Link href="/products" className="inline-block mt-6 text-sm font-medium text-gray-900 underline">
          Back to Products
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;
    if (!selectedColor) return;
    addItem(product, selectedSize, selectedColor, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const isFlashDesign = product.id >= 100;
  const relatedProducts = (isFlashDesign ? flashDesigns : products)
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
          <span className="text-gray-500">/</span>
          <Link href="/products" className="text-gray-500 hover:text-gray-900 transition-colors">Products</Link>
          <span className="text-gray-500">/</span>
          <Link href={`/products?category=${product.category}`} className="text-gray-500 hover:text-gray-900 transition-colors capitalize">
            {product.category}
          </Link>
          <span className="text-gray-500">/</span>
          <span className="font-medium text-gray-900 truncate">{product.name}</span>
        </div>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden">
              <Image
                src={product.images[selectedImage] || product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                unoptimized
              />
              {product.isNew && (
                <span className="absolute top-4 left-4 bg-black text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  New
                </span>
              )}
              {product.isSale && product.originalPrice && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  Sale
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-24 rounded-xl overflow-hidden bg-gray-50 border-2 transition-colors ${
                    selectedImage === i ? "border-gray-900" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 capitalize">{product.category}</span>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-200"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500">({product.reviews} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>

            <div className="flex items-center gap-3 mt-3">
              <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
              {product.originalPrice && (
                <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </span>
              )}
            </div>

            <p className="mt-6 text-gray-600 leading-relaxed">{product.description}</p>

            {/* Size Selection */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Size</h3>
                <button className="text-xs text-gray-500 hover:text-gray-900 underline">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      selectedSize === size
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="text-xs text-red-500 mt-1">Please select a size</p>
              )}
            </div>

            {/* Color Selection */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900">Color: <span className="font-normal text-gray-500">{selectedColor || "Select"}</span></h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      selectedColor === color
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
              {!selectedColor && (
                <p className="text-xs text-red-500 mt-1">Please select a color</p>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-900 text-sm"
                >
                  −
                </button>
                <span className="px-4 text-sm font-medium text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-900 text-sm"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || !selectedColor}
                className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${
                  addedToCart
                    ? "bg-green-500 text-white"
                    : "bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
                }`}
              >
                {addedToCart ? "Added to Cart ✓" : "Add to Cart"}
              </button>
            </div>

            {/* Product Details */}
            <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Features</h4>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• Premium quality materials</li>
                    <li>• Machine washable</li>
                    <li>• Imported</li>
                    <li>• Available in multiple sizes</li>
                  </ul>
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Shipping</h4>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• Free shipping on orders over $50</li>
                    <li>• Standard delivery: 3-5 days</li>
                    <li>• Express delivery: 1-2 days</li>
                    <li>• Easy 30-day returns</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 sm:mt-20">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">You May Also Like</h2>
              <p className="text-gray-500 mt-1">More items from this collection.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}