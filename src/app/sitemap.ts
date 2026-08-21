import { MetadataRoute } from 'next';
import { listBlogs, listProducts, listServices } from '@/lib/cms';
import { COMPANY_INFO, SEO_CITIES, SEO_CITY_MARKETS, groupProductsByCategory } from '@/lib/data';
import { INDIA_STATE_MARKETS } from '@/lib/india-markets';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = COMPANY_INFO.website;
  const [products, blogs, services] = await Promise.all([
    listProducts({ publishedOnly: true }),
    listBlogs({ publishedOnly: true }).catch(() => []),
    listServices({ publishedOnly: true }).catch(() => []),
  ]);
  const categories = groupProductsByCategory(products);
  const asValidDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  };
  const latestProductUpdate = products.reduce<Date | undefined>((latest, product) => {
    const updated = asValidDate(product.updatedAt || product.createdAt);
    return updated && (!latest || updated > latest) ? updated : latest;
  }, undefined);

  // Static pages
  const staticPages = [
    '', '/about', '/services', '/contact', '/clients', '/blog', '/schedule-meeting', '/packaging-machines', '/privacy-policy'
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  // Product pages
  const productPages = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: asValidDate(p.updatedAt || p.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const categoryPages = categories.map((group) => ({
    url: `${baseUrl}/products/category/${group.slug}`,
    lastModified: latestProductUpdate,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  const cityHubPages = SEO_CITY_MARKETS.map((city) => ({
    url: `${baseUrl}/packaging-machines/${city.slug}`,
    lastModified: latestProductUpdate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const stateHubPages = INDIA_STATE_MARKETS.map((state) => ({
    url: `${baseUrl}/packaging-machines/india/${state.slug}`,
    lastModified: latestProductUpdate,
    changeFrequency: 'monthly' as const,
    priority: 0.72,
  }));

  const servicePages = services.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: asValidDate(service.updatedAt || service.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.78,
  }));

  // Programmatic SEO pages (city × machine)
  const seoPages = SEO_CITIES.flatMap((city) =>
    products.map((p) => ({
      url: `${baseUrl}/${city}/${p.slug}`,
      lastModified: asValidDate(p.updatedAt || p.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  );

  const blogPages = blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: asValidDate(blog.updatedAt || blog.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...servicePages,
    ...stateHubPages,
    ...cityHubPages,
    ...categoryPages,
    ...productPages,
    ...blogPages,
    ...seoPages,
  ];
}
