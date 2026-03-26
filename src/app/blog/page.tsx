import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { headers } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { listBlogs, type BlogRecord } from '@/lib/cms';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { Calendar, ArrowRight } from 'lucide-react';
import { shouldBypassNextImageOptimization } from '@/lib/image-utils';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read packaging industry insights, machine guides, and tips from Spectra Pack Machines.',
};

export const dynamic = 'force-dynamic';

async function loadPublicBlogs() {
  noStore();

  const headerStore = headers();
  const forwardedHost = headerStore.get('x-forwarded-host')?.split(',')[0]?.trim();
  const host = forwardedHost || headerStore.get('host')?.trim() || '';
  const forwardedProto = headerStore.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol =
    forwardedProto ||
    (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(host) ? 'http' : 'https');

  if (!host) {
    return listBlogs({ publishedOnly: true, access: 'public' });
  }

  try {
    const response = await fetch(`${protocol}://${host}/api/blogs`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`Failed to load blogs: ${response.status}`);
    }

    const data = (await response.json()) as unknown;
    return Array.isArray(data) ? (data as BlogRecord[]) : [];
  } catch {
    return listBlogs({ publishedOnly: true, access: 'public' });
  }
}

export default async function BlogPage() {
  const blogs = await loadPublicBlogs();

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <AnimatedSection>
            <span className="section-label" style={{ color: 'var(--accent)' }}>Our Blog</span>
            <h1 className={styles.heroTitle}>Packaging Insights & Guides</h1>
            <p className={styles.heroDesc}>
              Stay updated with the latest packaging industry trends, machine guides, and expert tips.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {blogs.length === 0 ? (
            <AnimatedSection>
              <div className={styles.empty}>
                <h3>No blog posts yet</h3>
                <p>Check back soon for packaging industry insights and guides.</p>
              </div>
            </AnimatedSection>
          ) : (
            <div className={styles.blogGrid}>
              {blogs.map((blog, i) => (
                <AnimatedSection key={blog.id} delay={i * 0.1}>
                  <Link
                    href={`/blog/${blog.slug}`}
                    prefetch={false}
                    className={styles.blogCard}
                  >
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
                      <div className={styles.blogDate}>
                        <Calendar size={14} />
                        {new Date(blog.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <h3 className={styles.blogTitle}>{blog.title}</h3>
                      <p className={styles.blogExcerpt}>{blog.excerpt}</p>
                      <span className={styles.blogLink}>Read More <ArrowRight size={14} /></span>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
