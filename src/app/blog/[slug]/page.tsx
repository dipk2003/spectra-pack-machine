import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { parseBlogTemplateContent } from '@/lib/blog-template';
import { getBlogBySlug, getCategoryById, getProductById } from '@/lib/cms';
import { shouldBypassNextImageOptimization } from '@/lib/image-utils';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  noStore();

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
  noStore();

  const blog = await getBlogBySlug(params.slug, { publishedOnly: true });
  if (!blog || !blog.published) notFound();

  const layout = parseBlogTemplateContent(blog.content || '');
  const [relatedCategory, relatedProduct] = await Promise.all([
    blog.categoryId ? getCategoryById(blog.categoryId, { access: 'public' }) : Promise.resolve(null),
    blog.featuredProductId ? getProductById(blog.featuredProductId, { access: 'public' }) : Promise.resolve(null),
  ]);
  const paragraphs = layout.body
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const showSideVisuals = Boolean(layout.leftImage || layout.rightImage);

  return (
    <>
      <section
        className={styles.hero}
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(7, 18, 39, 0.9), rgba(7, 18, 39, 0.56)), url(${blog.image})`,
        }}
      >
        <div className="container">
          <AnimatedSection>
            <Link href="/blog" className={styles.backLink}>
              <ArrowLeft size={16} /> Back to Blog
            </Link>
            <div className={styles.heroContent}>
              <div className={styles.heroText}>
                <div className={styles.heroMeta}>
                  <span className={styles.heroBadge}>Spectra Pack Blog</span>
                  <span className={styles.heroDate}>
                    <Calendar size={14} />
                    {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <h1 className={styles.heroTitle}>{blog.title}</h1>
                <p className={styles.heroExcerpt}>{blog.excerpt}</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className={styles.articleSection}>
        <div className={`container ${styles.articleContainer}`}>
          <AnimatedSection>
            <div
              className={`${styles.articleLayout} ${!showSideVisuals ? styles.articleLayoutCompact : ''}`}
            >
              {layout.leftImage ? (
                <aside className={styles.sideVisual}>
                  <div className={styles.sideVisualCard}>
                    <Image
                      src={layout.leftImage}
                      alt={layout.leftImageAlt || `${blog.title} left visual`}
                      width={1200}
                      height={900}
                      className={styles.sideVisualImage}
                      unoptimized={shouldBypassNextImageOptimization(layout.leftImage)}
                    />
                  </div>
                </aside>
              ) : null}

              <article className={styles.articleBody}>
                {paragraphs.length > 0 ? (
                  paragraphs.map((paragraph, index) => (
                    <p key={`${blog.id}-paragraph-${index}`}>{paragraph}</p>
                  ))
                ) : (
                  <p>{blog.excerpt}</p>
                )}
              </article>

              {layout.rightImage ? (
                <aside className={styles.sideVisual}>
                  <div className={styles.sideVisualCard}>
                    <Image
                      src={layout.rightImage}
                      alt={layout.rightImageAlt || `${blog.title} right visual`}
                      width={1200}
                      height={900}
                      className={styles.sideVisualImage}
                      unoptimized={shouldBypassNextImageOptimization(layout.rightImage)}
                    />
                  </div>
                </aside>
              ) : null}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {relatedProduct || relatedCategory ? (
        <section className={styles.ctaSection}>
          <div className="container">
            <AnimatedSection>
              <div className={styles.ctaCard}>
                <div>
                  <span className={styles.ctaLabel}>Related Links</span>
                  <h2 className={styles.ctaTitle}>Continue with a relevant machine or category</h2>
                </div>

                <div className={styles.ctaActions}>
                  {relatedProduct ? (
                    <Link href={`/products/${relatedProduct.slug}`} className="btn btn-primary">
                      View Product <ArrowRight size={16} />
                    </Link>
                  ) : null}

                  {relatedCategory ? (
                    <Link
                      href={`/products/category/${relatedCategory.slug}`}
                      className="btn btn-outline"
                    >
                      View Category <ArrowRight size={16} />
                    </Link>
                  ) : null}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      ) : null}
    </>
  );
}
