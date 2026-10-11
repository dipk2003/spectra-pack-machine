# SEO audit baseline

Audit date: 11 October 2026. Repository: Next.js 14 App Router, React 18, TypeScript, Supabase-backed CMS with checked-in catalogue fallbacks, deployed through Vercel configuration. This is a repository audit, not a live crawl or Search Console export.

## Scope and evidence

- Routes found: homepage; static about, services, contact, clients, blog, machine catalogue, locations, meeting, privacy and machine-location hubs; product/category/service/blog dynamic routes; model buying guides and trial checklists; state and district enquiry planners; API, admin and webhook routes. Dynamic public inventories are listed in `SEO_URL_INVENTORY.csv`.
- Current inventory snapshot: 1,649 rows: 12 static, 2 technical endpoints, 31 products, 18 populated categories, 4 categories with no published product, 5 services, 55 blogs, 36 state hubs, 20 location hubs, 620 city × machine pages, 31 buying guides, 31 trial checklists, and 784 district enquiry routes canonicalized to state pages.
- Existing content evidence: 31 published models; 50 editorial articles, 16,924 words, 82 local image references and 218 internal links. See `machine-search-discovery.md`, `machine-blog-inventory.md`, and `search-expansion-2026-09-28.md`.
- Owner-provided older Search Console figures and an older, differing screenshot baseline are recorded in `search-expansion-2026-09-28.md`. No URL-level Search Console export or current property access is available in this workspace. Those aggregate counts do not establish the status of any individual URL.
- A local production-build HTTP audit was run after starting the app at `127.0.0.1:3100`: sitemap had 858 URLs; 239 rendered pages passed metadata/title uniqueness and invalid-route checks; 31 machine pages passed discovery/schema checks. This does not represent a production crawl or Googlebot access.

## Architecture and current controls

- Next.js App Router metadata functions exist on public templates. `src/lib/seo.ts` normalizes a repeated company suffix, adds one concise brand suffix, fills canonical/robots/Open Graph/Twitter defaults, and derives descriptions.
- Metadata now removes internal/repeated brand mentions from titles and descriptions, appends exactly one `| Spectra Pack Machines` title suffix, and normalizes social metadata to match. Category snippets use distinct comparison intent instead of reusing an identical product snippet.
- Product/category/blog/service/location templates use CMS or checked-in data. Product records include editable SEO title/description. Product schema uses actual catalog fields and does not include offers or ratings.
- `src/app/sitemap.ts` emits CMS product, category, blog and service URLs plus static, model guide, state, city and city × product URLs. District planners are intentionally excluded and canonicalized to state hubs. Four empty categories are represented in inventory as noindex candidates; verify actual page behavior before changing their eligibility.
- `src/app/robots.ts` allows public crawl and disallows `/admin` and `/api`, and links the sitemap.
- Public quotation/contact flow uses `/api/leads`, shared CRM/Supabase storage, email notifications, spam controls and rate limits. Product pages now collect optional width/height/length-depth and unit values and append them to the existing CRM lead message. Product-page conversion events exclude contact PII. This does not yet implement file uploads or machine-specific conditional schemas; sales must review whether the captured parameters suit each machine.
- Existing internal linking includes `/machines`, category/product links, machine articles, guide pages and location planners. Existing docs describe the rationale for consolidated district pages and the location-page policy.

## Findings and priority

1. **Verify the large city × machine set against user value.** 620 URLs are generated from 20 location markets and the published catalog. Templates have location-specific metadata and content, but broad templating is an indexing-quality risk. Review Search Console URL examples and crawl/rendered HTML before deciding to retain, consolidate or noindex any subset. No bulk indexing directive change is justified by aggregate “discovered” counts alone.
2. **Resolve Search Console exclusions with URL examples.** Exact 404, duplicate, redirect and discovered-not-indexed URL lists are unavailable. Map affected URLs to current canonical destinations; preserve genuine 404/410 responses where no close replacement exists.
3. **Audit sitemap eligibility at runtime.** Current sitemap is dynamically generated from data but includes all published products and all city × product combinations. Verify actual route status, robots and canonical signals in a production-like HTTP crawl. Existing local smoke script requires a server.
4. **Validate metadata across CMS records.** Shared helpers reduce duplicated suffixes, but actual uniqueness depends on editable CMS values. The generated URL/keyword maps do not establish rendered title uniqueness. Run the HTTP SEO page audit after starting the app with valid CMS configuration.
5. **Collect manufacturer-approved specification gaps.** Product data contains specifications, but a model-by-model engineering review is required to confirm completeness, units, material compatibility, dimensional ranges, throughput, power and customization claims. The content gap log tracks this approval dependency.

## Search and conversion baseline

The owner-provided GSC baseline in the brief (340 clicks, ~8,730 impressions, 3.9% CTR, average position 11.7, 335 indexed and 529 not indexed) is not independently verified in this repository. A different older screenshot baseline is documented in `search-expansion-2026-09-28.md`. Keep each source/date distinct; do not combine them. Conversion tracking and CRM integrations exist in the codebase, but production tag delivery, consent behavior, and lead attribution require a live measurement audit.

## Validation performed for this audit

- `npm run verify:seo-content`: passed (36 state/UT entries, 784 unique district routes, distinct titles, canonicals and social metadata).
- `npm run verify:editorial`: passed (31/31 catalog coverage, 50 articles, 16,924 words, 82 local photo references, 218 internal links).
- `npm run verify:seo -- http://127.0.0.1:3100`: passed; robots, sitemap, selected routes, redirect and admin-guard checks.
- `npm run verify:seo-pages -- http://127.0.0.1:3100`: passed; 239 rendered pages, unique titles, metadata and invalid routes.
- `node scripts/verify-machine-discovery.mjs http://127.0.0.1:3100`: passed; all 31 models, guide links, FAQ HTML, JSON-LD and crawler rules.
- `npm run build`: passed; 777 static pages generated. Three existing `<img>` warnings remain in `CategoryHeroCarousel.tsx`.

See `SEO_TEST_RESULTS.md` for outcomes and validation limits.
