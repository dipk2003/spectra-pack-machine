# SEO content gaps and approval queue

Source of truth: published product records in the CMS or `src/lib/products.ts` fallback. This queue records items requiring technical or business review; it does not authorize invented values.

## Machine-level review required

The published catalog contains 31 models. Review each model record and its genuine product media before claiming any of the following where absent or ambiguous: model reference; operating principle; overall dimensions; accepted product width/height/length or weight; throughput and test conditions; film/material compatibility; sealing/heating method; supply voltage and power; conveyor dimensions/speed; automation/feeding options; environmental limits; customization boundaries; installation and after-sales scope. Existing `specs`, `features`, description, FAQs and image fields should be checked against manufacturer-approved documents.

Research check: the official [SPST-101 product page](https://spectrapackmachines.com/products/shrink-tunnel-machine) and [manufacturer catalog PDF](https://www.spectrapackmachines.com/catalog/spectra-pack-machines-catalog.pdf) publish a 300 × 300 mm tunnel size and other model-specific details. Confirm that the current CMS record matches the current approved model before synchronizing any value; tunnel opening is not the same as overall machine dimensions, and those figures must not be reused for other models.

For any missing value, keep the page explicit that the detail is available on request or must be confirmed from the product sample. Do not publish guessed ranges, universal film compatibility, capacity, warranty, delivery, certifications or prices.

## High-value assets to request from manufacturer

- Approved dimension drawings and operating manuals for each model.
- Real machine photographs at useful angles, with model identity confirmed; product-in-use photographs where permission exists.
- Short demonstrations showing loading, sealing/wrapping, output and changeover for applicable models.
- Confirmed application/material matrix per machine and exceptions.
- Confirmed custom configuration boundaries and information needed to assess fit.
- Approved customer installation examples, with permission and location detail if used.
- Sales-approved response process and service/delivery coverage statements.

## Search data needed

- Search Console page/query export for the previous 3 months and 12 months, including clicks, impressions, CTR, position, device and country.
- Search Console examples for discovered/crawled-not-indexed, duplicate, redirect and 404 statuses; sitemap and canonical selected by Google where shown.
- Analytics/CRM attribution export to evaluate qualified enquiries by canonical landing page, without exposing contact PII in analytics.
- External crawl results for status codes, rendered metadata, canonicals, internal links, page depth and sitemap coverage.

Do not treat absence of this evidence as proof of a technical defect or a reason to index every known URL.
