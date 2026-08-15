import { products } from "@/lib/products";
import { flashDesigns } from "@/lib/flashDesigns";
import ProductDetailClient from "./ProductDetailClient";

export function generateStaticParams() {
  const allProducts = [...products, ...flashDesigns];
  return allProducts.map((p) => ({
    id: String(p.id),
  }));
}

export const dynamicParams = false;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailClient id={Number(id)} />;
}