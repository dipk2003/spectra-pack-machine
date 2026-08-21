import type { Metadata } from 'next';
import { getProductBySlug, listProducts } from '@/lib/cms';
import { notFound } from 'next/navigation';
import ProductPageClient from './ProductPageClient';
import { COMPANY_INFO } from '@/lib/data';
import { categoryToSlug } from '@/lib/categories';
import { buildAbsoluteSeoTitle, buildMetaDescription } from '@/lib/seo';

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
  return {
    title: { absolute: buildAbsoluteSeoTitle(product.seoTitle, product.title) },
    description: buildMetaDescription(product.seoDesc, product.shortDesc),
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
  };
}

export default async function ProductPage({ params }: Props) {
  const [product, products] = await Promise.all([
    getProductBySlug(params.slug, { publishedOnly: true }),
    listProducts({ publishedOnly: true }),
  ]);
  if (!product) notFound();
  const categorySlug = product.categorySlug || categoryToSlug(product.category);
  const productUrl = `${COMPANY_INFO.website}/products/${product.slug}`;
  const imageUrl = product.image
    ? product.image.startsWith('http')
      ? product.image
      : `${COMPANY_INFO.website}${product.image.startsWith('/') ? '' : '/'}${product.image}`
    : undefined;

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${productUrl}#product`,
      name: product.title,
      sku: product.modelNo || undefined,
      model: product.modelNo || undefined,
      description: product.description,
      category: product.category,
      url: productUrl,
      image: imageUrl,
      brand: { '@type': 'Brand', name: COMPANY_INFO.name },
      manufacturer: {
        '@type': 'Organization',
        name: COMPANY_INFO.name,
        url: COMPANY_INFO.website,
        telephone: COMPANY_INFO.phone[0],
      },
      additionalProperty: Object.entries(product.specs).map(([name, value]) => ({
        '@type': 'PropertyValue',
        name,
        value,
      })),
    },
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
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ProductPageClient product={product} allProducts={products} />
    </>
  );
}
