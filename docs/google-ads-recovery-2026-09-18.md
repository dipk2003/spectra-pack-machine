# Spectra campaign recovery — 18 September 2026

Status: campaign changes prepared, not applied to Google Ads. No connected browser/account was available. Website changes deployed successfully to production: Vercel deployment `dpl_FuoxkYtZuQEohMa6o67fkTxJCAqy`, state READY, aliased to https://spectrapackmachines.com. Post-deployment HTTP audit passed: 176 rendered pages, 795 sitemap URLs, all 30 new articles in sitemap, metadata, unique titles and invalid-route checks. Interactive enquiry submission and account-side conversion receipt were not tested. Source changes remain uncommitted locally; GitHub CLI authentication needs renewal before repository synchronisation.

## Evidence and measurement gate

Owner screenshots, 11–17 September: Performance Max campaign “Campaign #1 Spectra”, 437 clicks, 8,069 impressions, 5.42% CTR, ₹1.11 average CPC, ₹484.40 spend, zero recorded conversions. Total budget ₹2,000, dates 13–27 September. Asset group restricted by Misleading Ad Design; image section shows the warning. Exact rejected image IDs are not visible. A low CPC alone does not establish lead quality.

Local `.env` has no configured GTM, GA4 or lead conversion labels. Code falls back to Ads ID AW-18443957872, but that ID alone cannot send a labelled lead conversion. Production environment and account-side GA4 imports/GTM configuration remain unverified. Do not invent labels or assume zero recorded conversions means zero real enquiries.

Follow-up deployment inspection: `vercel.json` does configure GA4 `G-49TN7HKQEX` and Ads `AW-18443957872` for runtime and build. Thus the empty local `.env` does not establish missing production base tags. No lead conversion label is declared in that file; dashboard environment variables and account-side conversion imports still need inspection.

Production environment-name inspection through Vercel confirmed no direct Ads conversion-label variables and no GTM variable. Account-side GA4 conversion imports remain unknown. Vercel access is working; GitHub CLI authentication is invalid. Category changes passed the production build and attribution/consent contract checks locally. Live Ads/Search Console operations still require a connected signed-in browser.

Before bidding changes: inspect Goals > Conversions, identify the existing website lead action, copy its real conversion ID/label into deployment configuration (or map `generate_lead` through the existing GTM container), rebuild, and verify with Tag Assistant. Only a successfully stored lead emits `generate_lead`; use `record_id` as transaction ID. Use one primary conversion path per lead, avoiding duplicate GA4-import/direct Ads counting. Keep phone/WhatsApp clicks as secondary intent signals unless actual qualified calls are measured. Preserve consent handling. Compare CRM enquiries with Ads reporting and allow for attribution delay.

## Existing campaign changes to apply after account inspection

- Keep the ₹2,000 total cap and existing end date unless the owner requests a new budget/date.
- Open policy details and identify the specific restricted assets. Replace only offending images with genuine, clear machine photographs without fake buttons, playback controls or misleading UI. Do not blindly remove all images or assume AI generation itself caused the restriction. Request review after correcting the issue.
- Replace generic themes such as `india` with relevant buying-intent themes below. Search themes are signals, not exact-match targeting. Inspect actual search terms and placement reporting before excluding traffic.
- Separate shrink wrapping, sealing and filling assets when matching product pages and authentic photographs are available. Avoid mixing every machine family into one ad message. With this small budget, prioritise the machine family with proven commercial demand; do not create multiple additional funded campaigns automatically.
- Check location targeting against actual delivery/support markets. For a domestic campaign, consider the presence option to focus on people in the target locations. Do not infer a target location from the search theme `india`.
- Use the matching product/category page as final URL. Check final URL expansion and exclude irrelevant destinations if enabled. Add campaign attribution: `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}`; enable auto-tagging.
- Review terms before adding exclusions. Candidate irrelevant terms: jobs, vacancy, salary, internship, diy, homemade. Do not broadly exclude `price`, `catalog`, `manual` or `repair`: these can represent useful buyers or service demand.

## Replacement asset set: shrink wrapping

Use only for a shrink-wrapping group with matching photos and destination. These are drafts, not an assurance of approval or improved results.

15 headlines (maximum 30 characters each):

1. Shrink Wrapping Machines
2. Spectra Pack Machines
3. Web Sealer With Shrink Tunnel
4. Bottle Shrink Wrapping
5. Carton Shrink Wrapping
6. Automatic Web Sealers
7. Semi Automatic Web Sealers
8. L Sealer With Shrink Tunnel
9. Heavy Duty Shrink Tunnels
10. Compare Machine Options
11. Request a Machine Quote
12. Discuss Your Pack Size
13. Plan Your Packaging Line
14. Packaging Machine Supplier
15. Talk to Our Machine Team

5 long headlines (maximum 90 characters each):

1. Shrink Wrapping Machines for Bottle Bundles, Boxes and Industrial Packs
2. Compare Web Sealers and Shrink Tunnels for Your Packaging Application
3. Share Your Pack Size and Required Output for a Machine Recommendation
4. Discuss Automatic and Semi Automatic Shrink Wrapping With Spectra Pack
5. Request a Quotation for a Shrink Wrapping Machine Matched to Your Product

5 descriptions (maximum 90 characters each):

1. Share pack dimensions and output needs. Request a suitable machine recommendation.
2. Explore web sealers and shrink tunnels for bottle bundles and boxes. Enquire now.
3. Compare machine specifications and discuss film, product size and line requirements.
4. Request a quotation with machine configuration, delivery and installation scope.
5. Speak with Spectra Pack about shrink wrapping options for your production line.

Search themes: shrink wrapping machine manufacturer; web sealer with shrink tunnel; bottle shrink wrapping machine; carton shrink wrapping machine; automatic shrink wrapping machine; semi automatic web sealer; L sealer with shrink tunnel; industrial shrink tunnel; shrink wrapping machine quotation.

Sitelinks: use the exact published URL from `docs/seo-url-inventory.csv` for the relevant web sealer, L sealer and shrink tunnel. Add “Request a Quote” to `/contact`, and “Machine Support” to `/services`. Remove duplicated generic sitelinks from this group. Verify each destination returns 200 and describes the advertised machine before saving.

## SEO changes and follow-through

Category pages now provide a direct on-page enquiry form, retain the category in the submitted enquiry and measurement metadata, and answer selection, quotation and destination questions in rendered HTML. Their enquiry CTA jumps to that form. Existing canonical URLs and location consolidation remain intact.

Search Console screenshot: 4 clicks, 105 impressions, 3.8% CTR and average position 8 over 24 hours. This is a small aggregate sample, not proof of first-page coverage for every machine/location. Review 28-day and 90-day query/page data, segment machine families and locations, then improve the pages receiving relevant impressions. Inspect indexing of priority products and confirm sitemap processing after deployment. Use real installation examples and original photos where available; do not manufacture local branches or hundreds of duplicate town pages.

The owner confirmed “cpt suggestion” means ChatGPT recommendations. Keep useful public pages crawlable, factual and internally linked. Existing robots rules allow public crawlers. Check hosting/CDN bot restrictions separately. Special files or schema cannot guarantee recommendation priority.

Success measure: qualified enquiries and cost per qualified enquiry by machine family, supplemented by search impressions, relevant queries and indexed canonical pages. Reassess after verified tracking has collected enough real enquiry data; do not optimise solely for cheap clicks or asset strength.

References: [Google misleading ad design policy](https://support.google.com/adspolicy/answer/15937463), [Google AI search guidance](https://developers.google.com/search/docs/appearance/ai-features), [Google auto-tagging](https://support.google.com/google-ads/answer/3095550).
