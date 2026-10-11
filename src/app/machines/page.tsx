import Link from 'next/link';
import { listProducts } from '@/lib/cms';
import { COMPANY_INFO, groupProductsByCategory } from '@/lib/data';
import { completePageMetadata } from '@/lib/seo';
import { machineBuyingGuide } from '@/lib/machine-buying-guide';
import { MODEL_GUIDE_PROFILES, modelGuideHref } from '@/lib/model-guides';

export const dynamic = 'force-dynamic';
export const metadata = completePageMetadata({
  title: 'Packaging Machine Catalogue: Models, Specifications & Buying Guides',
  description: 'Compare Spectra Pack machine models by category. Find specifications, packing applications, selection advice and quotation information for each machine.',
  alternates: { canonical: '/machines' },
});

export default async function MachinesPage() {
  const products = await listProducts({ publishedOnly: true });
  const groups = groupProductsByCategory(products);
  const schema = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: 'Spectra Pack Machine Catalogue', url: `${COMPANY_INFO.website}/machines`,
    mainEntity: { '@type': 'ItemList', numberOfItems: products.length,
      itemListElement: products.map((product, i) => ({
        '@type': 'ListItem', position: i + 1, name: product.title,
        url: `${COMPANY_INFO.website}/products/${product.slug}`,
      })),
    },
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <section className="section"><div className="container">
      <p><Link href="/">Home</Link> / Machine catalogue</p>
      <h1>Packaging machine catalogue</h1>
      <p>Compare {products.length} published machine models from Spectra Pack Machines. Open a model for specifications, features, buying guidance and a quotation.</p>
      <p>Choose by your product, packaging material and required output. Confirm suitability with a sample trial before ordering.</p>
      <nav aria-label="Machine categories" className="seo-guide-grid">
        {groups.map(group => <a className="seo-guide-card" key={group.slug} href={`#${group.slug}`}>{group.category} ({group.items.length})</a>)}
      </nav>
    </div></section>
    {groups.map(group => <section key={group.slug} id={group.slug} className="section section-alt"><div className="container">
      <h2>{group.category}</h2>
      <p><Link href={`/products/category/${group.slug}`}>Explore {group.category.toLowerCase()}</Link></p>
      <div className="seo-guide-grid">{group.items.map(product => <article className="seo-guide-card" key={product.slug}>
        <h3><Link href={`/products/${product.slug}`}>{product.title}</Link></h3>
        {product.modelNo && <p>Model: {product.modelNo}</p>}
        <p>{product.shortDesc}</p>
        <p>Selection checks: {machineBuyingGuide(product).checks.join('; ').toLowerCase()}.</p>
        <Link href={`/products/${product.slug}`}>Specifications, buying guide & quotation →</Link>
        {MODEL_GUIDE_PROFILES[product.slug] && <p><Link href={modelGuideHref(product.slug, 'buying-guide')}>Buying guide</Link> · <Link href={modelGuideHref(product.slug, 'trial-checklist')}>Trial checklist</Link></p>}
      </article>)}</div>
    </div></section>)}
    <section className="section"><div className="container">
      <h2>Which packaging machine should you choose?</h2>
      <p>Share your product, pack size, packaging material, hourly output and site location. Our team can review the application and discuss the appropriate configuration.</p>
      <Link className="btn btn-primary" href="/contact">Discuss your packaging requirement</Link>
      <p><Link href="/blog">Read machine buying and operating guides</Link> · <Link href="/packaging-machines">Plan delivery and service by location</Link></p>
    </div></section>
  </>;
}
