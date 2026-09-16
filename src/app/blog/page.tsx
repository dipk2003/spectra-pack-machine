import { completePageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import Image from 'next/image';
import type { BlogRecord } from '@/lib/cms';
import { listPublicBlogs } from '@/lib/public-blogs';
import { parseBlogTemplateContent } from '@/lib/blog-template';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { Calendar, ArrowRight, Clock3 } from 'lucide-react';
import { shouldBypassNextImageOptimization } from '@/lib/image-utils';
import styles from './page.module.css';

export const metadata: Metadata = completePageMetadata({
  title: 'Packaging Machine Buying & Operating Guides',
  description: 'Read packaging industry insights, machine guides, and tips from Spectra Pack Machines.',
  alternates: { canonical: '/blog' },
  openGraph: { title: 'Packaging Machine Guides & Insights', url: '/blog' },
});

export const dynamic = 'force-dynamic';

async function loadPublicBlogs() {
  noStore();
  return listPublicBlogs();
}

function formatBlogDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently updated';
  }

  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function estimateReadTime(blog: BlogRecord) {
  const words = [blog.title, blog.excerpt, parseBlogTemplateContent(blog.content).body]
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(2, Math.ceil(words / 180));
}

export default async function BlogPage() {
  const blogs = await loadPublicBlogs();
  const [featuredBlog, ...otherBlogs] = blogs;

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <AnimatedSection initialVisible>
            <div className={styles.heroShell}>
              <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>Spectra Pack Blog</span>
                <h1 className={styles.heroTitle}>Packaging Machine Guides & Insights</h1>
                <p className={styles.heroDesc}>
                  Practical articles for comparing machines, understanding pack formats, and planning reliable
                  production workflows.
                </p>
              </div>

              <div className={styles.heroStats} aria-label="Blog summary">
                <div className={styles.statCard}>
                  <strong>{blogs.length}</strong>
                  <span>Published guides</span>
                </div>
                <div className={styles.statCard}>
                  <strong>{featuredBlog ? formatBlogDate(featuredBlog.createdAt) : 'Coming soon'}</strong>
                  <span>Latest update</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className={styles.blogSection}>
        <div className="container">
          {!featuredBlog ? (
            <AnimatedSection>
              <div className={styles.empty}>
                <h3>No blog posts yet</h3>
                <p>Check back soon for packaging industry insights and guides.</p>
              </div>
            </AnimatedSection>
          ) : (
            <>
              <AnimatedSection>
                <Link href={`/blog/${featuredBlog.slug}`} prefetch={false} className={styles.featuredCard}>
                  <div className={styles.featuredImage}>
                    <Image
                      src={featuredBlog.image}
                      alt={`${featuredBlog.title} featured image`}
                      fill
                      priority
                      className={styles.blogImageMedia}
                      sizes="(max-width: 900px) 100vw, 52vw"
                      unoptimized={shouldBypassNextImageOptimization(featuredBlog.image)}
                    />
                  </div>
                  <div className={styles.featuredContent}>
                    <span className={styles.featuredLabel}>Latest article</span>
                    <h2 className={styles.featuredTitle}>{featuredBlog.title}</h2>
                    <p className={styles.featuredExcerpt}>{featuredBlog.excerpt}</p>
                    <div className={styles.metaRow}>
                      <span>
                        <Calendar size={14} />
                        {formatBlogDate(featuredBlog.createdAt)}
                      </span>
                      <span>
                        <Clock3 size={14} />
                        {estimateReadTime(featuredBlog)} min read
                      </span>
                    </div>
                    <span className={styles.blogLink}>
                      Read article <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </AnimatedSection>

              {otherBlogs.length > 0 ? (
                <>
                  <AnimatedSection>
                    <div className={styles.listHeader}>
                      <div>
                        <span className={styles.eyebrowLight}>More guides</span>
                        <h2>Explore packaging topics</h2>
                      </div>
                      <p>{otherBlogs.length} more article{otherBlogs.length === 1 ? '' : 's'} from the Spectra Pack team.</p>
                    </div>
                  </AnimatedSection>

                  <div className={styles.blogGrid}>
                    {otherBlogs.map((blog, i) => (
                      <AnimatedSection key={blog.id} delay={i * 0.06}>
                        <Link href={`/blog/${blog.slug}`} prefetch={false} className={styles.blogCard}>
                          <div className={styles.blogImage}>
                            <Image
                              src={blog.image}
                              alt={`${blog.title} featured image`}
                              fill
                              className={styles.blogImageMedia}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              unoptimized={shouldBypassNextImageOptimization(blog.image)}
                            />
                          </div>
                          <div className={styles.blogContent}>
                            <div className={styles.metaRow}>
                              <span>
                                <Calendar size={14} />
                                {formatBlogDate(blog.createdAt)}
                              </span>
                              <span>
                                <Clock3 size={14} />
                                {estimateReadTime(blog)} min read
                              </span>
                            </div>
                            <h3 className={styles.blogTitle}>{blog.title}</h3>
                            <p className={styles.blogExcerpt}>{blog.excerpt}</p>
                            <span className={styles.blogLink}>
                              Read more <ArrowRight size={14} />
                            </span>
                          </div>
                        </Link>
                      </AnimatedSection>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </section>
    </>
  );
}
