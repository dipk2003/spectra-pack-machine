import { listPublicBlogs } from '@/lib/public-blogs';
import { blogRelationships } from '@/lib/content-links';
import { completePageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle, Factory, Headphones, Phone, Settings, Wrench } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { listProducts, listServices, type ServiceRecord } from '@/lib/cms';
import { COMPANY_INFO, PRODUCTS, SERVICES, groupProductsByCategory } from '@/lib/data';
import styles from './page.module.css';

type Props = { params: { slug: string } };

const serviceSteps: Record<string, string[]> = {
  manufacturing: ['Review the product and pack format', 'Confirm machine configuration and utilities', 'Fabricate, assemble and test the machine', 'Coordinate trial, dispatch and handover'],
  consultation: ['Capture product dimensions and samples', 'Review output and automation goals', 'Compare suitable machine formats', 'Share a practical recommendation and quotation path'],
  'custom-design': ['Document product and line constraints', 'Define required mechanical modifications', 'Review layout and operating sequence', 'Build and validate the agreed configuration'],
  installation: ['Confirm site-readiness requirements', 'Coordinate machine placement and setup', 'Support initial trial and adjustments', 'Hand over routine operating checks'],
  'after-sales': ['Record the machine and issue details', 'Diagnose with photos, video or a call', 'Plan service or spare requirements', 'Confirm resolution and next maintenance checks'],
};

const getService = async (slug: string): Promise<ServiceRecord | null> => {
  try {
    const services = await listServices({ publishedOnly: true });
    return services.find((service) => service.slug === slug) || null;
  } catch {
    const index = SERVICES.findIndex((service) => service.slug === slug);
    if (index < 0) return null;
    const service = SERVICES[index];
    return {
      id: service.slug,
      ...service,
      categoryId: '',
      published: true,
      sortOrder: index,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    };
  }
};

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService(params.slug);
  if (!service) return {};

  const canonical = `/services/${service.slug}`;
  return completePageMetadata({
    title: `${service.title} for Packaging Machines`,
    description: `${service.description} Get application-based support from Spectra Pack Machines across India.`,
    keywords: [service.title, `${service.title} India`, 'packaging machine services', 'packaging machine manufacturer support'],
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${service.title} | Spectra Pack Machines`,
      description: service.description,
      url: canonical,
      type: 'website',
      locale: 'en_IN',
      siteName: COMPANY_INFO.name,
      images: [{ url: COMPANY_INFO.logoPath, width: 1632, height: 607, alt: COMPANY_INFO.name }],
    },
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const [service, resolvedProducts, blogs] = await Promise.all([
    getService(params.slug),
    listProducts({ publishedOnly: true }).catch(() => PRODUCTS),
    listPublicBlogs(),
  ]);
  if (!service) notFound();

  const products = resolvedProducts.length ? resolvedProducts : PRODUCTS;
  const categories = groupProductsByCategory(products);
  const relevantBlogs = blogs.filter(blog => blogRelationships(blog).serviceSlugs.includes(service.slug)).slice(0, 6);
  const steps = serviceSteps[service.slug] || [
    'Share your packaging requirement',
    'Review the application with our team',
    'Confirm scope and commercial details',
    'Coordinate delivery and support',
  ];
  const serviceUrl = `${COMPANY_INFO.website}/services/${service.slug}`;
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${serviceUrl}#service`,
      name: service.title,
      description: service.description,
      url: serviceUrl,
      serviceType: service.title,
      areaServed: { '@type': 'Country', name: 'India' },
      provider: {
        '@type': 'Organization',
        name: COMPANY_INFO.name,
        url: COMPANY_INFO.website,
        telephone: COMPANY_INFO.phone[0],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: COMPANY_INFO.website },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${COMPANY_INFO.website}/services` },
        { '@type': 'ListItem', position: 3, name: service.title, item: serviceUrl },
      ],
    },
  ];
  const phone = COMPANY_INFO.phone[0].replace(/\s+/g, '');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className={styles.hero}>
        <div className="container">
          <AnimatedSection>
            <div className={styles.breadcrumb}><Link href="/">Home</Link><span>/</span><Link href="/services">Services</Link><span>/</span><span>{service.title}</span></div>
            <span className="section-label">Packaging Machine Service</span>
            <h1>{service.title}</h1>
            <p>{service.description}</p>
            <div className={styles.actions}>
              <Link href={`/contact?${new URLSearchParams({ service: service.slug, source: 'service-page' }).toString()}`} className="btn btn-accent btn-lg">Discuss Your Requirement <ArrowRight size={17} /></Link>
              <a href={`tel:${phone}`} className="btn btn-white btn-lg"><Phone size={17} /> {COMPANY_INFO.phone[0]}</a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.overviewGrid}>
            <AnimatedSection direction="left">
              <span className="section-label">What This Service Covers</span>
              <h2>Practical Support Around Your Packaging Application</h2>
              <p>{service.content}</p>
              <p>
                Scope, travel, trials and commercial terms depend on the machine, customer location and application.
                Share your product details early so the team can define the right next step without unnecessary delays.
              </p>
            </AnimatedSection>
            <AnimatedSection direction="right" className={styles.factCard}>
              <Factory size={28} />
              <h3>Factory-backed coordination</h3>
              <p>Direct access to a team that understands the machine build, application and service history.</p>
              <div><Settings size={18} /><span>Application-based configuration</span></div>
              <div><Wrench size={18} /><span>Technical installation and service support</span></div>
              <div><Headphones size={18} /><span>Pan-India enquiry coordination</span></div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <AnimatedSection className={styles.sectionHeader}>
            <span className="section-label">How It Works</span>
            <h2>A Clear Four-Step Process</h2>
          </AnimatedSection>
          <div className={styles.steps}>
            {steps.map((step, index) => (
              <AnimatedSection key={step} delay={index * 0.06} className={styles.step}>
                <span>{index + 1}</span><CheckCircle size={20} /><p>{step}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AnimatedSection className={styles.sectionHeader}>
            <span className="section-label">Supported Machine Families</span>
            <h2>Explore the Spectra Pack Range</h2>
            <p>Choose a category to review machine models, then share the product and output details relevant to this service.</p>
          </AnimatedSection>
          <div className={styles.categoryGrid}>
            {categories.map((category) => (
              <Link key={category.slug} href={`/products/category/${category.slug}`} className={styles.categoryCard}>
                <strong>{category.category}</strong>
                <span>{category.items.length} machine options</span>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt"><div className="container">
        <h2>Machines supported by {service.title}</h2>
        <div className="seo-guide-grid">{products.map(product => <Link key={product.slug} href={'/products/' + product.slug} className="seo-guide-card"><h3>{product.title}</h3><span>Review specifications and application</span></Link>)}</div>
        {relevantBlogs.length > 0 && <><h2>Guides for {service.title}</h2><div className="seo-guide-grid">{relevantBlogs.map(blog => <Link key={blog.slug} href={'/blog/' + blog.slug} className="seo-guide-card"><h3>{blog.title}</h3><p>{blog.excerpt}</p></Link>)}</div></>}
        <p><Link href="/packaging-machines">Machine supply and service enquiries across India</Link></p>
      </div></section>
      <section className={styles.cta}>
        <div className="container">
          <AnimatedSection>
            <h2>Need {service.title}?</h2>
            <p>Share your machine, product, location and expected timeline. Our team will confirm the most useful next step.</p>
            <Link href="/contact" className="btn btn-primary btn-lg">Contact Spectra Pack <ArrowRight size={17} /></Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
