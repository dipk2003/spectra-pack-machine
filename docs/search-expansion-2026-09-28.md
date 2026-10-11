# Machine buying pages and All India enquiries

## Implemented scope

The published catalogue contains 31 models. Each now has three connected page purposes:

1. `/products/{slug}` — machine specifications, features, FAQs and purchase enquiry.
2. `/products/{slug}/buying-guide` — model-specific selection questions, quotation scope and related configurations.
3. `/products/{slug}/trial-checklist` — model-specific sample tests, acceptance records and handover planning.

The 62 supporting pages have distinct titles, descriptions, focused buyer phrases, self-canonical URLs, WebPage/breadcrumb structured data, product links and sitemap entries. Content profiles cover the published models individually, including models sharing a family. Prices, capacities, certifications, installations and customer testimonials are not invented. Future models need an editorial profile before supporting pages are exposed; the original product template continues to work without one.

`docs/machine-keyword-map.csv` maps 93 model/page combinations to their intended search phrases and descriptions. This is a content map, not search-volume research or a claim that every possible phrase is covered. Generate it alongside the full URL inventory with `npm run seo:urls`.

## Location coverage

`/locations` provides one All India directory with 36 state/UT entries and the existing 784 district entries from the checked-in directory snapshot. It links the state and district pages and supports any user-entered town/village plus delivery PIN and machine selection.

The form validates state/district pairs and redirects to the selected district planner with town, PIN and machine prefilled. That information continues into the contact form. For example:

`/packaging-machines/india/maharashtra/palghar?town=Vasai+East&pin=401208&product=band-sealer-machine`

This is a personalized town enquiry view, **not a separately indexed page for every town**. User-entered location variants are noindex and canonicalize to the state hub. Existing district planners also retain their state canonical and stay out of the sitemap. Existing state hubs and 20 city hubs remain available. No branch in every district or guaranteed on-site service is claimed.

Independent town/district ranking pages require useful verified local material: actual installations, original site photos, freight/site constraints and confirmed service arrangements. “All India” describes the enquiry scope; it is not evidence of those facts for every place.

Google's [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) address doorway pages, scaled low-value content and keyword stuffing. Search ranking and AI recommendations cannot be promised by multiplying place-name pages. These changes focus on usable model resources and a browsable location enquiry flow.

## Verification

```text
npx tsx scripts/verify-model-guides.ts
npm run seo:urls
npm run build
npm run start -- -p 3100 -H 127.0.0.1
node scripts/verify-search-expansion.mjs http://127.0.0.1:3100
node scripts/verify-machine-discovery.mjs http://127.0.0.1:3100
```

Content checks require coverage of every published model, unique model advice and metadata, and safe location input handling. HTTP checks cover all supporting pages, product backlinks, sitemap inclusion, canonicals, structured data, town prefill, invalid region/PIN input and invalid guide routes. Browser checks should cover desktop/mobile overflow, model navigation and the state → district → town → contact handoff without submitting a lead.

The repository work is not proof of production deployment, Search Console submission or indexing. After deployment, inspect the production sitemap and representative model pages in Search Console; track model/family query impressions, clicks and qualified leads.

## Verified results

- Production build and type checking passed, including the final same-origin redirect fix. Existing carousel image lint warnings remain.
- Content coverage: 31/31 published machines, 62 supporting pages and 93 keyword-map rows. URL inventory: 1,649 entries, including consolidated district views and technical endpoints; this is not an indexed-page count.
- HTTP audit passed for all 62 guides and 31 product backlinks, including metadata, sitemap, structured data, invalid routes and location input validation. The first run encountered transient Supabase connection timeouts; the retry passed. This local result does not establish production availability over time.
- Browser checks passed at 1440px and 390px: guide/directory pages, no horizontal overflow or page exceptions, and state/district/town/PIN/machine transfer into the contact form. No enquiry was submitted. Mobile screenshots were inspected.
- Browser testing exposed an internal-host redirect in the planner. It now uses a relative Location header; the final rebuild, direct 303 check and browser handoff passed.
