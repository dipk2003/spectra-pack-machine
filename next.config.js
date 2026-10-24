const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';

const siteAssetHostname = 'brtzazvawofpdyzahhda.supabase.co';
const remotePatterns = [
  {
    protocol: 'https',
    hostname: siteAssetHostname,
  },
];
let supabaseOrigin = '';

try {
  const parsedSupabaseUrl = new URL(supabaseUrl);
  if (parsedSupabaseUrl.hostname !== siteAssetHostname) {
    remotePatterns.push({
      protocol: 'https',
      hostname: parsedSupabaseUrl.hostname,
    });
  }
  supabaseOrigin = parsedSupabaseUrl.origin;
} catch {
  // Ignore invalid or missing Supabase URLs in local setups.
}

const scriptSources = [
  'https://connect.facebook.net',
  "'self'",
  "'unsafe-inline'",
  ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []),
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://www.googleadservices.com',
  // Google Ads loads conversion scripts from these documented endpoints.
  'https://www.google.com',
  'https://googleads.g.doubleclick.net',
  'https://pagead2.googlesyndication.com',
  'https://bat.bing.net',
  'https://bat.bing.com',
  'https://challenges.cloudflare.com',
];
const connectSources = [
  'https://www.facebook.com',
  'https://connect.facebook.net',
  "'self'",
  supabaseOrigin,
  'https://www.google-analytics.com',
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
  'https://analytics.google.com',
  'https://*.googletagmanager.com',
  'https://www.googleadservices.com',
  'https://googleads.g.doubleclick.net',
  'https://ad.doubleclick.net',
  // GA4 advertising measurement endpoint observed in Tag Assistant.
  'https://stats.g.doubleclick.net',
  'https://www.google.com',
  'https://google.com',
  'https://www.google.co.in',
  'https://pagead2.googlesyndication.com',
  'https://bat.bing.net',
  'https://bat.bing.com',
  'https://challenges.cloudflare.com',
].filter(Boolean);
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSources.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src ${connectSources.join(' ')}`,
  "frame-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    remotePatterns,
    minimumCacheTTL: 86400,
  },
  webpack: (config, { dev }) => {
    // OneDrive-backed workspaces on Windows can corrupt webpack's filesystem cache.
    if (dev) {
      config.cache = false;
    }

    return config;
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.spectrapackmachines.com' }],
        destination: 'https://spectrapackmachines.com/:path*',
        permanent: true,
      },
      {
        source: '/web-sealer-with-shrink-tunnel',
        destination: '/products/category/shrink-wrapping-machines',
        permanent: true,
      },
      {
        source: '/product-page/band-sealer-machines',
        destination: '/products/band-sealer-machine',
        permanent: true,
      },
      // Legacy Wix URLs that are still indexed by search engines and
      // currently 404 after the www -> apex redirect.
      { source: '/about-1', destination: '/about', permanent: true },
      { source: '/services-1', destination: '/services', permanent: true },
      { source: '/search', destination: '/machines', permanent: true },
      { source: '/contact-1', destination: '/contact', permanent: true },
      { source: '/blank', destination: '/', permanent: true },
      {
        // No Mobile Sealer product page exists yet; send it to its family.
        // Remove this rule once a /products/mobile-sealer-machine page is published.
        source: '/product-page/mobile-sealer-machine',
        destination: '/products/category/foot-sealing-machines',
        permanent: false,
      },
      // Machines unpublished from the catalog (404 in Search Console, Oct 2026).
      // Temporary so they can be dropped if these models are republished.
      { source: '/products/chamber-shrink-tunnel', destination: '/products/category/heavy-duty-shrink-tunnel-machines', permanent: false },
      { source: '/products/l-sealer-with-shrink-tunnel-machine-indian', destination: '/products/l-sealer-with-shrink-tunnel-machine', permanent: false },
      { source: '/products/fully-automatic-l-sealer-with-shrink-tunnel-machine', destination: '/products/l-sealer-with-shrink-tunnel-machine', permanent: false },
      { source: '/products/semi-automatic-web-sealer-with-shrink-tunnel-box', destination: '/products/semi-automatic-web-sealer-with-shrink-tunnel', permanent: false },
      { source: '/products/category/shrink-tunnel-machine', destination: '/products/category/heavy-duty-shrink-tunnel-machines', permanent: true },
      { source: '/:city/chamber-shrink-tunnel', destination: '/:city/shrink-tunnel-machine', permanent: false },
      { source: '/:city/l-sealer-with-shrink-tunnel-machine-indian', destination: '/:city/l-sealer-with-shrink-tunnel-machine', permanent: false },
      { source: '/:city/fully-automatic-l-sealer-with-shrink-tunnel-machine', destination: '/:city/l-sealer-with-shrink-tunnel-machine', permanent: false },
      { source: '/:city/semi-automatic-web-sealer-with-shrink-tunnel-box', destination: '/:city/semi-automatic-web-sealer-with-shrink-tunnel', permanent: false },
      {
        // Catch-all for remaining Wix product URLs. The product route already
        // resolves legacy slugs through LEGACY_PRODUCT_SLUGS.
        source: '/product-page/:slug',
        destination: '/products/:slug',
        permanent: true,
      },
      {
        source: '/products/double-door-chamber-vaccum-machine-with-conveyor',
        destination:
          '/products/double-door-chamber-vacuum-machine-with-conveyor',
        permanent: true,
      },
      {
        source: '/:city/double-door-chamber-vaccum-machine-with-conveyor',
        destination: '/:city/double-door-chamber-vacuum-machine-with-conveyor',
        permanent: true,
      },
      {
        source:
          '/products/pneumatic-vertical-sealing-machine-flame-proof-the-pneumatic-vertical-sea',
        destination: '/products/pneumatic-vertical-sealing-machine-flame-proof',
        permanent: true,
      },
      {
        source:
          '/:city/pneumatic-vertical-sealing-machine-flame-proof-the-pneumatic-vertical-sea',
        destination: '/:city/pneumatic-vertical-sealing-machine-flame-proof',
        permanent: true,
      },
      {
        source: '/products/category/double-door-chamber-vaccum-packing-machine',
        destination: '/products/category/vacuum-packaging-machines',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
