import { completePageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Globe2 } from 'lucide-react';
import { listProducts } from '@/lib/cms';
import { COMPANY_INFO, groupProductsByCategory } from '@/lib/data';
import { EXPORT_MARKETS, getExportMarket } from '@/lib/export-markets';
import GuideInquiryForm from '@/components/forms/GuideInquiryForm';
import styles from '../page.module.css';

type Props = { params: { country: string } };

export function generateStaticParams() {
  return EXPORT_MARKETS.map((market) => ({ country: market.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const market = getExportMarket(params.country);
  if (!market) return {};
  const path = `/packaging-machines/international/${market.slug}`;
  return completePageMetadata({
    title: market.seoTitle,
    description: market.metaDescription,
    keywords: [...market.searchTerms, `packaging machine exporter to ${market.name}`, `packaging machines from India to ${market.name}`],
    alternates: { canonical: path },
    openGraph: { title: market.seoTitle, description: market.metaDescription, url: path, locale: 'en' },
  });
}

export default async function ExportMarketPage({ params }: Props) {
  const market = getExportMarket(params.country);
  if (!market) notFound();

  const products = await listProducts({ publishedOnly: true, access: 'public' });
  const categories = groupProductsByCategory(products);
  const url = `${COMPANY_INFO.website}/packaging-machines/international/${market.slug}`;
  const otherMarkets = EXPORT_MARKETS.filter((item) => item.slug !== market.slug);

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: market.seoTitle,
      url,
      description: market.metaDescription,
      about: {
        '@type': 'Organization',
        '@id': `${COMPANY_INFO.website}/#organization`,
        name: COMPANY_INFO.name,
        url: COMPANY_INFO.website,
        areaServed: { '@type': 'Country', name: market.name, identifier: market.isoCode },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: COMPANY_INFO.website },
        { '@type': 'ListItem', position: 2, name: 'International Enquiries', item: `${COMPANY_INFO.website}/packaging-machines/international` },
        { '@type': 'ListItem', position: 3, name: market.name, item: url },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <section className={styles.hero}>
        <div className="container">
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/">Home</Link><span>/</span>
            <Link href="/packaging-machines/international">International enquiries</Link><span>/</span>
            <span>{market.name}</span>
          </nav>
          <span className={styles.eyebrow}><Globe2 size={17} /> Export supply from India</span>
          <h1>Packaging machines for {market.inSentence}</h1>
          <p>{market.intro}</p>
          <div className={styles.actions}>
            <a href="#inquiry" className="btn btn-accent">Request a quotation for {market.inSentence} <ArrowRight size={16} /></a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.heading}>
            <span className="section-label">Site power</span>
            <h2>Electrical supply in {market.inSentence}</h2>
            <p>{market.power.note}</p>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <caption>Typical supply in {market.inSentence}; confirm your own site before ordering</caption>
              <tbody>
                <tr><th scope="row">Single phase</th><td>{market.power.singlePhase}</td></tr>
                <tr><th scope="row">Three phase</th><td>{market.power.threePhase}</td></tr>
                <tr><th scope="row">India (our factory)</th><td>230 V / 415 V, 50 Hz</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className={styles.heading}>
            <span className="section-label">Machine range</span>
            <h2>Machines we supply to {market.inSentence}</h2>
            <p>Buyers in {market.inSentence} often look for these as: {market.searchTerms.join(', ')}.</p>
          </div>
          <div className={styles.cards}>
            {categories.map((category) => (
              <Link className={styles.card} href={`/products/category/${category.slug}`} key={category.slug}>
                <h3>{category.category}</h3>
                <p>{category.items.length} machine option{category.items.length === 1 ? '' : 's'}</p>
                <span>Compare the range <ArrowRight size={15} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.heading}>
            <h2>Common applications in {market.inSentence}</h2>
          </div>
          <ul>{market.applications.map((item) => <li key={item}>{item}</li>)}</ul>
          <div className={styles.heading}>
            <h2>Import and safety questions to settle early</h2>
          </div>
          <ul>{market.importNotes.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className={styles.heading}><h2>Frequently asked questions</h2></div>
          <div className="seo-guide-grid">
            {market.faqs.map((faq) => (
              <article className="seo-guide-card" key={faq.q}><h3>{faq.q}</h3><p>{faq.a}</p></article>
            ))}
          </div>
          <div className={styles.reading}>
            <h3>Other export markets</h3>
            {otherMarkets.map((item) => (
              <Link key={item.slug} href={`/packaging-machines/international/${item.slug}`}>Packaging machines for {item.inSentence}</Link>
            ))}
            <Link href="/packaging-machines/international">All international enquiries</Link>
          </div>
        </div>
      </section>

      <GuideInquiryForm guideSlug={`international-${market.slug}`} guideTitle={`Packaging machine enquiry from ${market.name}`} source="export-guide" />
    </>
  );
}
