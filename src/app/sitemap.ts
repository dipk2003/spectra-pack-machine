import { MetadataRoute } from 'next';
import { listProducts } from '@/lib/cms';
import { SEO_CITIES } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.spectrapackmachines.com';
  const products = await listProducts({ publishedOnly: true });

  // Static pages
  const staticPages = [
    '', '/about', '/services', '/contact', '/clients', '/blog', '/schedule-meeting'
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  // Product pages
  const productPages = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  // Programmatic SEO pages (city × machine)
  const seoPages = SEO_CITIES.flatMap((city) =>
    products.map((p) => ({
      url: `${baseUrl}/${city}/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  );

  return [...staticPages, ...productPages, ...seoPages];
}
