import http from 'node:http';
import https from 'node:https';

const baseUrl = String(process.argv[2] || 'http://localhost:3000').replace(/\/+$/, '');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const fetchText = async (path, init) => {
  const response = await fetch(`${baseUrl}${path}`, init);
  return { response, text: await response.text() };
};

const extract = (html, expression) => html.match(expression)?.[1] || '';

const requestWithHost = (path, host) => {
  const target = new URL(baseUrl);
  const client = target.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const request = client.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || undefined,
        path,
        method: 'HEAD',
        headers: { host },
      },
      (response) => {
        response.resume();
        resolve({ status: response.statusCode || 0, headers: response.headers });
      },
    );
    request.on('error', reject);
    request.end();
  });
};

async function main() {
  const assets = [];
  for (const path of [
    '/favicon.ico',
    '/favicon.png',
    '/manifest.webmanifest',
    '/robots.txt',
    '/sitemap.xml',
  ]) {
    const response = await fetch(`${baseUrl}${path}`);
    const body = await response.arrayBuffer();
    assert(response.ok, `${path} returned ${response.status}`);
    assert(body.byteLength > 0, `${path} returned an empty body`);
    assets.push({
      path,
      status: response.status,
      type: response.headers.get('content-type'),
      bytes: body.byteLength,
    });
  }

  const { text: sitemapXml } = await fetchText('/sitemap.xml');
  const urls = Array.from(sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g), (match) => match[1]);
  const sitemap = {
    urls: urls.length,
    services: urls.filter((url) => url.includes('/services/')).length,
    statesAndUnionTerritories: urls.filter((url) =>
      url.includes('/packaging-machines/india/'),
    ).length,
  };
  assert(sitemap.services >= 5, 'Sitemap is missing service detail URLs');
  assert(
    sitemap.statesAndUnionTerritories === 36,
    'Sitemap must include all 28 states and 8 union territories',
  );
  assert(
    urls.includes(
      'https://spectrapackmachines.com/products/double-door-chamber-vacuum-machine-with-conveyor',
    ),
    'Sitemap is missing the canonical vacuum-machine URL',
  );
  assert(!urls.some((url) => url.includes('vaccum')), 'Sitemap contains a legacy vaccum URL');
  assert(
    !urls.some((url) => url.includes('the-pneumatic-vertical-sea')),
    'Sitemap contains a truncated legacy product URL',
  );

  const pages = [];
  for (const page of [
    { path: '/', canonical: 'https://spectrapackmachines.com', schema: 'Organization' },
    {
      path: '/packaging-machines/india/maharashtra',
      canonical: 'https://spectrapackmachines.com/packaging-machines/india/maharashtra',
      schema: 'CollectionPage',
    },
    {
      path: '/services/after-sales',
      canonical: 'https://spectrapackmachines.com/services/after-sales',
      schema: 'Service',
    },
  ]) {
    const { response, text } = await fetchText(page.path);
    const title = extract(text, /<title>(.*?)<\/title>/i);
    const canonical = extract(text, /<link rel="canonical" href="([^"]+)"/i);
    assert(response.ok, `${page.path} returned ${response.status}`);
    assert(title, `${page.path} has no title`);
    if (page.path === '/') {
      assert(title.includes('Spectra Pack Machines'), 'Homepage title is missing the brand');
      assert(text.includes('/favicon.ico'), 'Homepage metadata is missing favicon.ico');
      assert(text.includes('/favicon.png'), 'Homepage metadata is missing favicon.png');
      const headings = Array.from(text.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi), match => match[1]);
      assert(headings.length === 1, 'Homepage must have one stable H1');
      assert(headings[0].includes('Packaging Machine Manufacturer in India'), 'Homepage H1 does not describe the main business');
      assert(response.headers.get('content-security-policy')?.includes('https://connect.facebook.net'), 'Meta Pixel script is blocked by CSP');
      const connectSources = response.headers.get('content-security-policy')
        ?.split(';').find(directive => directive.trim().startsWith('connect-src '))
        ?.trim().split(/\s+/).slice(1) || [];
      assert(connectSources.includes('https://stats.g.doubleclick.net'), 'GA4 advertising measurement is blocked by connect-src');
    }
    assert(canonical === page.canonical, `${page.path} has an unexpected canonical URL`);
    assert(
      text.includes(`\"@type\":\"${page.schema}\"`),
      `${page.path} is missing ${page.schema} structured data`,
    );
    pages.push({ path: page.path, status: response.status, title, canonical });
  }

  const legacy = await fetch(
    `${baseUrl}/products/double-door-chamber-vaccum-machine-with-conveyor`,
    { redirect: 'manual' },
  );
  assert([301, 308].includes(legacy.status), 'Legacy product URL is not permanently redirected');
  assert(
    legacy.headers.get('location')?.endsWith(
      '/products/double-door-chamber-vacuum-machine-with-conveyor',
    ),
    'Legacy product redirect has an unexpected destination',
  );

  const admin = await fetch(`${baseUrl}/admin`, { redirect: 'manual' });
  assert([302, 307].includes(admin.status), 'Unauthenticated admin request was not redirected');
  assert(
    admin.headers.get('x-robots-tag')?.includes('noindex'),
    'Admin response is missing its noindex header',
  );
  assert(
    admin.headers.get('cache-control')?.includes('no-store'),
    'Admin response is missing private no-store caching',
  );

  const www = await requestWithHost('/about', 'www.spectrapackmachines.com');
  assert(
    www.status === 308,
    `The www hostname does not use a permanent redirect (${www.status}, ${www.headers.location || 'no location'})`,
  );
  assert(
    www.headers.location === 'https://spectrapackmachines.com/about',
    'The www redirect does not point to the canonical apex hostname',
  );

  console.log(JSON.stringify({ baseUrl, assets, sitemap, pages, legacyRedirect: legacy.status, adminGuard: admin.status, wwwRedirect: www.status }, null, 2));
}

main().catch((error) => {
  console.error(`SEO smoke test failed: ${error.message}`);
  process.exitCode = 1;
});
