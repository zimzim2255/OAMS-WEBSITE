import SellerDetailClient from "./SellerDetailClient";

export default async function AdminSellerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SellerDetailClient id={id} />;
}