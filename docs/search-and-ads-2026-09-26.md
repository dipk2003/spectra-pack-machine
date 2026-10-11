# Search and advertising activation — 26 September 2026

Deployment: `dpl_5x57r3ZC2egN7AdBwxtWSHTYtv2c`, READY and aliased to https://spectrapackmachines.com. Local production build, TypeScript, attribution/consent tests, SEO content and editorial checks passed. Existing carousel image lint warnings remain. Account-side conversion receipt is not verified; no Google lead label or Meta Pixel ID has been supplied. User's tag-install screenshot confirmed the existing `AW-18443957872` ID.

Post-deployment verification: 176 rendered public pages and 795 sitemap URLs passed canonical metadata, unique titles, article inclusion and invalid-route checks. The first full crawl failed with ECONNRESET; retry passed. Separate HTTP checks verified the new single homepage H1, canonical, Meta CSP allowance and public robots rules. Source changes remain uncommitted locally.

## Findings and changes

- Live homepage was crawlable, but its H1 described only the current carousel slide. It now has a stable, visible packaging-machine manufacturer H1 and an application-focused introduction. Carousel headings are H2s.
- Animated counters previously rendered zero in server HTML. Initial HTML now contains the actual configured figures; animation respects reduced-motion preferences.
- Existing sitemap, canonical metadata, organization/product/article structured data and public robots rules already support discovery. No additional keyword/location pages or fabricated reviews were added. Public robots rules allow OAI-SearchBot; CDN access and actual search indexing still need account/log verification.
- Vercel's www hostname returned HTTP 307. Added a verified project domain redirect to the existing apex using 308; live `/about` response verified as 308.
- GA4 `G-49TN7HKQEX` and Google Ads `AW-18443957872` are configured in `vercel.json`. Production environment-name inspection confirmed no direct conversion labels and no GTM container. Whether the Ads account imports a GA4 key event is unknown.
- Optional direct Meta Pixel now loads after consent only. PageView, Lead and Schedule use explicit events; contact clicks use custom events. A saved record ID is required for lead/meeting events and shared conversion deduplication prevents repeat events during the page session. No advanced matching/form-field payload is supplied. Automatic event configuration is disabled.
- Meta campaign attribution and identifiable AI referrals have separate CRM labels. AI visits without referrer/UTM data cannot be identified reliably.

## Required account values

Follow-up: the user supplied the Contact conversion event snippet with destination `AW-18443957872/hgSBCLmv9fwcEPDs4dpE`. The lead label is now configured for runtime and build in `vercel.json`. It is attached only to `generate_lead` after a saved record ID, not contact-page views or contact clicks. Meta Pixel ID remains missing. Provider receipt and the action's primary/secondary/count settings still require account-side verification.

Conversion activation deployment: `dpl_3mpGQ5uPXpkQiQCcigx28R1Jboh6`, READY and aliased to the production domain. Production build and conversion/consent tests passed. Live contact-page asset `/_next/static/chunks/16-a2df8d2e61c59bd0.js` was fetched and confirmed to include the exact lead label, Ads ID and transaction-ID logic. This verifies deployed configuration, not Google Ads receipt; no fake conversion was sent.

The user's screenshot shows customer ID `122-147-0972`; this is not a website tag ID. Confirm the conversion action belongs to that account before activating a label.

1. Open Google Ads Goals → Conversions → Summary. Choose the existing successful enquiry action. Read its Conversion ID and Conversion Label from Tag setup / Use Google Tag Manager. If an existing GA4 import already represents the same enquiry, choose a single primary conversion path before adding direct tracking.
2. Configure `NEXT_PUBLIC_GOOGLE_ADS_ID` and `NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL` using those exact values. Optional meeting/click labels have separate variables in `.env.example`. Rebuild to activate public variables. Do not fabricate a label.
3. Use successful form submission as the primary enquiry action and Count = One for lead generation. Keep clicks secondary unless measuring actual qualified calls separately. Existing direct tracking sends the saved record ID as `transaction_id`.
4. For Meta, get the real Pixel ID from Events Manager and set `NEXT_PUBLIC_META_PIXEL_ID`. Leave this empty if a GTM container owns Meta. Disable account-side automatic events/automatic advanced matching if enabled; do not install the Pixel twice.
5. Verify accepted/declined consent, route navigation, one successful test enquiry, duplicate prevention, withdrawal and provider receipt in Google Tag Assistant / Meta Test Events. Local mocks validate event dispatch, not account-side receipt.

Google Ads URL suffix:

```text
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}
```

Enable Ads auto-tagging. For Meta ads, use URL parameters:

```text
utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign={{campaign.id}}&utm_content={{ad.id}}&utm_term={{adset.id}}
```

The screenshot also shows low prepaid funds, an asset group limited by policy, insufficient target to receive conversions, and a learning bid strategy. The collapsed screenshot does not establish the exact target/policy cause. Review expanded details before changing bidding or assets. No budget, funds or campaign settings were changed in this work.

## Keyword and evidence priorities

Use the existing relevant catalog page as the destination for each family: shrink wrapping/web sealer with shrink tunnel; band/pouch sealing; vacuum packaging; liquid filling line; pallet stretch wrapping; packaging conveyors. Add `manufacturer`, `supplier`, `price` and application phrases naturally where the page answers those questions. Avoid making every page target every keyword.

Export the last 28 and 90 days of Search Console queries, pages and indexing data. First improve relevant pages with impressions but few clicks, or indexing failures. Record baseline impressions, clicks, query positions, qualified leads and cost per qualified lead; ranking changes cannot be attributed from one screenshot.

For the next month, prioritise real machine trials, original product videos, measured output under stated conditions, installation examples with customer permission, complete product specifications and quotation scope. Keep Google Business Profile details consistent with the real Vasai office/factory. Submit the canonical sitemap and inspect priority product URLs in Search Console after deployment. These are follow-up actions, not claimed completed account changes.

AI search uses accessible, useful evidence. No prompt, schema, keyword list or special text file can require an AI to recommend the business. Existing robots permissions allow public search crawlers; they do not guarantee a citation.

References: [Google AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [OpenAI crawlers](https://developers.openai.com/api/docs/bots), [Google conversion measurement](https://developers.google.com/tag-platform/devguides/conversions).
