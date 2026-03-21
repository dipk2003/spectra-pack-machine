import type { Metadata } from 'next';
import Link from 'next/link';
import { listBlogs } from '@/lib/cms';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { Calendar, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read packaging industry insights, machine guides, and tips from Spectra Pack Machines.',
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  let blogs: any[] = [];
  try {
    blogs = await listBlogs({ publishedOnly: true });
  } catch {
    // Empty state is fine until Supabase content is configured.
  }

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
                  <Link href={`/blog/${blog.slug}`} className={styles.blogCard}>
                    <div className={styles.blogImage}>
                      <span>📰</span>
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
