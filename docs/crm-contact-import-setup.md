# CRM email, phone and Excel import

## Email

The local SMTP connection check on 2026-09-30 returned `EAUTH`, SMTP `535` during authentication. No customer email was sent by this check. The configured credentials were rejected; successful delivery remains blocked until the SMTP account is corrected in the deployed environment.

Update `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` and `SMTP_FROM_EMAIL` through the deployment's secret settings. For Gmail password authentication, use a valid app password. Restart/redeploy after changing environment variables. Do not put passwords in source control or chat.

The CRM now distinguishes a rejected login, connection failure, rejected sender/recipient and an ambiguous send. Confirmed failures can be retried. Accepted and ambiguous submissions keep their request ID to avoid duplicate sends. Gmail and Outlook browser draft options are available when desktop mail handlers are unavailable; the employee must send the draft in that app.

## Plivo India callback calling

The CRM calls the employee's registered mobile, then connects the customer when the employee answers. This works from a desktop without a softphone. Audio stays on the phones, not in the browser. Both legs are billed; audio recording is not enabled.

1. Create a Plivo India account and complete provider onboarding/KYC and number activation for the intended customer enquiry calls.
2. Apply `supabase/migrations/20260930_crm_phone_calls.sql` after the existing CRM migrations.
3. Configure server-only secrets: `PLIVO_AUTH_ID`, `PLIVO_AUTH_TOKEN`, `PLIVO_CALLER_ID` (activated Indian number), and `CRM_CALL_PUBLIC_URL` (public HTTPS site origin).
4. Configure `CRM_CALL_AGENT_PHONES` as JSON mapping CRM login emails to employee mobiles, for example `{"agent@example.com":"+919876543210"}`. Use actual verified employee numbers. Customers cannot choose or override these callback numbers.
5. Deploy. The callback endpoint `/api/webhooks/plivo/[requestId]` must be publicly reachable. It validates Plivo V3 signatures, the reserved call, destination, expiry and call identity. No separate callback URL needs to be entered in the provider console; each request supplies it.
6. In a lead, choose Phone → CRM callback → Call from CRM. Test with consenting staff test numbers before customer use. A queued request does not confirm the customer answered. Record the result in the CRM work update.

Durable request reservations prevent duplicate submissions on retry. After checking/ending a previous call, use “Prepare a new call” for another attempt. Ambiguous provider timeouts are never retried automatically. Only Indian destinations are supported; calls have a 30-minute limit.

Published pricing checked on 2026-09-30: [Plivo](https://www.plivo.com/voice/pricing/in/) lists ₹0.38/min per domestic leg, ₹200/month per number and 30-second billing pulses. A two-leg connected call is approximately ₹0.76/min plus number rental and any applicable taxes/other account charges. For 1,000 fully connected minutes, the simple estimate is ₹960 before taxes and additional usage. Verify the final account quote and eligibility. [Exotel](https://exotel.com/pricing/business-phone-system/) lists a ₹9,999 entry package with five-month validity; this has a different rental/credit structure, so it is not a per-minute comparison.

API references: [Plivo calls](https://www.plivo.com/docs/voice/api/calls), [routing XML](https://www.plivo.com/docs/voice/xml/routing), [webhook signatures](https://www.plivo.com/docs/voice/concepts/signature-validation), [India onboarding](https://www.plivo.com/docs/voice/concepts/india-calling).

## Excel import

Use Sales CRM → Import Excel. Download the `.xlsx` template or choose an `.xlsx`/`.csv` file, select a worksheet, match columns and review the preview. The first row contains headings. Each lead requires a name and a phone or email. Supported fields: name, phone, email, company, machine interest, notes. Keep phone columns formatted as Text. Replace formulas with values. Older `.xls` files must be saved as `.xlsx` first.

Limit: 200 leads and 5 MB per upload. Invalid rows block the whole batch before writes. Imports create new leads assigned to the importing employee. Matching phone/email in leads visible to that employee and duplicates inside the file are skipped. Existing records are never updated. Exact row retries also use stable database IDs, including after a lost response. The new import endpoint needs no additional database migration.

Validation commands: `npm run verify:crm`, `npx tsx scripts/verify-crm-import-calling.ts`, `npx tsc --noEmit`, `npm run build`.

## Verification recorded

The production build, TypeScript checks, existing CRM security suite and the new import/calling suite passed. Targeted lint for the changed implementation files passed. Isolated Chrome checks used the production build with mocked CRM API writes: real XLSX loading, mapping/preview, import result, invalid CSV rejection, call retry request IDs, email authentication error/retry, Gmail selection and 390px mobile layout passed without browser console errors. No real customer calls, emails or lead imports were made during verification. Live SMTP delivery and Plivo connection remain unverified until valid provider configuration is supplied. The phone migration has not been applied to a live database and these changes have not been deployed.
