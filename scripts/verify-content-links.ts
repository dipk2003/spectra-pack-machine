import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EDITORIAL_GUIDES } from '../src/lib/editorial-guides';
import { MACHINE_GUIDE_INPUTS } from '../src/lib/machine-guides';
import { blogRelationships, blogsForProduct } from '../src/lib/content-links';
import { machineSearchKeywords } from '../src/lib/seo';
import type { ProductRecord } from '../src/lib/cms';

const dbArticles = MACHINE_GUIDE_INPUTS.map((input, index) => ({
  ...EDITORIAL_GUIDES.find(guide => guide.slug === input.slug)!,
  id: `database-row-${index}`, // A real DB ID differs from editorial-slug.
}));
for (const article of dbArticles) {
  const links = blogRelationships(article);
  assert.ok(links.productSlugs.length && links.serviceSlugs.length && links.relatedGuideSlugs.length);
  assert.deepEqual(links, blogRelationships({ ...article, productSlugs: [], serviceSlugs: [], relatedGuideSlugs: [] }));
}
const custom = { ...dbArticles[0], slug: 'custom-cms-post', productSlugs: [], serviceSlugs: [], relatedGuideSlugs: [],
  content: 'Read [machine](/products/shrink-tunnel-machine), [installation](/services/installation) and [guide](/blog/example-guide).' };
assert.deepEqual(blogRelationships(custom), { productSlugs: ['shrink-tunnel-machine'], serviceSlugs: ['installation'], relatedGuideSlugs: ['example-guide'] });
const products = (JSON.parse(readFileSync('.tmp/live-products.json', 'utf8')) as ProductRecord[]).filter(item => item.published);
for (const product of products) assert.ok(blogsForProduct(dbArticles, product, products).length >= 2, product.slug);
assert.equal(blogsForProduct(dbArticles.map(article => ({ ...article, published: false })), products[0], products).length, 0);
assert.ok(machineSearchKeywords('Automatic Web Sealer with Shrink Tunnel - Bottles', 'Wrapping', 'Mumbai').includes('web sealer machine in Mumbai'));
assert.ok(machineSearchKeywords('Automatic Web Sealer with Shrink Tunnel - Bottles', 'Wrapping', 'Noida').includes('web sealer machine in Noida'));
console.log('DB article relationships, CMS markdown links, product reverse links and Mumbai/Noida search terms passed.');
