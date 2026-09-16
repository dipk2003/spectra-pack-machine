import { MACHINE_GUIDE_INPUTS } from '../src/lib/machine-guides';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { EDITORIAL_GUIDES, mergePublicBlogs } from '../src/lib/editorial-guides';
import { resolveGuideHref, resolveGuideProduct } from '../src/lib/editorial-links';
import { parseBlogTemplateContent } from '../src/lib/blog-template';
import { PRODUCTS, SERVICES } from '../src/lib/data';
import type { ProductRecord } from '../src/lib/cms';

const guideSlugs = new Set(EDITORIAL_GUIDES.map((guide) => guide.slug));
const serviceSlugs = SERVICES.map((service) => service.slug);
assert.equal(EDITORIAL_GUIDES.length, 50, 'Preserve 20 existing guides and add 30 machine articles.');
assert.equal(MACHINE_GUIDE_INPUTS.length, 30);
const families = new Set(MACHINE_GUIDE_INPUTS.map(guide => guide.family));
assert.equal(families.size, 15);
for (const family of Array.from(families)) assert.equal(MACHINE_GUIDE_INPUTS.filter(guide => guide.family === family).length, 2);
assert.equal(guideSlugs.size, 50, 'Guide slugs must be unique.');
assert.equal(new Set(EDITORIAL_GUIDES.map((guide) => guide.title)).size, 50, 'Article titles must be distinct.');

let wordCount = 0;
let imageCount = 0;
let internalLinkCount = 0;
const allowedPageLinks = new Set(['/packaging-machines/international', '/services', '/contact', '/schedule-meeting']);

for (const guide of EDITORIAL_GUIDES) {
  assert.match(guide.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Noncanonical guide slug: ${guide.slug}`);
  assert.equal(guide.published, true);
  assert.ok(guide.seoTitle && guide.seoDesc, `Missing metadata: ${guide.slug}`);
  const layout = parseBlogTemplateContent(guide.content);
  const words = layout.body.trim().split(/\s+/).length;
  assert.ok(words >= 250, `Incomplete article body: ${guide.slug}`);
  wordCount += words;
  assert.ok((layout.body.match(/^.+\?$/gm) || []).length >= 3, `Missing article sections: ${guide.slug}`);
  for (const path of Array.from(new Set([guide.image, layout.leftImage, layout.rightImage].filter(Boolean)))) {
    assert.ok(path.startsWith('/images/'), `Expected a local catalog photo: ${path}`);
    assert.ok(existsSync(resolve('public', path.slice(1))), `Missing photo: ${path}`);
    imageCount += 1;
  }
  assert.ok(layout.leftImageAlt, `Missing photo alt text: ${guide.slug}`);
  if (layout.rightImage) assert.ok(layout.rightImageAlt, `Missing secondary photo alt text: ${guide.slug}`);
  for (const slug of guide.relatedGuideSlugs) assert.ok(guideSlugs.has(slug), `Dead related guide: ${slug}`);
  for (const slug of guide.serviceSlugs) assert.ok(serviceSlugs.includes(slug), `Unknown service: ${slug}`);
  for (const match of Array.from(layout.body.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g))) {
    const href = match[2];
    internalLinkCount += 1;
    assert.ok(href.startsWith('/') && !href.startsWith('//'), `Nonlocal editorial link: ${href}`);
    if (href.startsWith('/blog/')) assert.ok(guideSlugs.has(href.slice(6)), `Dead blog link: ${href}`);
    else if (href.startsWith('/services/')) assert.ok(serviceSlugs.includes(href.slice(10)), `Dead service link: ${href}`);
    else if (href.startsWith('/products/')) assert.ok(guide.productSlugs.includes(href.slice(10)), `Untracked product reference: ${href}`);
    else assert.ok(allowedPageLinks.has(href), `Unexpected editorial route: ${href}`);
  }
}

// Published CMS posts remain present and take precedence over versioned content.
const existing = { ...EDITORIAL_GUIDES[0], id: 'cms-existing', slug: 'existing-customer-article', title: 'Existing customer article' };
const override = { ...EDITORIAL_GUIDES[1], id: 'cms-override', title: 'Customer-edited article' };
const merged = mergePublicBlogs([existing, override]);
assert.equal(merged.length, 51);
assert.equal(merged.find((guide) => guide.slug === override.slug)?.id, override.id);
assert.ok(merged.some((guide) => guide.id === existing.id));
assert.equal(mergePublicBlogs([{ ...override, published: false }]).some((guide) => guide.slug === override.slug), false);
assert.equal(resolveGuideHref('//outside.example', PRODUCTS, serviceSlugs), null);
assert.equal(resolveGuideHref('javascript:alert(1)', PRODUCTS, serviceSlugs), null);
assert.equal(resolveGuideHref('/products/unpublished-product', PRODUCTS, serviceSlugs), null);
assert.equal(resolveGuideHref('/services/unpublished-service', PRODUCTS, serviceSlugs), '/services');

const snapshotPath = resolve('.tmp/live-products.json');
if (existsSync(snapshotPath)) {
  const catalog = (JSON.parse(readFileSync(snapshotPath, 'utf8')) as ProductRecord[]).filter((product) => product.published);
  assert.ok(catalog.length > 0, 'The catalog snapshot must contain published products.');
  for (const product of catalog) {
    const matching = MACHINE_GUIDE_INPUTS.filter(guide => guide.products.some(slug => resolveGuideProduct(slug, catalog)?.slug === product.slug));
    assert.ok(matching.length >= 2, `Expected two new family articles for ${product.slug}`);
  }
  const catalogSlugs = new Set(catalog.map((product) => product.slug));
  const coveredSlugs = new Set(EDITORIAL_GUIDES.flatMap((guide) => guide.productSlugs)
    .map((slug) => resolveGuideProduct(slug, catalog)?.slug).filter(Boolean));
  const uncovered = catalog.filter((product) => !coveredSlugs.has(product.slug));
  assert.deepEqual(uncovered.map((product) => product.slug), [], 'Every current published machine should be covered by a guide.');
  let resolvedLinks = 0;
  let unavailableReferences = 0;
  for (const guide of EDITORIAL_GUIDES) {
    for (const match of Array.from(parseBlogTemplateContent(guide.content).body.matchAll(/\[[^\]]+\]\((\/products\/[^)]+)\)/g))) {
      const href = resolveGuideHref(match[1], catalog, serviceSlugs);
      if (!href) { unavailableReferences += 1; continue; }
      assert.ok(catalogSlugs.has(href.slice(10)), `Resolved link is not in the published catalog: ${href}`);
      resolvedLinks += 1;
    }
  }
  console.log(`Published catalog coverage: ${coveredSlugs.size}/${catalog.length}; ${resolvedLinks} product links resolve; ${unavailableReferences} unavailable model references render as plain text.`);
} else {
  const covered = new Set(EDITORIAL_GUIDES.flatMap((guide) => guide.productSlugs));
  assert.deepEqual(PRODUCTS.filter((product) => !covered.has(product.slug)).map((product) => product.slug), []);
  console.log(`Seed catalog coverage: ${PRODUCTS.length}/${PRODUCTS.length}. No live snapshot supplied; live coverage was not checked.`);
}

console.log(`Editorial verification passed: 50 unique articles, ${wordCount} words, ${imageCount} local photo references, ${internalLinkCount} internal links, CMS merge and safe link resolution.`);
