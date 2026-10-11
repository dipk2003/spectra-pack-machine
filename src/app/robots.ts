import { MetadataRoute } from 'next';
import { COMPANY_INFO } from '@/lib/data';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      // Explicit search-agent names document discoverability intent. Keep the
      // same private-route restrictions for every agent in this group.
      userAgent: ['*', 'Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Claude-SearchBot', 'Claude-User'],
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${COMPANY_INFO.website}/sitemap.xml`,
    host: COMPANY_INFO.website,
  };
}
