import { completePageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Globe2 } from 'lucide-react';
import { listProducts, listServices } from '@/lib/cms';
import { COMPANY_INFO, groupProductsByCategory } from '@/lib/data';
import GuideInquiryForm from '@/components/forms/GuideInquiryForm';
import { EXPORT_MARKETS } from '@/lib/export-markets';
import styles from './page.module.css';

export const metadata: Metadata = completePageMetadata({
  title: 'Packaging Machine Manufacturer & Exporter from India | International Supply',
  description: 'Packaging machine exporter from India: shrink wrapping, sealing, vacuum packaging and conveyor machines for the UAE, Saudi Arabia, USA, UK, Australia and more.',
  alternates: { canonical: '/packaging-machines/international' },
  openGraph: { title: 'International Packaging Machine Enquiries', url: '/packaging-machines/international', images: ['/images/hero/automatic-liquid-filling-line-cutout.png'] },
});

const planningRows = [
  ['Product and output', 'Product photos or samples, pack dimensions and weight, packaging material, accepted packs per hour and planned shifts.'],
  ['Destination and delivery', 'Country, city, consignee, intended delivery point or port, unloading arrangements and preferred supply boundary.'],
  ['Site utilities', 'Voltage, frequency, phases, available compressed air, installation footprint and transfer heights.'],
  ['Documentation', 'Machine drawings, manuals, language needs and destination equipment requirements identified by your responsible advisers.'],
  ['Trial acceptance', 'Representative samples, agreed quality checks, measured output, changeover demonstration and a record of results.'],
  ['Service and spares', 'Remote or on-site commissioning scope, training, initial spares, support contact and separately confirmed travel arrangements.'],
];

export default async function InternationalMachinesPage() {
  const [products, services] = await Promise.all([
    listProducts({ publishedOnly: true, access: 'public' }),
    listServices({ publishedOnly: true, access: 'public' }).catch(() => []),
  ]);
  const categories = groupProductsByCategory(products);
  const url = `${COMPANY_INFO.website}/packaging-machines/international`;
  const schema = [
    { '@context': 'https://schema.org', '@type': 'WebPage', name: 'International Packaging Machine Enquiries', url, description: metadata.description, about: { '@type': 'Organization', name: COMPANY_INFO.name, url: COMPANY_INFO.website } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: COMPANY_INFO.website },
      { '@type': 'ListItem', position: 2, name: 'Packaging Machines', item: `${COMPANY_INFO.website}/packaging-machines` },
      { '@type': 'ListItem', position: 3, name: 'International Enquiries', item: url },
    ] },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Home</Link><span>/</span><Link href="/packaging-machines">Packaging machines</Link><span>/</span><span>International enquiries</span></nav>
            <span className={styles.eyebrow}><Globe2 size={17} /> Plan an international requirement</span>
            <h1>Packaging machinery from India for your next production project</h1>
            <p>Compare the machine range and prepare a destination-specific enquiry. Our team in Maharashtra can review your product, required output and delivery location to confirm the available configuration and supply scope.</p>
            <div className={styles.actions}><a href="#inquiry" className="btn btn-accent">Discuss an Export Enquiry <ArrowRight size={16} /></a><Link href="/blog/packaging-machine-export-enquiry-shipping-checklist" className="btn btn-white">Read the planning guide</Link></div>
          </div>
          <div className={styles.heroImage}><Image src="/images/hero/automatic-liquid-filling-line-cutout.png" alt="Automatic liquid filling and packaging line" fill priority sizes="(max-width: 900px) 100vw, 45vw" /></div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className={styles.heading}><span className="section-label">Build a clear enquiry</span><h2>Share the application and the destination together</h2><p>A machine price alone does not define a delivered project. Agree the quoted equipment, shipment boundary, documentation, trials and support before comparing proposals.</p></div>
          <div className={styles.tableWrap}><table><caption>Information needed for an international machinery discussion</caption><thead><tr><th scope="col">Planning area</th><th scope="col">What to include</th></tr></thead><tbody>{planningRows.map(([title, content]) => <tr key={title}><th scope="row">{title}</th><td>{content}</td></tr>)}</tbody></table></div>
          <p className={styles.note}>Mention the exact city and country whether your site is in South Asia, the Middle East, Africa, Southeast Asia, Europe or the Americas. Destination availability, delivery timing and on-site support are confirmed per enquiry. This page does not represent a local office or a pre-approved supply arrangement in every market.</p>
        </div>
      </section>
      <section className="section section-alt">
        <div className="container">
          <div className={styles.heading}><span className="section-label">Review the catalog</span><h2>Find the machine family for your product</h2><p>Start with the packaging method, then include the machine or category in your enquiry. Final suitability depends on the product, materials and agreed configuration.</p></div>
          <div className={styles.cards}>{categories.map((category) => <Link className={styles.card} href={`/products/category/${category.slug}`} key={category.slug}><h3>{category.category}</h3><p>{category.items.length} published machine option{category.items.length === 1 ? '' : 's'}</p><span>Compare the range <ArrowRight size={15} /></span></Link>)}</div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className={styles.heading}><h2>Plan trials, installation and support before dispatch</h2><p>Decide how your team will review the machine, who prepares the site and how the approved settings will be handed over. Request the service scope in writing, including any travel or destination limitations.</p></div>
          <div className={styles.serviceLinks}>{services.map((service) => <Link key={service.slug} href={`/services/${service.slug}`}>{service.title}<ArrowRight size={16} /></Link>)}</div>
          <div className={styles.reading}><h3>Country guides</h3>{EXPORT_MARKETS.map((market) => <Link key={market.slug} href={`/packaging-machines/international/${market.slug}`}>Packaging machines for {market.inSentence}</Link>)}</div>
          <div className={styles.reading}><h3>Useful planning guides</h3><Link href="/blog/packaging-machine-selection-cost-capacity-guide">Compare filling methods, capacity and cost</Link><Link href="/blog/custom-packaging-line-layout-conveyor-guide">Prepare a line layout and control handoffs</Link><Link href="/blog/packaging-machine-installation-acceptance-checklist">Define an installation acceptance trial</Link><Link href="/packaging-machines">Browse Indian states and city markets</Link></div>
        </div>
      </section>
      <GuideInquiryForm guideSlug="international" guideTitle="International packaging machine enquiry" source="export-guide" />
    </>
  );
}
