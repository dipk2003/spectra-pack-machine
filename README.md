# Spectra Pack Machines

Industrial lead-generation website and internal CMS for Spectra Pack Machines. The project combines a public product catalog, SEO landing pages, blog publishing, enquiry capture, meeting scheduling, automated emails, and an authenticated admin dashboard backed by Supabase.

## Portfolio Import Sheet

Use this block directly for your project form or portfolio CMS.

| Field | Value |
| --- | --- |
| GitHub Repo URL / owner/repo | `https://github.com/dipk2003/spectra-pack-machine` |
| Quick Import from GitHub | `https://github.com/dipk2003/spectra-pack-machine` |
| Replace existing values | `Yes` |
| Title | `Spectra Pack Machines` |
| Short Description | `A production-ready B2B packaging machine website with admin CMS, AI sales chatbot, lead capture, meeting scheduling, blog management, and city-focused SEO landing pages.` |
| Live URL | `https://spectrapackmachines.com` |
| Repo / Proof URL | `https://github.com/dipk2003/spectra-pack-machine` |
| Status | `Live / Production` |
| Featured project | `Yes` |
| Slug | `spectra-pack-machines` |
| Domain quick tags | `Dashboard` |
| Project Domains | `Manufacturing Website, Industrial Website, B2B Catalog, Lead Generation, CMS, Local SEO` |
| Tech Stack | `Next.js 14, React 18, TypeScript, Supabase, NextAuth, Google Gemini, Nodemailer, Cloudflare Turnstile, Framer Motion` |
| Feature List | `Product catalog, category pages, blog CMS, admin dashboard, hero carousel CMS, lead forms, quote popup, meeting scheduler, AI chatbot, programmatic city SEO pages, email notifications, Supabase image uploads` |
| City Focus | `Mumbai, Delhi, Bangalore, Hyderabad, Ahmedabad, Chennai, Kolkata, Pune, Jaipur, Lucknow, Kanpur, Nagpur, Indore, Thane, Bhopal, Visakhapatnam, Vadodara, Surat, Noida, Gurgaon` |

### Suggested Tags

- `Next.js`
- `TypeScript`
- `Supabase`
- `CMS`
- `Admin Dashboard`
- `Industrial Website`
- `B2B Lead Generation`
- `SEO`
- `AI Chatbot`

## Project Summary

This codebase is not a simple brochure website. It is a full business website for an Indian packaging machine manufacturer with:

- A public-facing multi-page marketing site
- A product and category catalog
- Product detail pages with lead capture
- Blog listing and blog detail pages
- Contact and meeting-booking flows
- An authenticated admin panel
- CMS-style management for products, categories, blogs, catalog link, and homepage hero content
- AI-assisted sales chat with fallback logic
- Programmatic local SEO pages for multiple cities
- Automated thank-you, catalog, and meeting emails

## What The Project Actually Does

### Public Experience

- Homepage with hero carousel, category spotlight, FAQs, social proof, and lead popup
- Product category pages and individual product pages
- Blog list and blog detail pages
- About, Services, Clients, Contact, and Schedule Meeting pages
- WhatsApp floating CTA and AI sales chatbot
- Download catalog CTA
- Dynamic city + machine landing pages for local SEO

### Admin Experience

- Admin login using NextAuth credentials + Supabase Auth
- Dashboard for lead, meeting, blog, and product counts
- Product management
- Category management
- Blog management with hero image and article-side visuals
- Site settings to manage public catalog URL
- Site settings to manage homepage hero carousel slide content and media
- Lead and meeting review flows

### Conversion and Automation

- Contact form submits leads to Supabase
- Homepage popup captures quote-oriented leads
- Product pages also push enquiries to the leads API
- Meeting scheduler generates a Jitsi-style meeting link
- Nodemailer sends catalog, thank-you, and meeting emails
- AI sales chat can guide users, suggest products, and help move users into lead or meeting flows

## Key Numbers From The Codebase

- `29` product records in the product catalog seed data
- `6` machine-family categories
- `5` service entries
- `6` supported industry segments
- `20` SEO cities
- Dynamic city SEO route pattern: `/{city}/{machine}`

## Main Features

- Public catalog for shrink wrapping, sealing, vacuum packaging, conveyor, pallet wrapping, and end-of-line packaging
- Rich product detail pages with specs, FAQs, related products, and quote forms
- Category-level landing pages
- Blog CMS with featured image, body content, side visuals, and related category/product links
- Admin-managed homepage hero carousel
- Admin-managed public catalog download link
- AI chatbot using Google Gemini with structured fallback logic
- Lead capture from contact form, homepage popup, product pages, and chat
- Meeting booking flow with generated meeting links
- Email automation for catalog delivery and meeting confirmation
- JSON-LD, metadata, sitemap, and robots setup for SEO
- Programmatic city SEO pages across major Indian cities
- Supabase Storage image uploads for products, categories, blogs, and hero slides
- Rate limiting and anti-spam protection

## Tech Stack

### Frontend

- Next.js 14 App Router
- React 18
- TypeScript
- CSS Modules
- Framer Motion
- Lucide React
- React Hot Toast

### Backend and Data

- Supabase database
- Supabase Auth
- Supabase Storage
- Supabase Row Level Security
- Next.js Route Handlers
- NextAuth credentials strategy

### AI and Communication

- Google Gemini via `@google/genai`
- Nodemailer for transactional emails
- Jitsi-style meeting links
- Cloudflare Turnstile support for form verification

## Project Architecture

### App Routes

- `/` homepage
- `/about`
- `/services`
- `/services/[slug]`
- `/clients`
- `/contact`
- `/privacy-policy`
- `/schedule-meeting`
- `/blog`
- `/blog/[slug]`
- `/products/[slug]`
- `/products/category/[slug]`
- `/packaging-machines/india/[state]`
- `/[city]/[machine]` programmatic SEO landing page
- `/admin` protected dashboard
- `/admin/products`
- `/admin/categories`
- `/admin/blogs`
- `/admin/leads`
- `/admin/meetings`
- `/admin/settings`
- `/admin/developer` exact-owner diagnostics and analytics
- `/admin/login`

### Important Folders

- `src/app` route-level pages and route handlers
- `src/components/admin` admin editors for products, categories, blogs, and uploads
- `src/components/chatbot` AI sales widget UI
- `src/components/layout` navbar and footer
- `src/components/forms` phone and spam-shield fields
- `src/lib` CMS, auth, notifications, spam protection, uploads, runtime config, chatbot logic
- `supabase` schema and migrations

## Data Model

The Supabase schema currently includes these main tables:

- `products`
- `product_categories`
- `blogs`
- `services`
- `leads`
- `meetings`
- `site_settings`
- `admin_users`
- `rate_limits`

### Data Relationships

- Products belong to categories
- Blogs can link to a category and a featured product
- Leads and meetings can link to products and categories
- Site settings store catalog path and structured homepage hero overrides
- Admin access is controlled through the `admin_users` table

## Public SEO Strategy

The SEO implementation is stronger than a basic title/description setup.

- Global metadata in the root layout
- Product-level metadata and Open Graph tags
- Product JSON-LD
- Organization JSON-LD
- Sitemap generation for static pages, products, categories, and city SEO pages
- Robots rules that block `/admin` and `/api`
- Programmatic SEO pages built from `20 cities x all published products`

## Security and Protection

- NextAuth session-based admin authentication
- Admin access re-validated in middleware
- Admin users are allowlisted in Supabase
- Public forms use:
  - honeypot field
  - time-based form submission guard
  - optional Cloudflare Turnstile verification
  - rate limiting
- Supabase RLS is enabled for the main tables

## CMS Notes

This project mixes database-driven CMS behavior with seeded content.

- Products, categories, blogs, meetings, leads, and settings are database-aware
- Services are currently seed-driven from `src/lib/data.ts`
- Public product/category content can fall back to local seed data if Supabase is unavailable
- Images are uploaded to Supabase Storage under the `site-assets` bucket by default

## AI Chatbot Notes

The chatbot is not a generic wrapper. It is catalog-aware and business-oriented.

- Uses the live published product catalog
- Detects intent such as quote, product search, meeting, contact, and support
- Uses Gemini when configured
- Falls back to local deterministic logic if Gemini is unavailable
- Can point users toward products, contact, or meeting flows

## Environment Requirements

These variables are referenced by the codebase and should be documented for deployment:

### Core Site and Auth

- `SITE_ORIGIN`
- `APP_SITE_URL`
- `AUTH_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `AUTH_SECRET`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_STORAGE_BUCKET`

### AI

- `GEMINI_API_KEY`
- `GOOGLE_GEMINI_API_KEY`
- `GOOGLE_API_KEY`
- `GEMINI_CHAT_MODEL`

### Email

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`

### Spam Protection and Meetings

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `MEETING_BASE_URL`

### Analytics, Ads and Private Developer Access

- `DEVELOPER_OWNER_USER_ID` — preferred immutable Supabase Auth user UUID for the private developer panel
- `DEVELOPER_ADMIN_NAME` — restricted environment-owner fallback name; set this to `dipanshu`
- `NEXT_PUBLIC_GTM_ID` — preferred measurement integration (`GTM-...`)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — direct GA4 fallback (`G-...`); do not duplicate the same GA4 tag through GTM
- `NEXT_PUBLIC_GOOGLE_ADS_ID` — Google Ads destination (`AW-...`)
- `NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL`
- `NEXT_PUBLIC_GOOGLE_ADS_MEETING_LABEL`
- `NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_LABEL`
- `NEXT_PUBLIC_GOOGLE_ADS_PHONE_LABEL`
- `NEXT_PUBLIC_GOOGLE_ADS_EMAIL_LABEL`
- `NEXT_PUBLIC_GOOGLE_ADS_CATALOG_LABEL`
- `NEXT_PUBLIC_GOOGLE_ADS_CHAT_LABEL`
- `NEXT_PUBLIC_BING_UET_TAG_ID` — Bing UET tag ID (defaults to `187271989`)
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`

### Local Upload Fallback

- `ALLOW_LOCAL_UPLOADS`

## Setup

### Install

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

### Seed Database

```bash
npm run supabase:seed
```

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

## Available Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Production build |
| `npm run start` | Run built app |
| `npm run lint` | Lint the app |
| `npm run verify:seo -- https://your-domain.example` | Smoke-test SEO assets, metadata, redirects, sitemap, and admin headers |
| `npm run developer:owner` | Resolve the exact developer-owner user ID from configured admin identities |
| `npm run db:seed` | Seed Supabase data |
| `npm run setup` | Alias for seed script |
| `npm run supabase:seed` | Seed Supabase data |

## Deployment Notes

- `AUTH_URL` and `NEXTAUTH_URL` should resolve to one valid origin only
- `SITE_ORIGIN` should be the real public site URL in production
- Supabase public and service-role keys must both be configured for full CMS and admin behavior
- If SMTP is missing, enquiry submission still works but emails are skipped
- If Gemini is missing, the chat route falls back to a non-AI catalog assistant

### Required Production Activation

1. Apply `supabase/migrations/20260821_analytics_and_attribution.sql` and `supabase/migrations/20260821_canonical_seo_slugs.sql` in the production Supabase SQL editor before deploying.
2. Set `DEVELOPER_OWNER_USER_ID` to Dipanshu's exact Supabase Auth user UUID. The `/admin/developer` route is server-enforced and does not trust a display name by itself.
   On the first owner visit, create a private 6-digit Developer PIN. Only its peppered bcrypt verifier is stored; unlock sessions use a 30-minute owner-bound HttpOnly cookie and PIN attempts are rate-limited.
3. Configure either `NEXT_PUBLIC_GTM_ID` or the direct GA4 fallback, plus the Google Ads ID/labels you actually use. The Bing UET tag is configured with `NEXT_PUBLIC_BING_UET_TAG_ID` and defaults to `187271989`. When GTM is selected, create GA4/Ads tags for the documented data-layer event names.
4. Deploy, confirm `/favicon.ico`, `/favicon.png`, `/manifest.webmanifest`, `/robots.txt`, and `/sitemap.xml` return `200`, then submit the sitemap and request a homepage recrawl in Google Search Console.
5. Renew the TLS certificate for `www.spectrapackmachines.com` in the hosting/DNS control plane. The application permanently redirects `www` to the apex domain, but the certificate must be valid before that redirect can be reached.

Tracked public events are `page_view`, `generate_lead`, `meeting_booked`, `whatsapp_click`, `phone_click`, `email_click`, `catalog_download`, `chat_open`, and `chat_message`. Google, Bing UET and first-party analytics start only after analytics consent. Form submissions still retain their operational lead/meeting records and campaign context.

Developer Operations reports first-party reach, paid-click attribution, contact actions, and the lead pipeline. Google Ads impressions, platform clicks, spend, ROAS, and authoritative cost-per-lead require a separate Google Ads reporting API OAuth connection; the installed browser tag cannot read those account reports.

The SEO directory includes one substantive hub for every Indian state and union territory, focused major-city hubs, all published service detail pages, products, categories, blogs, and existing city-machine pages. Avoid generating thousands of thin district pages: add a town or district page only when it contains genuine local delivery, installation, customer, or application value.

## Practical Summary

If you want the shortest correct description for this project, use this:

> Spectra Pack Machines is a full-stack B2B manufacturing website built with Next.js, TypeScript, and Supabase. It includes a public machine catalog, local SEO landing pages, blog CMS, admin dashboard, lead capture, meeting scheduling, AI sales chatbot, email automation, and image-driven content management.
