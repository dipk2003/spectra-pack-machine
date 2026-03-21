import type { Metadata } from 'next';
import { getProductBySlug, listProducts } from '@/lib/cms';
import { notFound } from 'next/navigation';
import ProductPageClient from './ProductPageClient';

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
    title: product.seoTitle || product.title,
    description: product.seoDesc || product.shortDesc,
    openGraph: {
      title: `${product.title} | Spectra Pack Machines`,
      description: product.shortDesc,
      images: [{ url: product.image, alt: product.title }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const [product, products] = await Promise.all([
    getProductBySlug(params.slug, { publishedOnly: true }),
    listProducts({ publishedOnly: true }),
  ]);
  if (!product) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    sku: product.modelNo,
    description: product.description,
    category: product.category,
    image: product.image,
    manufacturer: {
      '@type': 'Organization',
      name: 'Spectra Pack Machines',
      url: 'https://www.spectrapackmachines.com',
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'INR',
      seller: { '@type': 'Organization', name: 'Spectra Pack Machines' },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductPageClient product={product} allProducts={products} />
    </>
  );
}
