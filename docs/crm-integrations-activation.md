# CRM Ads reporting and conversation integrations

Deployment status: production `dpl_3v6o6a9QF7mQeB23yRFuLjZroDM3` is READY and aliased to spectrapackmachines.com. Build, mocked provider/security tests and isolated PostgreSQL migration tests passed. Anonymous integration API and cron requests returned 401; admin page redirected to login; unconfigured WhatsApp receiver returned 503. Interactive authenticated UI/provider receipt remains unverified. Production database integration tables are missing (read-only queries returned PGRST205); migration is NOT applied. Reporting/WhatsApp/phone credentials are NOT configured. CRON_SECRET is stored privately in Vercel Production. Source remains uncommitted.

The user confirmed there is no calling provider and WhatsApp is the Business app without API access. These connectors do not turn a normal SIM or app into an API and do not import old app chats. No provider signup, number migration, customer message, call or recording was performed.

## Available implementation

- Owner/admin: `/admin/integrations` (Ads & Conversations in the sidebar). Staff cannot access the reports or unmatched inbox. Events attached to a lead appear in that lead's existing scoped activity history.
- Google Ads reporting: OAuth refresh, approved Cloud project, campaign/day cost, impressions, clicks, primary conversions and configured conversion value. Micros are converted to account currency units. All conversion types contribute to cost per Ads conversion, so this is not claimed as qualified CPL.
- Meta reporting: campaign/day insights, spend, impressions, clicks, reported leads and purchase value. Overlapping action aliases are not added together. Pagination uses a trusted endpoint and cursor, not provider-supplied URLs.
- Daily Vercel cron at `15 2 * * *` UTC, gated by a random server-side `CRON_SECRET`, refreshes 30 completed days to catch delayed attribution. Manual sync supports up to 90 days. Responses are fully collected before an atomic database replacement; failed reports retain prior data. No automatic provider retry is attempted after a timeout; the next scheduled or manual run retries the period.
- WhatsApp: signed Cloud API webhook receives inbound text/button messages and delivery/read/failure events for the configured phone number ID. Media is described without fetching private attachments. Outbound message bodies and old Business app chats are not provided by these callbacks. This implementation does not send WhatsApp messages.
- Optional Twilio receiver: official SDK verifies signature, configured account and exact callback URL. Stores call status/duration and provider-generated transcript/recording status callbacks if already configured. It does not initiate calls, enable recordings, fetch recordings or generate transcripts. This is a prepared adapter, not a choice/purchase of a calling provider.
- Exactly one full international-phone match attaches an event to a lead. Ambiguous/no matches remain in owner inbox. Owner can link an unmatched event using an existing lead UUID. Provider events do not update confirmed-human-contact timestamps or mark sales won.
- ROAS limitation: UI labels the ratio **platform-reported value / spend**. It is meaningful as revenue ROAS only if actual purchase revenue is configured in the provider. Estimated CRM deal amounts are not revenue. There is no payment/invoice integration in this change; real cash-revenue ROAS remains unavailable until revenue is supplied by a verified source.

## Activate database

Apply `supabase/migrations/20260926_crm_integrations.sql` after existing 20260906 CRM security migration in the Supabase SQL editor. It adds three private tables and three service-role RPCs. Browser anon/authenticated roles have no access. It does not alter existing leads or remove existing data. Existing service-role REST access cannot apply database DDL; a Supabase management token or SQL-editor session is required.

## Connect Google Ads (customer 122-147-0972)

Set server-only hosting variables from `.env.example`: `GOOGLE_ADS_CUSTOMER_ID=1221470972`, `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`. The refresh token needs the `https://www.googleapis.com/auth/adwords` scope and an authorized account user. If using a manager account, set `GOOGLE_ADS_LOGIN_CUSTOMER_ID`. API version defaults to v23; update `GOOGLE_ADS_API_VERSION` before its sunset. The existing AW tag/lead conversion label are separate and cannot provide reporting access.

No OAuth consent UI is implemented; obtain the authorized refresh token through the account's approved OAuth flow, then store it in Vercel secrets. Never paste credentials into chat or public settings. Redeploy after environment changes. Run Sync reports and compare the same dates, account timezone, currency and conversion definition with Google Ads. The developer panel only marks reporting healthy after a recent successful sync covering its full period.

## Connect Meta Ads and WhatsApp separately

Meta Ads: set `META_AD_ACCOUNT_ID`, a token with read access to that account (`META_ADS_ACCESS_TOKEN`), and the currently supported `META_GRAPH_VERSION` for the app, such as `vNN.0`. A Pixel ID is not an Insights API credential.

WhatsApp: complete official Business Platform/API onboarding. If retaining the existing Business app/number, first confirm whether the account is eligible for app/API coexistence; do not migrate blindly. Set `WHATSAPP_APP_SECRET`, a random `WHATSAPP_VERIFY_TOKEN`, and `WHATSAPP_PHONE_NUMBER_ID`. Subscribe the app to the business account's messages webhook at `https://spectrapackmachines.com/api/webhooks/whatsapp`. Verify the challenge, then test a real inbound message and status callback. Tokens/secrets must match the same app/account. Historical chats are outside this receiver's scope.

Phone: no service is currently selected. If Twilio is later used, configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_WEBHOOK_URL=https://spectrapackmachines.com/api/webhooks/twilio`. Point provider status callbacks to that exact URL. Directionless callbacks remain unmatched, so they cannot attach to a wrong customer. If another provider is chosen, implement its signature/payload adapter instead of entering its credentials as Twilio credentials. Do not enable recording/transcription without the business's appropriate notices and consent workflow.

## Validation and limitations

`npm run verify:integrations` uses mocked network calls: dates, currency isolation, micros, Meta alias overlap/pagination, signature tampering, account/phone scoping, stable event keys and body-size bounds. `node scripts/verify-integration-sql.mjs` uses a temporary PGlite installation under `.tmp/integration-sql` for transactional replacement/rollback, duplicate delivery, ambiguous phone matches, owner linking and denied anonymous access. `npm run verify:crm` covers existing employee scope/CSRF/communication contracts. These tests do not establish real provider receipt or account permissions.

Provider HTTP requests have timeouts. Large reports may require shorter manual ranges. Read view caps conversation events at 100 (clearly labelled), not full historical pagination. Provider retention and CRM data retention need business administration. Webhook failures return non-2xx for provider retry, with durable deduplication for already stored events.

Official references: [Google reporting REST](https://developers.google.com/google-ads/api/rest/common/search), [Google API lifetime](https://developers.google.com/google-ads/api/docs/sunset-dates), [Meta Insights](https://developers.facebook.com/docs/marketing-api/insights/), [WhatsApp webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components), [Twilio signature validation](https://www.twilio.com/docs/usage/webhooks/webhooks-security).

Google access correction (26 September 2026): developer tokens were sunset on 9 September 2026. GOOGLE_ADS_DEVELOPER_TOKEN is optional legacy configuration; authorize the OAuth client Cloud project for production Ads API access. See https://developers.google.com/google-ads/api/docs/api-policy/developer-token .
