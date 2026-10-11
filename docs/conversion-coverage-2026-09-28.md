# Conversion coverage before campaign changes

The website uses direct Google tagging in production. The configured Google Ads account tag is `AW-18443957872`; its Contact action label is `hgSBCLmv9fwcEPDs4dpE`. Consent is required before analytics or advertising events run. Form and meeting events run only after the API returns a saved record ID. Generic engagement events are routed to GA4; separate Google Ads `conversion` events run only where a matching action label is configured.

| Customer action | Website event | Current measurement | Google Ads setup needed |
| --- | --- | --- | --- |
| Contact, product, category, homepage, guide or chat enquiry successfully saved | `generate_lead` | First-party + GA4 + Ads Contact action | Contact is primary, Count One. Do not also bid on an automatically detected duplicate form action. |
| Meeting successfully booked | `meeting_booked` | First-party + GA4 | Create a separate meeting action and set its label in `NEXT_PUBLIC_GOOGLE_ADS_MEETING_LABEL`; primary only if a booking is a qualified business lead. |
| Customer taps a website phone link | `phone_click` | First-party + GA4 | Create a separate website phone-click action and set `NEXT_PUBLIC_GOOGLE_ADS_PHONE_LABEL`; normally secondary. A tap does not confirm a completed call. |
| Customer taps a website WhatsApp link | `whatsapp_click` | First-party + GA4 | Create a separate action and set `NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_LABEL`; normally secondary until a real conversation can be verified. |
| Customer taps a website email link | `email_click` | First-party + GA4 | Optional separate action and `NEXT_PUBLIC_GOOGLE_ADS_EMAIL_LABEL`; secondary. A tap does not confirm an email was sent. |
| Customer opens the catalog PDF | `catalog_download` | First-party + GA4 | Optional separate action and `NEXT_PUBLIC_GOOGLE_ADS_CATALOG_LABEL`; secondary. |
| Customer opens the site chat | `chat_open` | First-party + GA4 | Optional separate action and `NEXT_PUBLIC_GOOGLE_ADS_CHAT_LABEL`; secondary. An actual saved chat enquiry already fires `generate_lead`. |
| Customer calls directly from an ad | Google Ads call reporting | Google Ads account action, independent of site code | Verify call reporting, forwarding number, duration threshold and duplicate `Calls from ads` actions in the Ads account. |

The Google Ads screenshot shows three call actions, Contact, and an automatic Request quote form action. The Contact action now shows **Awaiting conversions**. Before changing campaign goals, inspect the automatic Request quote and multiple call actions to avoid duplicate primary credit. The website's `phone_click` cannot be used to claim a completed phone call; actual call measurement requires Google's call reporting/forwarding setup or a verified phone-provider event.

Google defines **Awaiting conversions** as no conversions recorded for the action in the last seven days; it is different from **Misconfigured**. A direct website test without an attributable ad interaction can verify the tag but need not increase the campaign's conversion column. Do not manufacture a test ad click or count a tap as a completed call just to change the status. [Google Ads status definitions](https://support.google.com/google-ads/troubleshooter/13455130?hl=en).

Account work to complete once signed-in access is available:

1. Open each existing action's settings and source. Keep the manually tagged Contact action as the single saved-enquiry goal (Count One), then check whether the automatically detected Request quote action would count the same submission. If so, observe it as Secondary rather than duplicate Primary credit.
2. Inspect both `Calls from ads` actions and `Click to call`. Verify their exact call types, call reporting, forwarding-number availability and minimum call duration. Keep a verified meaningful-call action for bidding; observe duplicate/click-only actions as Secondary. Website `tel:` taps are measured separately.
3. Create distinct website actions for completed meeting bookings and website phone/WhatsApp/email/catalog/chat interactions where Google Ads reporting is wanted. Copy each unique event label into its matching Vercel `NEXT_PUBLIC_GOOGLE_ADS_*_LABEL` setting, redeploy, and verify in Tag Assistant. Contact/qualified meeting can be Primary where appropriate; click/open actions should be Secondary.
4. Check the campaign's actual goal selection and Ads call assets only after these actions are verified. Campaign keyword, asset, audience and bidding optimisation remains a later task as requested.

Only the Contact action has a production Ads event label. The optional labels cannot be inferred from the AW tag ID. Create or inspect each separate Ads action in account `122-147-0972`, copy its exact event-snippet label, set the matching production environment variable, and redeploy. Keep interaction-only actions secondary so Smart Bidding does not treat a click as a qualified enquiry. Google documents [primary and secondary actions](https://support.google.com/google-ads/faq/10286469) and [call conversion types](https://support.google.com/google-ads/answer/6100664).

Read-only evidence on 28 September: first-party analytics has recorded form leads, website phone taps, WhatsApp taps and chat opens. This establishes site-side events for those channels, not Google Ads receipt. The two owner test leads had no captured Google Ads click ID and were not attributable to an ad click. No customer details were retrieved for this audit.
