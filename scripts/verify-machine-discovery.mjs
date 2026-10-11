import assert from 'node:assert/strict';

const base = (process.argv[2] || 'http://127.0.0.1:3100').replace(/\/$/, '');
async function read(path) {
  const response = await fetch(base + path, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, path);
  return response.text();
}
const sitemap = await read('/sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]));
assert.ok(urls.some(url => url.pathname === '/machines'), 'Catalogue missing from sitemap');
const products = urls.filter(url => /^\/products\/[^/]+$/.test(url.pathname));
assert.ok(products.length > 0, 'No published machines');
const directory = await read('/machines');
assert.ok(directory.includes('"@type":"ItemList"'), 'Missing directory structured data');
assert.ok(directory.includes('rel="canonical" href="https://spectrapackmachines.com/machines"'));
for (const product of products) {
  assert.ok(directory.includes(`href="${product.pathname}"`), `Missing directory link: ${product.pathname}`);
  const html = await read(product.pathname);
  assert.ok(html.includes('id="machine-buying-heading"'), `Missing buying guide: ${product.pathname}`);
  assert.ok(html.includes('rel="canonical" href="' + product.href + '"'), product.pathname);
  // Verify answers exist in real HTML, not just the hydration payload.
  const details = [...html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)];
  if (html.includes('Common Questions')) {
    assert.ok(details.length > 0, `FAQ unavailable without JS: ${product.pathname}`);
    for (const [, body] of details) assert.match(body, /<\/summary>\s*<div[^>]*>[^<]+<\/div>/);
  }
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  schemas.forEach(([, value]) => JSON.parse(value));
}
const robots = await read('/robots.txt');
for (const agent of ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'PerplexityBot', 'Claude-SearchBot']) {
  assert.ok(robots.includes(`User-Agent: ${agent}`) || robots.includes(`User-agent: ${agent}`), agent);
}
assert.match(robots, /Disallow: \/admin/i);
assert.match(robots, /Disallow: \/api/i);
console.log(`Machine discovery passed: ${products.length} published models linked, buying guidance and canonical URLs present, FAQ answers in HTML, valid JSON-LD and search crawler rules.`);
