import assert from 'node:assert/strict';
import { MACHINE_GUIDE_INPUTS } from '../src/lib/machine-guides';
import { COMPANY_INFO } from '../src/lib/data';

async function main() {
  const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
  const xml = await (await fetch(`${base}/sitemap.xml`)).text();
  const urls = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), match => match[1]);
  assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URLs');
  for (const guide of MACHINE_GUIDE_INPUTS) {
    assert.ok(urls.includes(`${COMPANY_INFO.website}/blog/${guide.slug}`), `Missing article: ${guide.slug}`);
  }
  assert.ok(!urls.some(url => /\/packaging-machines\/india\/[^/]+\/[^/]+/.test(url)), 'Consolidated district routes must not be in sitemap');
  // Every main, product, category, blog, service, state and city hub, plus a
  // representative machine-location route; avoid crawling the full Cartesian set.
  const primary = urls.filter(url => {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    return parts.length < 2 || ['products', 'blog', 'services', 'packaging-machines'].includes(parts[0]);
  });
  const machineLocation = urls.find(url => new URL(url).pathname.startsWith('/mumbai/'));
  if (machineLocation) primary.push(machineLocation);
  const results: { path: string; title: string }[] = [];
  let cursor = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < primary.length) {
      const url = primary[cursor++];
      const route = new URL(url).pathname;
      const response = await fetch(base + route, { signal: AbortSignal.timeout(30000) });
      assert.equal(response.status, 200, `${route} HTTP status`);
      const html = await response.text();
      const title = html.match(/<title>(.*?)<\/title>/)?.[1];
      assert.ok(title, `${route}: missing title`);
      assert.equal((html.match(/<link rel="canonical"/g) || []).length, 1, `${route}: ambiguous canonical`);
      assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1], url, `${route}: canonical`);
      for (const name of ['description', 'keywords', 'robots', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
        assert.ok(new RegExp(`<meta name="${name}" content="[^"]+"`).test(html), `${route}: missing ${name}`);
      }
      for (const name of ['og:title', 'og:description', 'og:url', 'og:image']) {
        assert.ok(new RegExp(`<meta property="${name}" content="[^"]+"`).test(html), `${route}: missing ${name}`);
      }
      if (route.startsWith('/blog/')) assert.ok(html.includes('"@type":"BlogPosting"'), `${route}: missing article schema`);
      results.push({ path: route, title });
    }
  }));
  for (const route of ['/blog/not-a-real-guide-9999', '/packaging-machines/india/maharashtra/not-a-real-district-9999']) {
    const response = await fetch(base + route);
    const html = await response.text();
    assert.ok(response.status === 404 || /<meta name="robots" content="[^"]*noindex/.test(html), `${route}: soft 404 must not be indexable`);
  }
  const duplicates = results.filter(item => results.some(other => other.path !== item.path && other.title === item.title));
  assert.deepEqual(duplicates, [], 'Public pages have duplicate titles');
  console.log(JSON.stringify({ sitemapUrls: urls.length, renderedPagesChecked: results.length, newArticlesInSitemap: MACHINE_GUIDE_INPUTS.length, metadata: 'passed', uniqueTitles: 'passed', invalidRoutes: 'passed' }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
