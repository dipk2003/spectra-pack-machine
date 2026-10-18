import Link from 'next/link';
import Image from 'next/image';
import { listPublicBlogs } from '@/lib/public-blogs';
import { blogsForProduct } from '@/lib/content-links';
import { completePageMetadata, machineSearchKeywords } from '@/lib/seo';
import type { Metadata } from 'next';
import { getProductBySlug, listProducts, listServices } from '@/lib/cms';
import { notFound } from 'next/navigation';
import ProductPageClient from './ProductPageClient';
import { COMPANY_INFO } from '@/lib/data';
import { categoryToSlug } from '@/lib/categories';
import { buildAbsoluteSeoTitle, buildMetaDescription } from '@/lib/seo';
import { machineBuyingGuide } from '@/lib/machine-buying-guide';
import { MODEL_GUIDE_PROFILES, modelGuideHref } from '@/lib/model-guides';

interface Props {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const products = await listProducts({ publishedOnly: true });
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug, { publishedOnly: true });
  if (!product) return {};
  return completePageMetadata({
    title: { absolute: buildAbsoluteSeoTitle(product.seoTitle, product.title) },
    description: buildMetaDescription(product.seoDesc, product.shortDesc),
    keywords: [...machineSearchKeywords(product.title, product.category), product.modelNo].filter(Boolean),
    alternates: { canonical: `/products/${product.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${product.title} | Spectra Pack Machines`,
      description: product.shortDesc,
      url: `/products/${product.slug}`,
      type: 'website',
      locale: 'en_IN',
      siteName: COMPANY_INFO.name,
      images: product.image ? [{ url: product.image, alt: product.imageAlt || product.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.shortDesc,
      images: product.image ? [product.image] : [],
    },
  });
}

export default async function ProductPage({ params }: Props) {
  const [product, products, publicBlogs, services] = await Promise.all([
    getProductBySlug(params.slug, { publishedOnly: true }),
    listProducts({ publishedOnly: true }),
    listPublicBlogs(),
    listServices({ publishedOnly: true }),
  ]);
  if (!product) notFound();
  const buyingGuide = machineBuyingGuide(product);
  const machineGuides = blogsForProduct(publicBlogs, product, products).slice(0, 4);
  const categorySlug = product.categorySlug || categoryToSlug(product.category);
  const productUrl = `${COMPANY_INFO.website}/products/${product.slug}`;

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: COMPANY_INFO.website },
        {
          '@type': 'ListItem',
          position: 2,
          name: product.category,
          item: `${COMPANY_INFO.website}/products/category/${categorySlug}`,
        },
        { '@type': 'ListItem', position: 3, name: product.title, item: productUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${productUrl}#product`,
      name: product.title,
      description: product.shortDesc,
      image: product.image ? new URL(product.image, COMPANY_INFO.website).href : undefined,
      sku: product.modelNo || undefined,
      category: product.category,
      brand: { '@type': 'Brand', name: COMPANY_INFO.name },
      manufacturer: { '@type': 'Organization', '@id': `${COMPANY_INFO.website}/#organization`, name: COMPANY_INFO.name, url: COMPANY_INFO.website },
    },
    ...(product.faqs.length ? [{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: product.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    }] : []),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <ProductPageClient product={product} allProducts={products} />
      <section className="section section-alt" aria-labelledby="machine-buying-heading"><div className="container">
        <h2 id="machine-buying-heading">{product.title}: price and selection guide</h2>
        {MODEL_GUIDE_PROFILES[product.slug] && <nav aria-label="Detailed machine guides"><p>
          <Link href={modelGuideHref(product.slug, 'buying-guide')}>Model buying guide and quotation checklist</Link> · <Link href={modelGuideHref(product.slug, 'trial-checklist')}>Sample trial and acceptance checklist</Link>
        </p></nav>}
        <p>{buyingGuide.price}</p>
        <div className="seo-guide-grid">
          <article className="seo-guide-card"><h3>What should you check before buying?</h3>
            <ul>{buyingGuide.checks.map(check => <li key={check}>{check}</li>)}</ul>
          </article>
          <article className="seo-guide-card"><h3>How should you test this machine?</h3><p>{buyingGuide.trial}</p></article>
          <article className="seo-guide-card"><h3>Comparing {buyingGuide.terms[0]} options?</h3>
            <p>Compare the listed specifications, pack compatibility and operating requirements with other models in this range. Confirm the final configuration and performance with your own samples.</p>
            <Link href={`/products/category/${categorySlug}`}>Compare {product.category.toLowerCase()}</Link>
          </article>
        </div>
        <p><Link href="/machines">Browse all machine models and specifications</Link> · <Link href="/contact">Request a machine quotation</Link></p>
      </div></section>
      <section className="section" aria-labelledby="machine-services-heading"><div className="container">
        <h2 id="machine-services-heading">Services for {product.title}</h2>
        <div className="seo-guide-grid">{services.map(service => <Link key={service.slug} href={'/services/' + service.slug} className="seo-guide-card"><h3>{service.title}</h3><p>{service.description}</p></Link>)}</div>
      </div></section>
      {machineGuides.length > 0 && (
        <section className="section section-alt" aria-labelledby="machine-guides-heading">
          <div className="container">
            <h2 id="machine-guides-heading">Buying and operating guides for {product.title}</h2>
            <div className="seo-guide-grid">
              {machineGuides.map(guide => (
                <Link key={guide.slug} href={'/blog/' + guide.slug} className="seo-guide-card">
                  <Image src={guide.image} alt={guide.title} width={480} height={300} sizes="(max-width: 700px) 100vw, 33vw" />
                  <h3>{guide.title}</h3><p>{guide.excerpt}</p><span>Read guide →</span>
                </Link>
              ))}
            </div>
            <p><Link href="/packaging-machines">Explore machine supply and service planning across India</Link></p>
          </div>
        </section>
      )}
    </>
  );
}
