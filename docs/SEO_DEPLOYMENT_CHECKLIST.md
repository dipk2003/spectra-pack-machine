# SEO deployment checklist

No production deployment was performed.

## Before release

- [ ] Build and type checks complete successfully against the exact reviewed revision.
- [ ] Run SEO/content/editorial checks and HTTP route audits against a local production server.
- [ ] Review product metadata and factual claims with the manufacturer.
- [ ] Compare sitemap routes with rendered canonical, indexability and HTTP status; resolve confirmed mismatches.
- [ ] Review changed URL/redirect behavior and retain unrelated proper 404/410 responses.
- [ ] Confirm CRM form notifications, customer acknowledgement, spam protection, privacy and dimension fields in a safe preview.
- [ ] Confirm analytics events respect consent and omit PII.
- [ ] Confirm environment configuration is present in the deployment environment without exposing credentials.
- [ ] Prepare rollback to the previously deployed revision; no database migration is part of this audit package.

## After owner-approved deployment

- [ ] Request `/robots.txt`, `/sitemap.xml`, homepage, one product per major template, category, guide, service and state hub; confirm expected status/canonical/metadata.
- [ ] Confirm production enquiry workflow and lead attribution with a controlled internal submission.
- [ ] Inspect priority URLs and sitemap status in Search Console; use URL-level inspection for known affected examples.
- [ ] Monitor qualified enquiries and GSC query/page metrics over an appropriate period. Do not infer indexing or ranking gains from deployment alone.
