import ProductEditor from '@/components/admin/ProductEditor';

export default function AdminEditProductPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  return <ProductEditor categorySlug={params.slug} productId={params.id} />;
}
