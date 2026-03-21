import { notFound } from 'next/navigation';
import { getBlogBySlug } from '@/lib/cms';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const blog = await getBlogBySlug(params.slug, { publishedOnly: true });
    if (!blog) return {};
    return {
      title: blog.seoTitle || blog.title,
      description: blog.seoDesc || blog.excerpt,
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({ params }: Props) {
  const blog = await getBlogBySlug(params.slug, { publishedOnly: true });
  if (!blog || !blog.published) notFound();

  return (
    <>
      <section style={{ padding: '8rem 0 3rem', background: 'var(--surface-dim)' }}>
        <div className="container">
          <AnimatedSection>
            <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>
              <ArrowLeft size={16} /> Back to Blog
            </Link>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, marginBottom: '1rem', maxWidth: '800px' }}>
              {blog.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <Calendar size={14} />
              {new Date(blog.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <AnimatedSection>
            <div style={{ fontSize: '1.05rem', lineHeight: 1.9, color: 'var(--text-secondary)' }}>
              {blog.content.split('\n').map((p: string, i: number) => (
                <p key={i} style={{ marginBottom: '1.25rem' }}>{p}</p>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
