import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Download, Phone } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { getCategoryShowcase } from '@/lib/categories';
import { getCatalogPath, listCategories, listProducts, type CategoryRecord } from '@/lib/cms';
import { COMPANY_INFO, groupProductsByCategory, type ProductData } from '@/lib/data';
import styles from './page.module.css';

interface Props {
  params: { slug: string };
}

type CategoryEntry = {
  name: string;
  slug: string;
  description: string;
  accent: string;
  image: string;
  sortOrder: number;
  items: ProductData[];
};

export const dynamic = 'force-dynamic';

const buildCategoryEntries = (
  categories: CategoryRecord[],
  productGroups: Array<{ category: string; slug: string; items: ProductData[] }>,
): CategoryEntry[] => {
  const entries = new Map<string, CategoryEntry>();

  categories.forEach((category, index) => {
    entries.set(category.slug, {
      name: category.name,
      slug: category.slug,
      description: category.description,
      accent: category.accent,
      image: category.image,
      sortOrder: category.sortOrder ?? index,
      items: [],
    });
  });

  productGroups.forEach((group, index) => {
    const fallback = getCategoryShowcase(group.category, group.items);
    const existing = entries.get(group.slug);

    if (existing) {
      existing.items = group.items;
      existing.name = existing.name || group.category;
      existing.description = existing.description || fallback.description;
      existing.accent = existing.accent || fallback.accent;
      existing.image = fallback.image || existing.image;
      return;
    }

    entries.set(group.slug, {
      name: group.category,
      slug: group.slug,
      description: fallback.description,
      accent: fallback.accent,
      image: fallback.image,
      sortOrder: categories.length + index,
      items: group.items,
    });
  });

  return Array.from(entries.values()).sort(
    (left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name),
  );
};

export async function generateStaticParams() {
  const [products, categories] = await Promise.all([
    listProducts({ publishedOnly: true }),
    listCategories({ publishedOnly: true }),
  ]);
  const entries = buildCategoryEntries(categories, groupProductsByCategory(products));

  return entries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [products, categories] = await Promise.all([
    listProducts({ publishedOnly: true }),
    listCategories({ publishedOnly: true }),
  ]);
  const entries = buildCategoryEntries(categories, groupProductsByCategory(products));
  const category = entries.find((entry) => entry.slug === params.slug);

  if (!category) return {};

  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/products/category/${category.slug}` },
    robots: { index: category.items.length > 0, follow: true },
    openGraph: {
      title: `${category.name} | Spectra Pack Machines`,
      description: category.description,
      url: `/products/category/${category.slug}`,
      type: 'website',
      locale: 'en_IN',
      siteName: COMPANY_INFO.name,
      images: category.image ? [{ url: category.image, alt: category.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: category.name,
      description: category.description,
      images: category.image ? [category.image] : [],
    },
  };
}

export default async function ProductCategoryPage({ params }: Props) {
  const [products, categories, catalogPath] = await Promise.all([
    listProducts({ publishedOnly: true }),
    listCategories({ publishedOnly: true }),
    getCatalogPath(),
  ]);

  const categoryEntries = buildCategoryEntries(categories, groupProductsByCategory(products));
  const activeCategory = categoryEntries.find((entry) => entry.slug === params.slug);

  if (!activeCategory) notFound();

  const otherGroups = categoryEntries
    .filter((entry) => entry.slug !== params.slug)
    .slice(0, 4);
  const primaryPhone = COMPANY_INFO.phone[0].replace(/\s+/g, '');
  const categoryUrl = `${COMPANY_INFO.website}/products/category/${activeCategory.slug}`;
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${categoryUrl}#webpage`,
      name: activeCategory.name,
      description: activeCategory.description,
      url: categoryUrl,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: activeCategory.items.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: product.title,
          url: `${COMPANY_INFO.website}/products/${product.slug}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: COMPANY_INFO.website },
        { '@type': 'ListItem', position: 2, name: 'Machine Categories', item: `${COMPANY_INFO.website}/#products` },
        { '@type': 'ListItem', position: 3, name: activeCategory.name, item: categoryUrl },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className={styles.hero}>
        <div className="container">
          <AnimatedSection>
            <div className={styles.breadcrumb}>
              <Link href="/">Home</Link> / <Link href="/#products">Categories</Link> /{' '}
              <span>{activeCategory.name}</span>
            </div>

            <div className={styles.heroContent}>
              <div className={styles.heroCopy}>
                <span className="section-label">{activeCategory.accent}</span>
                <h1 className={styles.heroTitle}>{activeCategory.name}</h1>
                <p className={styles.heroDesc}>{activeCategory.description}</p>

                <div className={styles.heroMeta}>
                  <div className={styles.metaCard}>
                    <strong>{activeCategory.items.length}</strong>
                    <span>
                      {activeCategory.items.length === 1
                        ? 'Machine in this category'
                        : 'Machines in this category'}
                    </span>
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
                    href={catalogPath}
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
                  {activeCategory.image ? (
                    <Image
                      src={activeCategory.image}
                      alt={activeCategory.name}
                      fill
                      className={styles.heroImage}
                      sizes="(max-width: 768px) 100vw, 42vw"
                      priority
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>Image managed from admin</div>
                  )}
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
              <h2 className="section-title">Explore {activeCategory.name}</h2>
              <p className="section-subtitle" style={{ margin: '0 auto' }}>
                Open any machine to view full specifications, applications, and enquiry details.
              </p>
            </div>
          </AnimatedSection>

          {activeCategory.items.length === 0 ? (
            <div className={styles.emptyState}>
              Machines have not been published in this category yet. Add products from the admin panel and
              they will appear here automatically.
            </div>
          ) : (
            <div className={styles.productGrid}>
              {activeCategory.items.map((product, index) => (
                <AnimatedSection key={product.slug} delay={index * 0.05}>
                  <Link href={`/products/${product.slug}`} className={styles.productCard}>
                    <div className={styles.productImageWrap}>
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.imageAlt}
                          fill
                          className={styles.productImage}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>Image managed from admin</div>
                      )}
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
          )}
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
              {otherGroups.map((group, index) => (
                <AnimatedSection key={group.slug} delay={index * 0.06}>
                  <Link
                    href={`/products/category/${group.slug}`}
                    className={styles.categoryCard}
                  >
                    <div className={styles.categoryThumb}>
                      {group.image ? (
                        <Image
                          src={group.image}
                          alt={group.name}
                          fill
                          className={styles.categoryImage}
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>Image managed from admin</div>
                      )}
                    </div>
                    <span className={styles.categoryEyebrow}>{group.accent}</span>
                    <h3>{group.name}</h3>
                    <p>{group.description}</p>
                    <span className={styles.categoryLink}>
                      View Category <ArrowRight size={14} />
                    </span>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
