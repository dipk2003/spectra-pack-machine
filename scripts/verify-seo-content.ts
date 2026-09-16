import assert from 'node:assert/strict';
import { INDIA_DISTRICT_DIRECTORY, findDistrictState } from '../src/lib/india-districts';
import { completePageMetadata, buildAbsoluteSeoTitle } from '../src/lib/seo';
import { COMPANY_INFO } from '../src/lib/data';

const routes = new Set<string>();
assert.equal(INDIA_DISTRICT_DIRECTORY.length, 36);
assert.equal(new Set(INDIA_DISTRICT_DIRECTORY.map(state => state.slug)).size, 36);
for (const state of INDIA_DISTRICT_DIRECTORY) {
  assert.ok(state.districts.length, `No districts for ${state.name}`);
  assert.match(state.source, /^https:\/\/igod\.gov\.in\//);
  for (const district of state.districts) {
    assert.ok(district.name.trim());
    assert.match(district.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    const route = `/packaging-machines/india/${state.slug}/${district.slug}`;
    assert.ok(!routes.has(route), `Ambiguous district URL: ${route}`);
    routes.add(route);
  }
}
assert.equal(findDistrictState('not-a-state'), undefined);
assert.ok(findDistrictState('maharashtra')?.districts.some(district => district.slug === 'palghar'));

// Long model and city names must remain distinct in search metadata.
const bottleTitle = buildAbsoluteSeoTitle('Automatic Web Sealer with Shrink Tunnel - Bottles in Mumbai', '');
const boxTitle = buildAbsoluteSeoTitle('Automatic Web Sealer with Shrink Tunnel - Box in Mumbai', '');
assert.notEqual(bottleTitle, boxTitle);
assert.ok(bottleTitle.includes('Bottles in Mumbai'));
const page = completePageMetadata({
  title: `${bottleTitle} | ${COMPANY_INFO.name}`,
  description: 'Compare bottle bundle sizes and request an application trial.',
  alternates: { canonical: '/products/example' },
  openGraph: { images: ['/images/products/shrink-tunnel-machine.png'] },
});
assert.equal(typeof page.title === 'object' && page.title && 'absolute' in page.title ? page.title.absolute : '', bottleTitle);
assert.equal(page.alternates?.canonical, `${COMPANY_INFO.website}/products/example`);
assert.equal(page.openGraph?.url, page.alternates?.canonical);
assert.equal(page.openGraph?.description, page.description);
assert.deepEqual(page.twitter?.images, page.openGraph?.images);
assert.equal(completePageMetadata({ title: 'Empty category', robots: { index: false, follow: true } }).robots &&
  (completePageMetadata({ title: 'Empty category', robots: { index: false, follow: true } }).robots as { index: boolean }).index, false);

console.log(`SEO content checks passed: 36 state/UT directories, ${routes.size} unique district routes, distinct full titles, canonicals and social metadata.`);
