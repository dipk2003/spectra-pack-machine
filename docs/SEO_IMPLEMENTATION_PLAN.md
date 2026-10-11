# SEO implementation plan

## Existing implementation found

The repository already contains a broad SEO/content implementation: centralized metadata helpers; product, category, service and editorial routes; catalog and CMS SEO fields; XML sitemap and robots routes; 31 machine pages; 62 model buying/trial resources; internal links; structured data; location planning; and a protected CRM-backed enquiry endpoint. Existing work is present in the current working tree, so this audit did not replace or reset those changes.

## Next work, ordered by evidence and risk

1. Start a production build locally, then run `verify:seo`, `verify:seo-pages`, `verify:machine-discovery` and `verify:search-expansion` against it. Resolve actual failures and record route counts.
2. Run an authenticated/appropriate public crawl of canonical routes and compare status, metadata uniqueness, H1, robots, canonical and internal link reachability. Review city × machine pages for distinct useful information; use GSC evidence before changing indexability.
3. Export exact GSC affected URL examples. Classify them against `SEO_URL_INVENTORY.csv`; fix only proven stale routes, canonical conflicts, errors or sitemap pollution.
4. Reconcile public URL inventory and sitemap from the same eligible canonical route source. Consider a common eligibility predicate so noindex/redirect/duplicate routes cannot enter the sitemap. Preserve district-to-state canonical policy unless content evidence changes.
5. Have manufacturer review the 31 catalog records using `SEO_CONTENT_GAPS.md`. Add only verified specs/media/FAQs to existing CMS/template fields.
6. Validate quotation workflows against existing `/api/leads` and CRM. Confirm machine-specific dimension capture, consent/privacy wording, reference IDs, sales notification and acknowledgement with the actual configured pipeline before adding any new fields or schema.
7. Verify analytics events in a consent-aware live preview; confirm no contact PII is sent and no duplicate Google tag is introduced.
8. Deploy only after owner review. Recheck production sitemap, robots, representative canonical pages and forms; then monitor GSC and qualified CRM leads.

## Current task scope and dependencies

No production deployment, Search Console edits, database migrations, or customer-record changes were made. This workspace does not contain a URL-level Search Console export. The live HTTP SEO smoke test needs a running local server. Review of manufacturer technical documents is needed before adding missing facts.
