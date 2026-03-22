import ProductEditor from '@/components/admin/ProductEditor';

export default function AdminNewProductPage({
  params,
}: {
  params: { slug: string };
}) {
  return <ProductEditor categorySlug={params.slug} />;
}
