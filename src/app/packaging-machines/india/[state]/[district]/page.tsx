import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findDistrictState } from '@/lib/india-districts';
import { listProducts, listServices } from '@/lib/cms';
import { COMPANY_INFO } from '@/lib/data';
import { completePageMetadata } from '@/lib/seo';
import LocationPlanner from '@/components/locations/LocationPlanner';
import styles from '../../../locations.module.css';

type Props = { params: { state: string; district: string } };
export const dynamic = 'force-dynamic';
function getLocation(params: Props['params']) {
  const state = findDistrictState(params.state);
  const district = state?.districts.find(item => item.slug === params.district);
  return state && district ? { state, district } : null;
}
export function generateMetadata({ params }: Props): Metadata {
  const location = getLocation(params);
  if (!location) return {};
  const { state, district } = location;
  // District routes are localized views of the state's supply/service planner.
  // Consolidate substantially shared content into its indexable state hub.
  return completePageMetadata({
    title: 'Packaging Machines & Service Enquiry in ' + district.name,
    description: 'Compare packaging machines and plan dispatch, installation or service for ' + district.name + ', ' + state.name + '. Share your town and PIN code.',
    keywords: ['packaging machines '+district.name, 'packing machine supplier '+district.name, 'packaging machine service '+state.name],
    alternates: { canonical: '/packaging-machines/india/' + state.slug },
  });
}
export default async function DistrictPlannerPage({ params }: Props) {
  const location = getLocation(params);
  if (!location) notFound();
  const { state, district } = location;
  const [machines, services] = await Promise.all([listProducts({ publishedOnly: true }), listServices({ publishedOnly: true })]);
  const landing = '/packaging-machines/india/' + state.slug + '/' + district.slug;
  const schema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: COMPANY_INFO.website },
    { '@type': 'ListItem', position: 2, name: 'India', item: COMPANY_INFO.website+'/packaging-machines' },
    { '@type': 'ListItem', position: 3, name: state.name, item: COMPANY_INFO.website+'/packaging-machines/india/'+state.slug },
    { '@type': 'ListItem', position: 4, name: district.name, item: COMPANY_INFO.website+landing },
  ] };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\u003c') }} />
    <section className={styles.hero}><div className="container"><div className={styles.breadcrumb}><Link href="/packaging-machines">India</Link><span>/</span><Link href={'/packaging-machines/india/'+state.slug}>{state.name}</Link><span>/</span><span>{district.name}</span></div>
      <h1>Packaging machines and service planning for {district.name}</h1>
      <p className={styles.heroDescription}>Compare equipment for your application and prepare an enquiry for {district.name} district, {state.name}. Manufacturing and dispatch are coordinated from Spectra Pack Machines in Vasai, Maharashtra.</p>
    </div></section>
    <section className="section"><div className="container"><LocationPlanner state={state.name} district={district.name} machines={machines.map(item => ({ slug: item.slug, title: item.title, shortDesc: item.shortDesc }))} services={services.map(item => ({ slug: item.slug, title: item.title }))} landingPage={landing} /></div></section>
    <section className="section section-alt"><div className="container"><h2>Prepare for delivery and installation</h2><div className="seo-guide-grid">
      <article className="seo-guide-card"><h3>Machine and package</h3><p>Provide product samples, pack dimensions, filled weight and required good packs per hour. Review suitability for your actual application before comparing offers.</p><Link href="/services/consultation">Machine selection consultation</Link></article>
      <article className="seo-guide-card"><h3>Site and unloading</h3><p>Share the exact town and PIN code in {district.name}, vehicle access, unloading equipment and the route to the installation floor. Freight depends on the confirmed shipment and destination.</p><Link href="/services/installation">Installation scope</Link></article>
      <article className="seo-guide-card"><h3>Service and spare parts</h3><p>For an existing machine, include its model, serial number and fault description. The team confirms remote assistance, parts or a site visit after reviewing your requirement.</p><Link href="/services/after-sales">After-sales support</Link></article>
    </div><p><Link href={'/packaging-machines/india/'+state.slug}>Browse all districts and markets in {state.name}</Link> · <Link href="/blog">Read machine buying and operating guides</Link></p></div></section>
  </>;
}
