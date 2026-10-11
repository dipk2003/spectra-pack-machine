# SEO changelog

## 2026-10-11 — repository audit and evidence package

- Added `SEO_AUDIT.md`, summarizing the inspected Next.js/CMS architecture, route templates, existing SEO controls, URL inventory counts, known evidence limits and priorities.
- Added `SEO_URL_INVENTORY.csv`, copied from the repository's existing 1,649-row generated inventory without replacing the existing inventory file.
- Added `SEO_KEYWORD_MAP.csv`, expanded from the existing 93-row machine/model-guide map; it uses existing target phrases and labels unavailable GSC query evidence explicitly.
- Added content gap, implementation plan, test results, deployment checklist and Search Console follow-up documentation.
- Product enquiry form now captures optional product width, height and length/depth with mm/cm/in units and sends these as part of the existing CRM-backed lead message. The acknowledgement asks for technical review before quotation and removes an unsupported 24-hour response promise.
- Added product-page conversion events for form start, submit, success, error, WhatsApp enquiry click and call enquiry click. Events carry the product slug only, not customer contact details.
- No database schema, credentials, production systems or customer records were changed.

## 2026-10-11 — simpler machine enquiry

- Added a machine-selection quotation modal to desktop and mobile navigation, backed by the existing `/api/leads` and CRM notification flow.
- Added the same published-machine dropdown to Contact Us, with “Help me choose a machine” in both flows.
- Added optional product width, height, length/depth and units to popup and Contact Us enquiries. These details go into the existing CRM lead message; buyer can still submit without dimensions.
- Removed the Contact Us 24-hour response promise. Success copy explains that the team reviews the requirement before discussing a configuration.
- Manufacturer research found model-specific dimensions/specifications for SPST-101 on official product/catalog pages. The approval queue documents these sources and warns that tunnel opening is not machine overall dimensions; no values were generalized to other models.

## 2026-10-11 — metadata consistency and machine-specific page content

- Standardized titles to one `| Spectra Pack Machines` suffix and removed extra brand mentions from metadata descriptions and social previews.
- Rewrote category snippets around category comparison intent; a rendered duplicate-description audit found and resolved overlap with an L-sealer product page.
- Added machine-family-specific product fit checks and sample-trial guidance to the city-machine page template, using existing product type and verified guidance data rather than decorative CSS variations.

## Existing repository implementation

Prior work already includes shared metadata normalization, catalog/category/blog/service templates, sitemap and robots handlers, a machine catalogue, product/category SEO fields, structured data, model-specific guides, an India location directory and a CRM-backed lead system. See linked files and prior dated audit notes in `docs/` for historical scope; those historical test results are not represented as newly run tests here.
