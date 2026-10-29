import { DISTRICT_DIRECTORY_DATE } from '@/lib/india-districts';
import { MetadataRoute } from 'next';
import { listProducts, listServices } from '@/lib/cms';
import { listPublicBlogs } from '@/lib/public-blogs';
import { parseBlogTemplateContent } from '@/lib/blog-template';
import { COMPANY_INFO, SEO_CITY_MARKETS, groupProductsByCategory } from '@/lib/data';
import { INDIA_STATE_MARKETS } from '@/lib/india-markets';
import { EXPORT_MARKETS } from '@/lib/export-markets';
import { MODEL_GUIDE_PROFILES, MODEL_GUIDE_TOPICS, modelGuideHref } from '@/lib/model-guides';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = COMPANY_INFO.website;
  const [products, blogs, services] = await Promise.all([
    listProducts({ publishedOnly: true }),
    listPublicBlogs(),
    listServices({ publishedOnly: true }).catch(() => []),
  ]);
  const categories = groupProductsByCategory(products);
  const imageUrls = (paths: string[]) => Array.from(new Set(paths.filter(Boolean).map((path) => {
    try {
      const image = new URL(path, baseUrl);
      return ['http:', 'https:'].includes(image.protocol) ? image.href : '';
    } catch { return ''; }
  }).filter(Boolean)));
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
    '', '/about', '/services', '/contact', '/clients', '/blog', '/machines', '/locations', '/schedule-meeting', '/packaging-machines', '/packaging-machines/international', '/privacy-policy'
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: path === '/blog' ? blogs.reduce<Date | undefined>((latest, blog) => { const updated = asValidDate(blog.updatedAt || blog.createdAt); return updated && (!latest || updated > latest) ? updated : latest; }, undefined) : undefined,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  // Product pages
  const productPages = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: asValidDate(p.updatedAt || p.createdAt),
    images: imageUrls([p.image, ...(p.gallery || [])]),
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

  // District planners canonicalize to these state hubs and intentionally stay
  // out of the sitemap, which lists only preferred canonical URLs.
  const directoryUpdated = new Date(DISTRICT_DIRECTORY_DATE + 'T00:00:00.000Z');
  const stateHubPages = INDIA_STATE_MARKETS.map((state) => ({
    url: `${baseUrl}/packaging-machines/india/${state.slug}`,
    lastModified: latestProductUpdate && latestProductUpdate > directoryUpdated ? latestProductUpdate : directoryUpdated,
    changeFrequency: 'monthly' as const,
    priority: 0.72,
  }));

  const exportMarketPages = EXPORT_MARKETS.map((market) => ({
    url: `${baseUrl}/packaging-machines/international/${market.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const servicePages = services.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: asValidDate(service.updatedAt || service.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.78,
  }));

  const blogPages = blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: asValidDate(blog.updatedAt || blog.createdAt),
    images: imageUrls([blog.image, parseBlogTemplateContent(blog.content).leftImage, parseBlogTemplateContent(blog.content).rightImage]),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const entries = [
    ...staticPages,
    ...servicePages,
    ...exportMarketPages,
    ...stateHubPages,
    ...cityHubPages,
    ...categoryPages,
    ...productPages,
    ...products.filter(product => MODEL_GUIDE_PROFILES[product.slug]).flatMap(product => MODEL_GUIDE_TOPICS.map(topic => ({
      url: baseUrl + modelGuideHref(product.slug, topic),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    }))),
    ...blogPages,
    // City x machine pages are noindex; keep them out of the sitemap.
  ];
  return Array.from(new Map(entries.map((entry) => [entry.url, entry])).values());
}
