import BlogEditor from '@/components/admin/BlogEditor';

type Props = {
  params: {
    id: string;
  };
};

export default function AdminBlogEditPage({ params }: Props) {
  return <BlogEditor blogId={params.id} />;
}
