import { MetadataRoute } from 'next';
import { COMPANY_INFO } from '@/lib/data';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${COMPANY_INFO.website}/sitemap.xml`,
    host: COMPANY_INFO.website,
  };
}
