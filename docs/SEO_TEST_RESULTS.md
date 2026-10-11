# SEO test results

Run date: 11 October 2026.

| Check | Result | Detail |
|---|---|---|
| `npm run verify:seo-content` | Passed | 36 state/UT directories, 784 unique district routes, distinct full titles, canonicals and social metadata. |
| `npm run verify:editorial` | Passed | 31/31 published-model coverage; 50 unique articles, 16,924 words, 82 local photo references, 218 internal links; CMS merge and link checks passed. |
| `npm run verify:seo -- http://127.0.0.1:3100` | Passed | Robots, sitemap (858 URLs), representative routes, legacy/www redirects and admin guard passed. |
| `npm run verify:seo-pages -- http://127.0.0.1:3100` | Passed | 239 rendered pages checked; metadata, title uniqueness, 30 article sitemap entries and invalid routes passed. |
| `node scripts/verify-machine-discovery.mjs http://127.0.0.1:3100` | Passed | 31 models discoverable; buying guidance, canonical URLs, FAQ HTML, JSON-LD and crawler rules passed. |
| `npm run build` | Passed | Compiled, linted and type checked; generated 777 static pages and completed route/build tracing. Three existing `<img>` LCP/bandwidth warnings in `CategoryHeroCarousel.tsx` were reported. |

Final source edits were included in a subsequent `npm run build`, which passed and generated 777 static pages. A local production page check returned HTTP 200 and confirmed width, height, length/depth, mm/cm/in unit controls and review-first copy; the old 24-hour promise was absent. The acknowledgement panel itself is conditional on a successful submission and was not exercised because that would create a real lead. The new event code sends only the product slug and surface from this form; analytics consent/runtime delivery was not verified by this check.

After the enquiry modal and Contact Us machine selector were added, a fresh `npm run build` passed. Local production HTTP checks returned 200 for `/` and `/contact`, confirmed the machine dropdown/help option, optional dimension fields, and absence of the 24-hour promise. No lead was submitted.

For the metadata rewrite on 11 October, the build passed and `npm run verify:seo-pages -- http://127.0.0.1:3104` passed across 239 rendered URLs: titles are unique with one company suffix, descriptions are non-empty and unique, and invalid-route checks passed. This is the rendered sitemap sample defined by the verifier, not every URL in the 1,649-row inventory.

After adding family-specific fit and trial guidance to the city-machine template, the production build passed. A rendered `/mumbai/shrink-tunnel-machine` response returned HTTP 200 and included the sample-trial section and product specification link. Visual differences between pages were not introduced as an indexing tactic; Google evaluates page content and canonical signals.

Historical results in dated documentation (including prior builds and browser checks) describe those earlier runs and should not be read as results from this audit date.

Not verified in this run: live production responses, Googlebot rendering, Search Console indexing/ranking, Core Web Vitals, live analytics/CRM delivery, mobile browser behavior and URL-level Search Console 404/duplicate cases. HTTP checks were against the local production build, not the deployed domain. The first smoke-test attempt failed because the server was not running; the retry passed against the local production server.
