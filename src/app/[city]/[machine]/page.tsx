import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductBySlug, listProducts } from '@/lib/cms';
import { SEO_CITIES, SEO_CITY_MARKETS, COMPANY_INFO } from '@/lib/data';
import { categoryToSlug } from '@/lib/categories';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { CheckCircle, ArrowRight, Phone } from 'lucide-react';
import styles from './page.module.css';
import { buildAbsoluteSeoTitle, buildMetaDescription } from '@/lib/seo';

interface Props {
  params: { city: string; machine: string };
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const products = await listProducts({ publishedOnly: true });
  const params: { city: string; machine: string }[] = [];

  for (const city of SEO_CITIES) {
    for (const product of products) {
      params.push({ city, machine: product.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cityMarket = SEO_CITY_MARKETS.find((market) => market.slug === params.city);
  const product = await getProductBySlug(params.machine, { publishedOnly: true });
  if (!product || !cityMarket) return {};

  const city = cityMarket.name;
  return {
    title: { absolute: buildAbsoluteSeoTitle(`${product.title} in ${city}`, product.title) },
    description: buildMetaDescription(
      `Get ${product.title} model details, specifications, quotation guidance, dispatch support and after-sales coordination for businesses in ${city}, ${cityMarket.region}.`,
      product.shortDesc,
    ),
    keywords: [
      `${product.title} in ${city}`,
      `${product.title} manufacturer in ${city}`,
      `packing machine supplier in ${city}`,
      `Spectra Pack Machines ${city}`,
    ],
    alternates: { canonical: `/${params.city}/${product.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${product.title} for Businesses in ${city}`,
      description: `Factory-backed ${product.title} supply, specifications, quotation guidance, and support for ${city}, ${cityMarket.region}.`,
      url: `/${params.city}/${product.slug}`,
      type: 'website',
      locale: 'en_IN',
      siteName: COMPANY_INFO.name,
      images: product.image ? [{ url: product.image, alt: product.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} in ${city}`,
      description: `Review specifications and request a ${product.title} quotation for ${city}.`,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function SEOLandingPage({ params }: Props) {
  const cityMarket = SEO_CITY_MARKETS.find((market) => market.slug === params.city);
  const [product, products] = await Promise.all([
    getProductBySlug(params.machine, { publishedOnly: true }),
    listProducts({ publishedOnly: true }),
  ]);

  if (!product || !cityMarket || !SEO_CITIES.includes(params.city)) notFound();

  const city = cityMarket.name;
  const categorySlug = product.categorySlug || categoryToSlug(product.category);
  const canonicalUrl = `${COMPANY_INFO.website}/${params.city}/${product.slug}`;
  const imageUrl = product.image
    ? product.image.startsWith('http')
      ? product.image
      : `${COMPANY_INFO.website}${product.image.startsWith('/') ? '' : '/'}${product.image}`
    : undefined;
  const quoteParams = new URLSearchParams({
    machine: product.title,
    product: product.slug,
    category: categorySlug,
    location: `${city}, ${cityMarket.region}`,
    city: cityMarket.slug,
    source: 'seo-landing',
  });
  const quoteHref = `/contact?${quoteParams.toString()}`;
  const relatedMachines = products
    .filter((item) => item.slug !== product.slug && item.category === product.category)
    .slice(0, 4);
  const otherMarkets = SEO_CITY_MARKETS
    .filter((market) => market.slug !== cityMarket.slug)
    .slice(0, 6);

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${canonicalUrl}#product`,
      name: product.title,
      sku: product.modelNo || undefined,
      model: product.modelNo || undefined,
      description: product.description || product.shortDesc,
      url: canonicalUrl,
      category: product.category,
      brand: { '@type': 'Brand', name: COMPANY_INFO.name },
      manufacturer: {
        '@type': 'Organization',
        name: COMPANY_INFO.name,
        url: COMPANY_INFO.website,
        telephone: COMPANY_INFO.phone[0],
      },
      image: imageUrl,
      additionalProperty: Object.entries(product.specs).map(([name, value]) => ({
        '@type': 'PropertyValue',
        name,
        value,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: `${product.title} in ${city}`,
      description: `${product.title} specifications, selection guidance, and quotation support for buyers in ${city}, ${cityMarket.region}.`,
      inLanguage: 'en-IN',
      mainEntity: { '@id': `${canonicalUrl}#product` },
      about: { '@type': 'City', name: city, containedInPlace: cityMarket.region },
      isPartOf: { '@type': 'WebSite', name: COMPANY_INFO.name, url: COMPANY_INFO.website },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: COMPANY_INFO.website },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Packaging Machines Across India',
          item: `${COMPANY_INFO.website}/packaging-machines`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: `Packaging Machines in ${city}`,
          item: `${COMPANY_INFO.website}/packaging-machines/${cityMarket.slug}`,
        },
        { '@type': 'ListItem', position: 4, name: product.title, item: canonicalUrl },
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
              <Link href="/">Home</Link> / <Link href={`/packaging-machines/${params.city}`}>{city}</Link> / <span>{product.title}</span>
            </div>
            <h1 className={styles.heroTitle}>
              <span className="text-gradient">{product.title}</span> for Businesses in {city}
            </h1>
            <p className={styles.heroDesc}>
              Looking for a reliable {product.title} in {city}? Spectra Pack Machines manufactures
              {` ${product.category.toLowerCase()}`} at its Vasai facility and supports customers with machine selection,
              pan-India dispatch coordination, installation guidance, and after-sales assistance.
            </p>
            <div className={styles.heroActions}>
              <Link href={quoteHref} className="btn btn-accent btn-lg">
                Get Free Quote <ArrowRight size={18} />
              </Link>
              <a href={`tel:${COMPANY_INFO.phone[0]}`} className="btn btn-white btn-lg">
                <Phone size={18} /> Call Us Now
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.contentGrid}>
            <AnimatedSection direction="left">
              <h2>Why Choose Our {product.title} in {city}?</h2>
              <p className={styles.para}>
                With {COMPANY_INFO.yearsOfExperience}+ years of packaging machinery experience, Spectra Pack Machines helps businesses in {city}{' '}
                compare the right {product.title} configuration for their product, pack size, output, and production layout.
              </p>
              <p className={styles.para}>
                Our {product.title} is designed for {product.category.toLowerCase()} applications and comes with features like:
              </p>
              <ul className={styles.featureList}>
                {product.features.map((f, i) => (
                  <li key={i}><CheckCircle size={18} /> {f}</li>
                ))}
              </ul>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <div className={styles.infoCard}>
                <div className={styles.cardImage}>
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      fill
                      className={styles.cardThumb}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>Image managed from admin</div>
                  )}
                </div>
                <span className={styles.modelTag}>{product.modelNo}</span>
                <h3>{product.title}</h3>
                <p>{product.shortDesc}</p>
                <div className={styles.specsList}>
                  {Object.entries(product.specs).slice(0, 4).map(([k, v]) => (
                    <div key={k} className={styles.specItem}>
                      <span className={styles.specKey}>{k}</span>
                      <span className={styles.specVal}>{v}</span>
                    </div>
                  ))}
                </div>
                <Link href={`/products/${product.slug}`} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  View Full Details <ArrowRight size={16} />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className={styles.planningGrid}>
            <AnimatedSection direction="left" className={styles.planningCard}>
              <span className="section-label">Quote Checklist for {city}</span>
              <h2>Details That Help Us Configure Your Machine</h2>
              <p>
                A useful quotation is based on the application, not only the machine name. Share these details so our team can compare the right configuration for your site in {city}.
              </p>
              <ul className={styles.checklist}>
                <li><CheckCircle size={18} /> Product, pack format, and sample photos or video</li>
                <li><CheckCircle size={18} /> Minimum and maximum pack dimensions</li>
                <li><CheckCircle size={18} /> Required packs per minute or daily production target</li>
                <li><CheckCircle size={18} /> Available floor space, power supply, and automation preference</li>
                <li><CheckCircle size={18} /> Delivery postal code and expected purchase timeline</li>
              </ul>
              <Link href={quoteHref} className="btn btn-primary">Send Requirement <ArrowRight size={16} /></Link>
            </AnimatedSection>

            <AnimatedSection direction="right" className={styles.planningCard}>
              <span className="section-label">Supply & Support</span>
              <h2>Planning Dispatch to {city}, {cityMarket.region}</h2>
              <p>
                Machines are manufactured and tested at our Vasai facility. Before dispatch, our team coordinates the selected model, application inputs, site-readiness information, and delivery destination.
              </p>
              <p>
                For the {city} market, enquiry coverage can include {cityMarket.industrialAreas.join(', ')} and nearby production areas. Final freight and service planning depends on the exact postal code and site conditions.
              </p>
              <div className={styles.supportFacts}>
                <div><strong>Machine</strong><span>{product.title}</span></div>
                <div><strong>Model</strong><span>{product.modelNo || 'Configured to requirement'}</span></div>
                <div><strong>Category</strong><span>{product.category}</span></div>
                <div><strong>Service area</strong><span>{city}, {cityMarket.region}</span></div>
              </div>
              <Link href={`/products/${product.slug}`} className="btn btn-outline">View Complete Specifications</Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {(relatedMachines.length > 0 || otherMarkets.length > 0) && (
        <section className="section">
          <div className="container">
            <div className={styles.internalLinkGrid}>
              {relatedMachines.length > 0 && (
                <div>
                  <h2>Related {product.category} in {city}</h2>
                  <div className={styles.linkList}>
                    {relatedMachines.map((item) => (
                      <Link key={item.slug} href={`/${cityMarket.slug}/${item.slug}`}>
                        {item.title} in {city} <ArrowRight size={14} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {otherMarkets.length > 0 && (
                <div>
                  <h2>{product.title} in Other Markets</h2>
                  <div className={styles.linkList}>
                    {otherMarkets.map((market) => (
                      <Link key={market.slug} href={`/${market.slug}/${product.slug}`}>
                        {market.name}, {market.region} <ArrowRight size={14} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="section section-dark" style={{ textAlign: 'center' }}>
        <div className="container">
          <AnimatedSection>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
              Request a {product.title} Quote for {city}
            </h2>
            <p style={{ color: '#94a3b8', width: 'min(100%, calc(20rem + 15.972vw))', margin: '0 auto 2rem' }}>
              Share your product details, pack size, expected output, and delivery location for a practical recommendation and current quotation.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href={quoteHref} className="btn btn-accent btn-lg">Request Quotation</Link>
              <Link href="/schedule-meeting" className="btn btn-white btn-lg">Schedule Meeting</Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
