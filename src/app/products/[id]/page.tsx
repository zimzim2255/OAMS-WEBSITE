import ProductDetailClient from "./ProductDetailClient";

// Product pages are rendered dynamically and load their data from the database
// (official store + marketplace listings). No product IDs are bundled at build.
export function generateStaticParams() {
  return [];
}

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}