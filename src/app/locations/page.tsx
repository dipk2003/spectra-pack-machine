import Link from 'next/link';
import { listProducts } from '@/lib/cms';
import { COMPANY_INFO } from '@/lib/data';
import { INDIA_DISTRICT_DIRECTORY } from '@/lib/india-districts';
import { completePageMetadata } from '@/lib/seo';
import AllIndiaPlanner from '@/components/locations/AllIndiaPlanner';

export const dynamic = 'force-dynamic';
export const metadata = completePageMetadata({
  title: 'Packaging Machine Enquiries Across India: States, Districts & Towns',
  description: 'Select your state and district, enter any town and PIN, and plan a packaging machine quotation, delivery or installation enquiry with Spectra Pack Machines.',
  keywords: ['packaging machine supplier India', 'packing machine delivery India', 'packaging machine quotation', 'machine installation enquiry India'],
  alternates: { canonical: '/locations' },
});

export default async function LocationsPage() {
  const machines = await listProducts({ publishedOnly: true });
  const count = INDIA_DISTRICT_DIRECTORY.reduce((sum, state) => sum + state.districts.length, 0);
  const schema = { '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: 'All India Machine Enquiry Directory', url: COMPANY_INFO.website + '/locations',
    mainEntity: { '@type': 'ItemList', itemListElement: INDIA_DISTRICT_DIRECTORY.map((state, index) => ({
      '@type': 'ListItem', position: index + 1, name: state.name,
      url: COMPANY_INFO.website + '/packaging-machines/india/' + state.slug,
    })) },
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <section className="section"><div className="container">
      <p><Link href="/">Home</Link> / All India enquiries</p>
      <h1>Packaging machine enquiries for every state, district and town</h1>
      <p>Browse {INDIA_DISTRICT_DIRECTORY.length} states and union territories and {count} districts in our directory. Enter any town or village for a location-specific enquiry. Spectra Pack Machines manufactures and coordinates dispatch from Vasai, Maharashtra.</p>
      <AllIndiaPlanner regions={INDIA_DISTRICT_DIRECTORY.map(({ slug, name, districts }) => ({ slug, name, districts }))} machines={machines.map(({ slug, title }) => ({ slug, title }))} />
      <p><Link href="/machines">Compare all machine models and buying guides</Link> · <Link href="/packaging-machines">Explore regional machine supply information</Link></p>
    </div></section>
    <section className="section section-alt"><div className="container">
      <h2>Browse state and district enquiry pages</h2>
      <p>Open your state to find district planners. District names can change; if your district is missing, <Link href="/contact">send the current town and PIN directly</Link>.</p>
      <div className="seo-guide-grid">{INDIA_DISTRICT_DIRECTORY.map(state => <details className="seo-guide-card" key={state.slug}>
        <summary>{state.name} — {state.districts.length} districts</summary>
        <p><Link href={'/packaging-machines/india/' + state.slug}>Machine supply and selection in {state.name}</Link></p>
        <ul>{state.districts.map(district => <li key={district.slug}><Link href={`/packaging-machines/india/${state.slug}/${district.slug}`}>{district.name}</Link></li>)}</ul>
      </details>)}</div>
    </div></section>
  </>;
}
