# Environment settings: kahan se milegi

`.env.example` template hai, secrets rakhne ki file nahi. Local development: `.env.local`. Live: Vercel → spectra-pack-machine → Settings → Environment Variables → Production, then redeploy. Existing local/live values ko empty template se overwrite mat karna. NEXT_PUBLIC values browser bundle mein ja sakti hain; private keys ko kabhi is prefix mein mat rakhna.

## Already configured / keep as-is

| Variable | Value / source |
| --- | --- |
| SITE_ORIGIN, NEXTAUTH_URL | Live site: https://spectrapackmachines.com. Local dev origins can differ; each variable contains only one URL. |
| NEXTAUTH_SECRET | Existing live secret is configured. Keep it; replacing logs out existing sessions. For a genuinely new environment generate a random secret locally, not a provider key. |
| ADMIN_NAME | Your display name, Dipanshu. |
| ADMIN_EMAIL, ADMIN_PASSWORD | Optional environment-owner fallback in this app. Supabase login is already configured; these may remain empty. They are not your Google account credentials. |
| NEXT_PUBLIC_SUPABASE_URL | Supabase project → Connect dialog → Project URL. Already configured. |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY | Same Connect dialog or Settings → API Keys → publishable key. Already configured. |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Settings → API Keys → server secret key or legacy service_role key. This app's variable retains the old name. Already configured; never copy into NEXT_PUBLIC. |
| DEVELOPER_OWNER_USER_ID | Supabase Authentication → Users → your actual owner user → UUID. Current vercel.json has the existing owner UUID; preserve it. It is not the project ID. |
| DEVELOPER_ADMIN_NAME | Display label, dipanshu. |
| NEXT_PUBLIC_GA_MEASUREMENT_ID | G-49TN7HKQEX, configured in vercel.json. GA4 Admin → Data streams → Web → Measurement ID. |
| NEXT_PUBLIC_GOOGLE_ADS_ID | AW-18443957872, confirmed by your Google tag screenshot and configured. |
| NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL | hgSBCLmv9fwcEPDs4dpE, from your Contact conversion event snippet, configured. |
| NEXT_PUBLIC_BING_UET_TAG_ID | 187271989, existing configuration. Microsoft Advertising → UET tags. |
| CRON_SECRET | Random secret generated and stored in Vercel Production during this task. Keep it; it is not obtained from Google. |

## Optional website tags

| Variable | Source / whether needed |
| --- | --- |
| NEXT_PUBLIC_GTM_ID | Google Tag Manager container → GTM-... ID. Leave blank for the existing direct Google tag setup. Setting GTM changes ownership of conversions to the container; configure it before switching. |
| NEXT_PUBLIC_GOOGLE_ADS_MEETING_LABEL | Separate booked-meeting conversion action's event snippet in Google Ads. Optional. |
| NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_LABEL | Separate WhatsApp-click conversion action label. Optional; secondary intent, not a confirmed lead. |
| NEXT_PUBLIC_GOOGLE_ADS_PHONE_LABEL | Separate phone-click conversion action label. Optional; a click does not mean answered call. |
| NEXT_PUBLIC_GOOGLE_ADS_EMAIL_LABEL | Separate email-click conversion action label. Optional. |
| NEXT_PUBLIC_GOOGLE_ADS_CATALOG_LABEL | Separate catalog-download conversion action label. Optional. |
| NEXT_PUBLIC_GOOGLE_ADS_CHAT_LABEL | Separate chat-open conversion action label. Optional. |
| NEXT_PUBLIC_META_PIXEL_ID | Meta Events Manager → select your Pixel/dataset → Settings → Pixel/dataset ID. Leave empty if using GTM for Meta. |
| NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION | Search Console URL-prefix property → ownership verification → HTML tag → only the content value. Domain properties use DNS instead. Existing app has a fallback verification tag; avoid replacing a working verified setup without reason. |
| NEXT_PUBLIC_TURNSTILE_SITE_KEY | Cloudflare dashboard → Turnstile → widget for your domain → Site Key. Optional anti-bot integration. |
| TURNSTILE_SECRET_KEY | Same Turnstile widget → Secret Key, server-only. Configure both Turnstile keys together. |

Google labels: Goals → Conversions → select the appropriate action → Tag setup → event snippet. Copy only the substring after `/` in `send_to: 'AW-.../LABEL'`. Do not reuse the lead label for every click event.

## Email and chatbot (already configured on production)

| Variable | Source |
| --- | --- |
| GEMINI_API_KEY | Google AI Studio → API keys. Existing key is configured; no replacement needed. |
| SMTP_HOST | Your business email provider's outgoing-mail/SMTP settings. |
| SMTP_PORT | Provider's SMTP port, commonly 587 for STARTTLS or 465 for implicit TLS. Follow their settings. |
| SMTP_SECURE | false for 587/STARTTLS; true for 465/implicit TLS in this app. |
| SMTP_USER | SMTP mailbox/login username supplied by your email provider. |
| SMTP_PASS | SMTP credential/app password supplied by that provider. It is not automatically your regular mailbox password. |
| SMTP_FROM_EMAIL | An authorized/verified sender mailbox for that SMTP account. |
| OWNER_NOTIFICATION_EMAIL | Your chosen destination for enquiry notifications. |

## Google Ads reporting (new connection needed)

Website measurement tags do not grant account reporting access.

| Variable | Source |
| --- | --- |
| GOOGLE_ADS_CUSTOMER_ID | 1221470972 (your screenshot's 122-147-0972 without hyphens). |
| GOOGLE_ADS_DEVELOPER_TOKEN | Optional legacy value. Google sunset mandatory developer tokens on 9 September 2026. Leave empty for the new Cloud-project access flow. |
| GOOGLE_ADS_CLIENT_ID | Google Cloud project → Google Auth Platform → Clients (or APIs & Services → Credentials) → OAuth client ID. |
| GOOGLE_ADS_CLIENT_SECRET | The same OAuth client's secret. Store server-side only. |
| GOOGLE_ADS_REFRESH_TOKEN | Generated by an OAuth authorization flow with offline access and the adwords scope; not copied from Google Ads settings. The authorizing user must have access to this Ads account. |
| GOOGLE_ADS_LOGIN_CUSTOMER_ID | Only if requests go through a Google Ads manager account: manager customer ID without hyphens. Otherwise blank. |
| GOOGLE_ADS_API_VERSION | v23 in this connector; an API version, not a key. |

Setup sequence:

1. Open Google Cloud Console, select/create the project used by your OAuth client, enable Google Ads API, and check its Overview page for the required production API access level.
2. Configure the OAuth app/audience and consent details, then create an OAuth client. The redirect URL must match the authorization flow you use; this CRM does not currently provide a built-in Google OAuth callback.
3. Complete the authorized OAuth flow with `https://www.googleapis.com/auth/adwords`, offline access, using the same client. Store its refresh token privately. External apps left in Testing may get short-lived refresh tokens; use the appropriate production app configuration.
4. Put the customer ID, Client ID, Client Secret and Refresh Token into Vercel Production. Redeploy, then Ads & Conversations → Sync reports. Confirm same-date values in Google Ads.

## Meta Ads (when an ad account is ready)

Meta menu names vary by account/app type; these are the usual locations. Current Meta documentation could not be fetched by the research tool during this session, so confirm the exact labels in your account.

| Variable | Source |
| --- | --- |
| META_AD_ACCOUNT_ID | Meta Ads Manager / Business settings → Ad accounts → account ID; this is not Pixel ID. |
| META_ADS_ACCESS_TOKEN | Meta Business settings → System users: assigned app and ad account, generate a token with ads_read access, or use the app's approved user OAuth flow. A token without access to the selected ad account will not work. |
| META_GRAPH_VERSION | Supported version shown for your Meta app/API setup; enter the format vNN.0. Do not enter an app ID. |

## WhatsApp Business API (not the existing app alone)

| Variable | Source |
| --- | --- |
| WHATSAPP_APP_SECRET | Meta Developers → your app → App settings → Basic → App Secret. |
| WHATSAPP_VERIFY_TOKEN | You generate a random secret; enter the exact same value here and in Meta webhook verification settings. It is not an access token. |
| WHATSAPP_PHONE_NUMBER_ID | App → WhatsApp → API setup, after registering the business phone number. Numeric API resource ID, not your mobile number. |

Webhook callback: `https://spectrapackmachines.com/api/webhooks/whatsapp`. Complete official onboarding and subscribe messages. If keeping the existing Business app/number, check account eligibility for coexistence before any migration. Do not assume old chats will sync. This receiver handles inbound messages and delivery events; sending API messages is not implemented.

## Phone integration (skip now: no calling provider)

| Variable | Source |
| --- | --- |
| TWILIO_ACCOUNT_SID | If Twilio is chosen later: Twilio Console → Account Info → Account SID. |
| TWILIO_AUTH_TOKEN | Same Twilio Console → Auth Token. |
| TWILIO_WEBHOOK_URL | Fixed callback: https://spectrapackmachines.com/api/webhooks/twilio. Enter exactly the same URL in provider callback settings. |

You do not need to open a paid Twilio account merely to fill this template. Phone status/transcript syncing requires a real connected calling setup.

## Database prerequisite

Before the new reporting/inbox can store data, apply `supabase/migrations/20260926_crm_integrations.sql` in Supabase SQL Editor after existing CRM migrations. The migration was tested in isolated PostgreSQL, but production tables were confirmed missing during this task. Existing service-role REST keys cannot execute this DDL. No secret needs to be shared in chat to run the SQL through your signed-in Supabase dashboard.

## Sources

- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Supabase keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Google developer-token sunset and Cloud access](https://developers.google.com/google-ads/api/docs/api-policy/developer-token)
- [Google OAuth workflow](https://developers.google.com/google-ads/api/docs/oauth/user-authentication)
- [GA4 Measurement ID](https://support.google.com/analytics/answer/12270356)
- [Search Console verification](https://support.google.com/webmasters/answer/9008080)
- [Turnstile keys](https://developers.cloudflare.com/turnstile/get-started/)
- [Gemini API key](https://ai.google.dev/gemini-api/docs/get-started)
- [Twilio credentials](https://www.twilio.com/docs/twilio-cli/general-usage/profiles)
