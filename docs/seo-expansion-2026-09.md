# SEO and machine guide update

## Implemented

- Completed metadata on all public page templates: page titles, descriptions, focused keywords, absolute canonical URLs, Open Graph and Twitter previews. Existing private/admin indexing restrictions remain in place.
- Preserved complete machine and location names in titles. Truncating the beginning of a long shared model name previously risked removing the distinguishing model or city. State and city hub titles now differ, including Delhi.
- Added 30 original articles across 15 machine families, using local machine images, descriptive alt text, article structured data, product/service links and related-article links. The 20 existing versioned guides and CMS posts remain available.
- Added reverse links from product pages to relevant illustrated guides. The saved published catalogue has 31 products, each associated with at least two new family articles. These are **two articles per family**, not 62 separately written model articles.
- Added a searchable district directory under each of the 36 state/UT hubs and 784 district enquiry routes. Visitors can select a machine and service, enter any town/village and PIN code, and carry that context into the contact form.
- Added the new articles to the sitemap, preserved image references, and generated a URL inventory with an explicit canonical column.

## Location indexing policy

The district names come from a checked-in snapshot of the [Government of India district directory](https://igod.gov.in/index.php/sg/district/states), retrieved on 15 September 2026. Each state record includes its source URL. The snapshot is a directory of the listed district websites, not a promise that administrative boundaries or names never change.

District routes provide location-specific enquiry context but substantially share their planning content. Their canonical points to the corresponding state hub, and they are deliberately excluded from the sitemap. They are **not independent district ranking pages**. City/town names can be entered in the enquiry; this update does **not create an independently indexable page for every Indian town**.

The existing 20 city hubs and 620 city × machine URLs remain. Unique district landing pages should only become self-canonical and enter the sitemap when they contain verified local value: actual installation examples, delivery/site constraints, local service arrangements or other useful original content. Do not invent branch addresses or guaranteed on-site service coverage.

Google recommends [consistent canonical signals](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) for substantially similar pages. Its [spam policies](https://developers.google.com/search/docs/essentials/spam-policies#doorway-abuse) address region/city doorway pages and keyword stuffing. Google also states that [meta keywords do not affect indexing or ranking](https://developers.google.com/search/docs/crawling-indexing/special-tags). Keywords are included as requested; titles, visible content and useful linking carry the editorial work.

## Search Console baseline supplied by the owner

| Metric | Screenshot value |
| --- | ---: |
| Clicks, three months | 242 |
| Impressions | 6.5K |
| CTR | 3.7% |
| Average position | 12.8 |
| Indexed pages | 284 |
| Not indexed | 528 |
| Not found (404) | 13 |
| Duplicate without user-selected canonical | 11 |
| Page with redirect | 5 |
| Discovered, currently not indexed | 498 |
| Crawled, currently not indexed | 1 |

These screenshots contain counts, not affected URLs. They do not prove that all excluded pages have technical errors. Intentional redirects and canonical duplicates can be normal. The exact 13 missing URLs and 11 duplicate URLs still need to be matched to their intended destinations; no claim is made that their Search Console status has been resolved.

## Validation and maintenance

Run from the repository root:

```text
npm run build
npm run verify:editorial
npm run verify:seo-content
npm run seo:urls
npm run start -- -p 3100 -H 127.0.0.1
npm run verify:seo -- http://127.0.0.1:3100
npm run verify:seo-pages -- http://127.0.0.1:3100
```

Stop the preview server before rebuilding: Next replaces `.next` during a build.

- Editorial checks validate unique slugs/titles, complete article bodies, existing images and alt text, internal links, catalogue coverage and preservation of CMS overrides.
- Content checks validate all 36 state/UT entries, 784 unique district routes, full model titles, canonical URLs and social metadata.
- HTTP checks validate the new blog URLs in the sitemap, rendered metadata across every main/product/category/blog/service/state/city hub, a representative machine-location page, and invalid-route indexing behaviour.
- The local browser check covers district search, machine/service selection, town/PIN transfer to the contact form, mobile layouts and browser exceptions. It stops before submitting an enquiry.

## Release and measurement

This is a repository implementation, not evidence of a production deployment or Google reindexing. After deployment:

1. Check the production sitemap and representative product, blog and state URLs. The local build contains 794 sitemap URLs, including the 30 new articles; totals may change with CMS publishing.
2. In Search Console, inspect a new article and a priority product URL, and confirm that Google can read the canonical and rendered content. Confirm the existing sitemap is fetched successfully.
3. Export the affected 404 and duplicate URLs, map exact replacements where they exist, and validate the corresponding fixes. Avoid redirecting unrelated missing pages to the homepage.
4. Track product/category and region-specific queries separately: impressions, clicks, CTR, leads and indexed preferred URLs. Average position across all queries is not a promise about any one machine keyword.
5. Add verified project examples and original field photos to priority pages over time. First-page rankings and indexing decisions remain Google's; they cannot be guaranteed by adding tags or more URLs.

## Verified results — 16 September 2026

- Production build completed; TypeScript check passed. Existing home-carousel image lint warnings remain unrelated to this change.
- All 30 new articles individually passed a real Chromium check: HTTP 200, decoded machine photograph, nonempty alt text, visible article body, no horizontal overflow at 390px and no page exceptions. Desktop and mobile screenshots were inspected.
- Full editorial library: 50 unique articles, 16,924 words, 82 local image references and 218 internal links. Saved catalogue coverage: 31/31 products, each connected to at least two new family guides.
- Rendered SEO audit: 175 pages checked, unique titles and required metadata passed, all 30 new article URLs found in the 794-entry sitemap, invalid-route checks passed.
- District search and machine/service/town/PIN transfer to the contact form passed in Chromium; no enquiry was submitted.
- Browse the complete new article list in `docs/machine-blog-inventory.md`.
- Production publication, Search Console submission and Google indexing were not performed or confirmed.
