import { MetadataRoute } from 'next';
import { listBlogs, listProducts } from '@/lib/cms';
import { SEO_CITIES, SEO_CITY_MARKETS, groupProductsByCategory } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.spectrapackmachines.com';
  const [products, blogs] = await Promise.all([
    listProducts({ publishedOnly: true }),
    listBlogs({ publishedOnly: true }).catch(() => []),
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
    '', '/about', '/services', '/contact', '/clients', '/blog', '/schedule-meeting', '/packaging-machines'
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
    ...cityHubPages,
    ...categoryPages,
    ...productPages,
    ...blogPages,
    ...seoPages,
  ];
}
