import assert from 'node:assert/strict';
const base = (process.argv[2] || 'http://127.0.0.1:3100').replace(/\/$/, '');
async function page(path) {
  const response = await fetch(base + path, { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200, path);
  return response.text();
}
const xml = await page('/sitemap.xml');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]));
const products = urls.filter(url => /^\/products\/[^/]+$/.test(url.pathname));
const guides = urls.filter(url => /^\/products\/[^/]+\/(buying-guide|trial-checklist)$/.test(url.pathname));
assert.equal(guides.length, products.length * 2);
const directory = await page('/machines');
const titles = [];
let cursor = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < guides.length) {
    const url = guides[cursor++];
    const html = await page(url.pathname);
    assert.ok(directory.includes(`href="${url.pathname}"`), url.pathname);
    assert.ok(html.includes(`rel="canonical" href="${url.href}"`), url.pathname);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, url.pathname);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title); titles.push(title);
    for (const name of ['description', 'keywords', 'robots', 'twitter:card']) assert.match(html, new RegExp(`<meta name="${name}" content="[^"]+"`));
    assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(html));
    assert.ok(html.includes('"@type":"BreadcrumbList"'));
    for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(json);
  }
}));
assert.equal(new Set(titles).size, guides.length, 'Duplicate guide titles');
for (const product of products) {
  const html = await page(product.pathname);
  for (const topic of ['buying-guide', 'trial-checklist']) assert.ok(html.includes(`href="${product.pathname}/${topic}"`));
}
const locations = await page('/locations');
assert.ok(locations.includes('/packaging-machines/india/maharashtra/palghar'));
assert.ok(locations.includes('name="town"'));
const plan = await fetch(base + '/packaging-machines/plan?state=maharashtra&district=palghar&town=Vasai+East&pin=401208&product=band-sealer-machine', { redirect: 'manual' });
assert.equal(plan.status, 303);
const target = new URL(plan.headers.get('location'), base);
assert.equal(target.origin, new URL(base).origin);
assert.equal(target.pathname, '/packaging-machines/india/maharashtra/palghar');
assert.equal(target.searchParams.get('town'), 'Vasai East');
assert.equal(target.searchParams.get('pin'), '401208');
const townHtml = await page(target.pathname + target.search);
assert.ok(townHtml.includes('Vasai East, Palghar'));
assert.match(townHtml, /<meta name="robots" content="[^"]*noindex/);
assert.ok(townHtml.includes('rel="canonical" href="https://spectrapackmachines.com/packaging-machines/india/maharashtra"'));
assert.ok(!urls.some(url => url.search || url.pathname.includes('/packaging-machines/plan')));
for (const query of ['state=invalid&district=palghar', 'state=maharashtra&district=invalid', 'state=maharashtra&district=palghar&pin=000000', 'state=maharashtra&district=palghar&town=%3Cscript%3E']) {
  const response = await fetch(base + '/packaging-machines/plan?' + query, { redirect: 'manual' });
  assert.equal(response.status, 400, query);
}
for (const path of ['/products/band-sealer-machine/not-a-guide', '/products/not-a-real-model/buying-guide']) {
  const response = await fetch(base + path);
  const html = await response.text();
  assert.ok(response.status === 404 || /<meta name="robots" content="[^"]*noindex/.test(html), path);
}
console.log(`Search expansion HTTP checks passed: ${products.length} products, ${guides.length} guides, unique metadata, links, sitemap, town handoff and invalid routes.`);
