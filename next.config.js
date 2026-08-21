const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';

const remotePatterns = [];
let supabaseOrigin = '';

try {
  const parsedSupabaseUrl = new URL(supabaseUrl);
  remotePatterns.push({
    protocol: 'https',
    hostname: parsedSupabaseUrl.hostname,
  });
  supabaseOrigin = parsedSupabaseUrl.origin;
} catch {
  // Ignore invalid or missing Supabase URLs in local setups.
}

const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []),
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://www.googleadservices.com',
  'https://challenges.cloudflare.com',
];
const connectSources = [
  "'self'",
  supabaseOrigin,
  'https://www.google-analytics.com',
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
  'https://*.googletagmanager.com',
  'https://www.googleadservices.com',
  'https://googleads.g.doubleclick.net',
  'https://challenges.cloudflare.com',
].filter(Boolean);
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSources.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src ${connectSources.join(' ')}`,
  "frame-src 'self' https://challenges.cloudflare.com",
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
      { source: '/web-sealer-with-shrink-tunnel', destination: '/products/category/shrink-wrapping-machines', permanent: true },
      { source: '/product-page/band-sealer-machines', destination: '/products/band-sealer-machine', permanent: true },
      { source: '/products/double-door-chamber-vaccum-machine-with-conveyor', destination: '/products/double-door-chamber-vacuum-machine-with-conveyor', permanent: true },
      { source: '/:city/double-door-chamber-vaccum-machine-with-conveyor', destination: '/:city/double-door-chamber-vacuum-machine-with-conveyor', permanent: true },
      { source: '/products/pneumatic-vertical-sealing-machine-flame-proof-the-pneumatic-vertical-sea', destination: '/products/pneumatic-vertical-sealing-machine-flame-proof', permanent: true },
      { source: '/:city/pneumatic-vertical-sealing-machine-flame-proof-the-pneumatic-vertical-sea', destination: '/:city/pneumatic-vertical-sealing-machine-flame-proof', permanent: true },
      { source: '/products/category/double-door-chamber-vaccum-packing-machine', destination: '/products/category/vacuum-packaging-machines', permanent: true },
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
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
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
