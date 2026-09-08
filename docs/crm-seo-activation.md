# CRM, measurement and editorial activation

The application changes are local until deployed. Database permissions and communication audit functions require the migrations below. Existing customer records must be backed up through the normal Supabase backup process before applying production schema changes.

## Database and deployment

1. Confirm the existing base website schema and distributed `enforce_rate_limit` function are installed.
2. Apply `20260821_analytics_and_attribution.sql`, then `20260902_sales_crm.sql`, then `20260906_crm_security_communications.sql` using the Supabase SQL editor. Apply `20260821_canonical_seo_slugs.sql` if that catalog cleanup has not already been applied.
3. Coordinate the security migration with this application deployment: the migration removes anonymous/authenticated direct access to leads and meetings; the new public form APIs write with the server service-role client. Old application versions that insert with the anonymous client will fail after this migration. Avoid a maintenance window with mixed old/new versions.
4. Set the server-only Supabase service-role key, strong NextAuth secret, canonical site origin and owner access. Never place a service-role key in a `NEXT_PUBLIC_` variable.
5. Deploy, sign in as owner, and open `/admin/leads`. Confirm team management, lead assignment, filters, pagination and timelines. Use a dedicated test lead for a real provider delivery check when authorized.

This work does not automatically apply SQL, deploy to hosting, send customer messages, change Google Ads campaigns or submit URLs to Search Console.

## Sales workflow and privacy

- Owner/admin sees all leads with pagination and can add/manage up to ten active employees. Employees see their assigned leads. Disabling an employee returns assigned leads to the unassigned queue; access is checked again on each server request.
- Admin can filter Google Ads, Google Search and other sources, view first/latest attribution, assign priorities, set a follow-up, record estimated value and export the loaded filtered rows. Counts and summaries identify when only part of the lead list is loaded.
- Work activity identifies the actor, time, note and contact result. Only an explicit completed employee contact report advances contact timestamps. A status change, booked website meeting, app launch or SMTP acceptance does not prove a conversation occurred.
- WhatsApp opens a draft in WhatsApp; Phone opens the device dialer. They do not provide in-browser calls, recordings, WhatsApp delivery receipts or automatic sending. Those features require separately configured provider accounts and integrations.
- Email can open the employee's email app or submit through the configured company SMTP server. Durable request reservations prevent automatic retry of the same request after an uncertain result, with a per-employee limit of 15 reservations per 15 minutes. `accepted` means the SMTP server accepted it, not that it reached the inbox. Check the provider for `pending` or `uncertain` results before creating a new send.
- Keep normal database access controls, backups and retention procedures in place. Application safeguards do not replace those operational controls. Server-side audit writes are restricted; a database administrator still controls the underlying database.

## Google measurement

Provide either a real `NEXT_PUBLIC_GTM_ID` (GTM container) or `NEXT_PUBLIC_GA_MEASUREMENT_ID` (direct GA4 tag). For direct Google Ads conversion events, also provide `NEXT_PUBLIC_GOOGLE_ADS_ID` and the appropriate conversion labels from the existing Ads account. Public values are compiled at build time, so rebuild after changing them.

In GTM mode, configure GA4 and Google Ads in the container. The app sends data-layer events and does not also send direct Ads conversion events; this avoids duplicate tracking. Map `record_id` to the Google Ads transaction ID for submitted lead/meeting events. Enable the appropriate Conversion Linker and consent handling in the container. Third-party tags load only after analytics consent.

Core events: `page_view`, `generate_lead`, `meeting_booked`, `whatsapp_click`, `phone_click`, `email_click`, `catalog_download`, `chat_open`, `chat_message`. Lead and meeting conversions fire only after a real record ID is returned. Contact clicks are separate intent signals; do not treat them as confirmed sales.

Turn on auto-tagging in Google Ads. A usable campaign suffix is `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}`. Some campaign types do not supply every ValueTrack parameter. Campaign IDs are shown as supplied; account campaign names, cost, impressions and ROAS need a separate Google Ads reporting connection. Organic search terms are generally not exposed by the browser; use Search Console for aggregate search-query performance.

The CRM stores first and latest campaign context and click IDs (`gclid`, `gbraid`, `wbraid`, `msclkid`) with the enquiry. An earlier paid click is never mixed into a later organic touch. Browser-reported attribution is useful context, not an authoritative Ads account report. Customer name, email, phone and message are excluded from measurement event payloads.

Verification: use Tag Assistant and the real account after configuration; test accept/decline consent, a tagged landing page followed by an internal link, one form submission, and one click action. Do not configure both automatic and manual page views for the same route in GA4/GTM.

Official references: [Google consent setup](https://developers.google.com/tag-platform/security/guides/consent), [Google Ads auto-tagging](https://support.google.com/google-ads/answer/3095550).

## Content and SEO

Twenty distinct versioned guides live in `src/lib/editorial-guides.ts`, alongside existing CMS articles. A published CMS article with the same slug takes precedence. Guides include local machine photos, contextual internal links, related machines/services and an enquiry form. Editorial product aliases resolve against the published catalog, and unavailable products render as text instead of broken links. Edit versioned articles in that module, or publish a CMS article under the same slug to override one.

The sitemap includes the published catalog, categories, services, 20 city hubs, 36 state/union-territory hubs, city-machine pages, all public blogs, the international enquiry hub and article/product images. It deduplicates URLs and uses content dates. After deployment, submit `/sitemap.xml` in Search Console and inspect representative product, service and article URLs.

International content collects destination-specific requirements without inventing foreign offices or guaranteed supply coverage. Add more local pages only when there is useful local application, delivery or support information. No implementation can guarantee first position for all keywords or countries. [Google's spam policies](https://developers.google.com/search/docs/essentials/spam-policies) cover doorway and scaled-content abuse.

## Checks

`npm run build`, `npm run verify:auth`, `npm run verify:attribution`, `npm run verify:crm`, and `npm run verify:seo -- http://localhost:3100` cover compilation, auth behavior, campaign/consent handling, isolated CRM security contracts and rendered SEO assets. CRM contract tests mock database and SMTP calls; they do not validate production SQL execution or real delivery.
