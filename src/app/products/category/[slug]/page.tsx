import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Download, Phone } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { categoryToSlug, getCategoryBySlug, getCategoryShowcase } from '@/lib/categories';
import { listProducts } from '@/lib/cms';
import { COMPANY_INFO, groupProductsByCategory } from '@/lib/data';
import styles from './page.module.css';

interface Props {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const products = await listProducts({ publishedOnly: true });
  const groups = groupProductsByCategory(products);

  return groups.map((group) => ({ slug: categoryToSlug(group.category) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const products = await listProducts({ publishedOnly: true });
  const groups = groupProductsByCategory(products);
  const category = getCategoryBySlug(
    groups.map((group) => group.category),
    params.slug,
  );

  if (!category) return {};

  const group = groups.find((item) => item.category === category);
  const showcase = getCategoryShowcase(category, group?.items ?? []);

  return {
    title: `${category} | Spectra Pack Machines`,
    description: showcase.description,
    openGraph: {
      title: `${category} | Spectra Pack Machines`,
      description: showcase.description,
      images: [{ url: showcase.image, alt: category }],
    },
  };
}

export default async function ProductCategoryPage({ params }: Props) {
  const products = await listProducts({ publishedOnly: true });
  const productGroups = groupProductsByCategory(products);
  const category = getCategoryBySlug(
    productGroups.map((group) => group.category),
    params.slug,
  );

  if (!category) notFound();

  const activeGroup = productGroups.find((group) => group.category === category);
  if (!activeGroup) notFound();

  const showcase = getCategoryShowcase(category, activeGroup.items);
  const otherGroups = productGroups.filter((group) => group.category !== category).slice(0, 4);
  const primaryPhone = COMPANY_INFO.phone[0].replace(/\s+/g, '');

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <AnimatedSection>
            <div className={styles.breadcrumb}>
              <Link href="/">Home</Link> / <Link href="/#products">Categories</Link> / <span>{category}</span>
            </div>

            <div className={styles.heroContent}>
              <div className={styles.heroCopy}>
                <span className="section-label">{showcase.accent}</span>
                <h1 className={styles.heroTitle}>{category}</h1>
                <p className={styles.heroDesc}>{showcase.description}</p>

                <div className={styles.heroMeta}>
                  <div className={styles.metaCard}>
                    <strong>{activeGroup.items.length}</strong>
                    <span>{activeGroup.items.length === 1 ? 'Machine in this category' : 'Machines in this category'}</span>
                  </div>
                  <div className={styles.metaCard}>
                    <strong>Made in India</strong>
                    <span>Factory-backed supply from the Mumbai region</span>
                  </div>
                </div>

                <div className={styles.heroActions}>
                  <Link href="/schedule-meeting" className="btn btn-accent btn-lg">
                    Enquire for This Category <ArrowRight size={16} />
                  </Link>
                  <a href={`tel:${primaryPhone}`} className="btn btn-outline btn-lg">
                    <Phone size={16} />
                    Call Our Team
                  </a>
                  <a
                    href={COMPANY_INFO.catalogPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-white btn-lg"
                  >
                    <Download size={16} />
                    Download Catalog
                  </a>
                </div>
              </div>

              <div className={styles.heroVisual}>
                <div className={styles.heroImageCard}>
                  <Image
                    src={showcase.image}
                    alt={category}
                    fill
                    className={styles.heroImage}
                    sizes="(max-width: 768px) 100vw, 42vw"
                    priority
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AnimatedSection>
            <div className={styles.sectionIntro}>
              <span className="section-label">Machine Range</span>
              <h2 className="section-title">Explore {category}</h2>
              <p className="section-subtitle" style={{ margin: '0 auto' }}>
                Open any machine to view full specifications, applications, and enquiry details.
              </p>
            </div>
          </AnimatedSection>

          <div className={styles.productGrid}>
            {activeGroup.items.map((product, index) => (
              <AnimatedSection key={product.slug} delay={index * 0.05}>
                <Link href={`/products/${product.slug}`} className={styles.productCard}>
                  <div className={styles.productImageWrap}>
                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      fill
                      className={styles.productImage}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className={styles.productCategory}>{product.category}</div>
                  </div>
                  <div className={styles.productInfo}>
                    <span className={styles.productModel}>{product.modelNo}</span>
                    <h3 className={styles.productName}>{product.title}</h3>
                    <p className={styles.productDesc}>{product.shortDesc}</p>
                    <span className={styles.productLink}>
                      View Details <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {otherGroups.length > 0 ? (
        <section className="section section-alt">
          <div className="container">
            <AnimatedSection>
              <div className={styles.sectionIntro}>
                <span className="section-label">Other Categories</span>
                <h2 className="section-title">More Machine Families</h2>
              </div>
            </AnimatedSection>

            <div className={styles.categoryGrid}>
              {otherGroups.map((group, index) => {
                const groupShowcase = getCategoryShowcase(group.category, group.items);

                return (
                  <AnimatedSection key={group.category} delay={index * 0.06}>
                    <Link
                      href={`/products/category/${categoryToSlug(group.category)}`}
                      className={styles.categoryCard}
                    >
                      <div className={styles.categoryThumb}>
                        <Image
                          src={groupShowcase.image}
                          alt={group.category}
                          fill
                          className={styles.categoryImage}
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                      </div>
                      <span className={styles.categoryEyebrow}>{groupShowcase.accent}</span>
                      <h3>{group.category}</h3>
                      <p>{groupShowcase.description}</p>
                      <span className={styles.categoryLink}>
                        View Category <ArrowRight size={14} />
                      </span>
                    </Link>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
