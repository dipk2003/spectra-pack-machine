import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, listProducts } from '@/lib/cms';
import { COMPANY_INFO } from '@/lib/data';
import { completePageMetadata } from '@/lib/seo';
import { MODEL_GUIDE_PROFILES, isModelGuideTopic, modelGuideHref, modelGuideMetadata } from '@/lib/model-guides';
import styles from './page.module.css';

type Props = { params: { slug: string; guide: string } };
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isModelGuideTopic(params.guide) || !MODEL_GUIDE_PROFILES[params.slug]) return {};
  const product = await getProductBySlug(params.slug, { publishedOnly: true });
  if (!product) return {};
  return completePageMetadata({
    ...modelGuideMetadata(product, params.guide),
    alternates: { canonical: modelGuideHref(product.slug, params.guide) },
    openGraph: { images: product.image ? [{ url: product.image, alt: product.imageAlt || product.title }] : [] },
  });
}

export default async function ModelGuidePage({ params }: Props) {
  if (!isModelGuideTopic(params.guide)) notFound();
  const profile = MODEL_GUIDE_PROFILES[params.slug];
  if (!profile) notFound();
  const [product, products] = await Promise.all([
    getProductBySlug(params.slug, { publishedOnly: true }), listProducts({ publishedOnly: true }),
  ]);
  if (!product) notFound();
  const buying = params.guide === 'buying-guide';
  const metadata = modelGuideMetadata(product, params.guide);
  const path = modelGuideHref(product.slug, params.guide);
  const url = COMPANY_INFO.website + path;
  const alternatives = products.filter(item => item.slug !== product.slug && MODEL_GUIDE_PROFILES[item.slug]?.family === profile.family);
  const quoteHref = '/contact?' + new URLSearchParams({ product: product.slug, machine: product.title, source: 'machine-' + params.guide, landing: path });
  const schema = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': url + '#webpage', url,
      name: metadata.title, description: metadata.description,
      about: { '@type': 'Product', '@id': `${COMPANY_INFO.website}/products/${product.slug}#product`, name: product.title, model: product.modelNo || undefined },
      publisher: { '@type': 'Organization', name: COMPANY_INFO.name, url: COMPANY_INFO.website },
    },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Machines', item: COMPANY_INFO.website + '/machines' },
      { '@type': 'ListItem', position: 2, name: product.title, item: `${COMPANY_INFO.website}/products/${product.slug}` },
      { '@type': 'ListItem', position: 3, name: buying ? 'Buying guide' : 'Trial checklist', item: url },
    ] },
  ];

  return <article className={styles.guide}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <header className="section"><div className="container">
      <nav aria-label="Breadcrumb"><Link href="/machines">Machines</Link> / <Link href={`/products/${product.slug}`}>{product.title}</Link> / {buying ? 'Buying guide' : 'Trial checklist'}</nav>
      <p className="section-label">{product.modelNo ? `Model ${product.modelNo}` : product.category}</p>
      <h1>{metadata.title}</h1>
      <p className={styles.intro}>{buying ? profile.focus : `Use this checklist when evaluating ${product.title}${product.modelNo ? ` (${product.modelNo})` : ''}. Agree the materials, operating configuration and acceptance criteria before the demonstration so results can be compared with your production requirement.`}</p>
      <nav aria-label="Model resources" className={styles.links}>
        <Link href={`/products/${product.slug}`}>Machine specifications</Link>
        <Link href={modelGuideHref(product.slug, buying ? 'trial-checklist' : 'buying-guide')}>{buying ? 'Sample trial checklist' : 'Buying and price guide'}</Link>
        <Link href={quoteHref}>Request {buying ? 'a quotation' : 'a sample trial'}</Link>
      </nav>
    </div></header>

    {buying ? <>
      <section className="section section-alt"><div className="container">
        <h2>Questions to answer before requesting a price</h2>
        <ol className={styles.steps}>{profile.questions.map(question => <li key={question}>{question}</li>)}</ol>
        <p>Send photographs or drawings alongside the answers. State which formats are required at launch and which are future possibilities; otherwise a quotation may include tooling you do not need, or omit a format that matters.</p>
        <h2>What should the {product.title} quotation include?</h2>
        <div className={styles.tableWrap}><table><thead><tr><th>Quotation item</th><th>What to confirm in writing</th></tr></thead><tbody>
          <tr><th>Machine configuration</th><td>Model {product.modelNo || product.title}, selected options, tooling and included controls; distinguish included equipment from alternatives.</td></tr>
          <tr><th>Performance basis</th><td>Your material and pack format, agreed accepted output and the trial conditions used to establish it.</td></tr>
          <tr><th>Installed cost</th><td>Machine price, taxes, freight, unloading, installation, training and optional interfaces as separate items.</td></tr>
          <tr><th>Handover and support</th><td>Documentation, spare and wear parts, warranty terms and the process for remote or site support.</td></tr>
        </tbody></table></div>
        <p>There is no fixed price published in this guide. The final amount and delivery schedule need a quotation for your selected configuration. A catalogue option, approximate range or maximum rating should not be treated as the confirmed specification of your order.</p>
      </div></section>
      {alternatives.length > 0 && <section className="section"><div className="container">
        <h2>Compare related machine configurations</h2>
        <p>These machines address related processes but are not interchangeable. Compare the selection issue below, then review the individual specifications and sample requirements.</p>
        <div className="seo-guide-grid">{alternatives.map(other => <article className="seo-guide-card" key={other.slug}>
          <h3><Link href={`/products/${other.slug}`}>{other.title}</Link></h3>
          <p>{MODEL_GUIDE_PROFILES[other.slug].focus}</p>
          <Link href={modelGuideHref(other.slug, 'buying-guide')}>Read this model’s buying guide</Link>
        </article>)}</div>
      </div></section>}
    </> : <>
      <section className="section section-alt"><div className="container">
        <h2>Prepare the sample set</h2>
        <p>Bring the real production material, packaging and representative difficult formats. Label samples with dimensions, weight and batch information. Include start-up, steady running and a planned format change in the test scope.</p>
        <h2>{product.title} trial sequence</h2>
        <ol className={styles.steps}>{profile.trial.map(step => <li key={step}>{step}</li>)}</ol>
        <p>Use the supplier’s operating procedure and keep guarding in its approved configuration. Settings and acceptance thresholds should be agreed for the material and machine being tested; this checklist does not replace the operating manual.</p>
        <h2>Record the result, not just the demonstration speed</h2>
        <div className={styles.tableWrap}><table><thead><tr><th>Record</th><th>What to capture</th></tr></thead><tbody>
          <tr><th>Sample and configuration</th><td>Product/material batch, format, machine model, tooling, recipe and operator count.</td></tr>
          <tr><th>Timed run</th><td>Total elapsed minutes, accepted units, rejected units and interruptions. Accepted output = good units ÷ elapsed minutes.</td></tr>
          <tr><th>Quality checks</th><td>The agreed measurement, sample results and photos of both acceptable and rejected output.</td></tr>
          <tr><th>Changeover</th><td>Previous and next format, adjustment time and units rejected before acceptable operation resumes.</td></tr>
          <tr><th>Open issues</th><td>Required corrections, responsibility, retest conditions and the agreed next review.</td></tr>
        </tbody></table></div>
        <p>A successful trial proves only the tested combination and conditions. If a different material, size or speed is proposed later, confirm whether another trial or tooling change is needed.</p>
      </div></section>
      <section className="section"><div className="container"><h2>Repeat acceptance after installation</h2>
        <p>Keep the approved samples, settings and results for handover. After delivery, check utilities and interfaces, then repeat the agreed performance checks with production materials at the customer site. Record differences rather than assuming the factory result transfers unchanged.</p>
        <p><Link href="/services/installation">Review installation and commissioning scope</Link></p>
      </div></section>
    </>}

    <section className="section"><div className="container">
      <h2>Buying {product.title} anywhere in India</h2>
      <p>Share your state, district, town and delivery PIN, together with unloading access and available utilities. Manufacturing and dispatch are coordinated from Vasai, Maharashtra. Freight, installation arrangements and service availability are confirmed for your order.</p>
      <div className={styles.links}><Link className="btn btn-primary" href={quoteHref}>{buying ? 'Request an itemised quotation' : 'Discuss a sample trial'}</Link><Link href="/locations">Select your state, district and town</Link></div>
      <p><Link href={`/products/${product.slug}`}>Return to {product.title} specifications and enquiry</Link></p>
    </div></section>
  </article>;
}
