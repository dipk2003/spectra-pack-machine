import CategoryEditor from '@/components/admin/CategoryEditor';

export default function AdminEditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  return <CategoryEditor categoryId={params.id} />;
}
