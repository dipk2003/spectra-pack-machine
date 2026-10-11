# Machine search discovery

The `/machines` catalogue links every published CMS model to its existing canonical `/products/[slug]` page. Footer navigation and the sitemap link the catalogue. No extra database migration is required; future published machines use the same template.

Each product page now includes quotation factors, application selection checks, sample-trial advice and category comparison links. Family phrases are used in buyer-facing content; there is no separate duplicate URL for each keyword variation.

| Search intent | Preferred destination |
| --- | --- |
| Packaging machine catalogue / all models | `/machines` |
| Exact machine name / model / specifications / price | Corresponding `/products/[slug]` |
| Vacuum packing / vacuum packaging machine | Vacuum model and category pages |
| Continuous band sealer / pouch sealing machine | Band sealer model and category pages |
| Pallet wrapping / stretch wrapping machine | Pallet model and category pages |
| Shrink wrapping / shrink packaging machine | Shrink and web sealer model pages |
| Material handling / packaging line conveyor | Conveyor model and category pages |
| Tube sealing / bag sealing | Corresponding sealing model pages |
| Selection and operating questions | Existing linked machine articles and product FAQs |

FAQs use native details/summary elements, so answers are included in initial HTML and accessible without JavaScript. Product hero and FAQ cards are initially visible. Product JSON-LD escapes `<` to prevent CMS text terminating its script element.

Robots explicitly lists Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot and Claude-User with the same public access and private route exclusions. Public crawling was already allowed through `*`; explicit names document that policy rather than promising new inclusion. robots.txt is not authentication, and hosting/CDN policies can independently deny crawlers.

[Google's AI search guidance](https://developers.google.com/search/docs/appearance/ai-features) recommends normal SEO, accessible text, internal links and accurate structured data; special AI files are unnecessary. [OpenAI's crawler documentation](https://developers.openai.com/api/docs/bots) identifies OAI-SearchBot as its search crawler. Neither crawl access nor extra content guarantees indexing, rankings, citations or recommendations. No AI provider submission or endorsement has been made.

Validation: run `npm run build`, `npm run verify:seo-content`, `npm run verify:editorial`, then start a local production server and run `node scripts/verify-machine-discovery.mjs http://127.0.0.1:3100`.

Validated locally on 26 September 2026: production build passed, existing SEO and editorial checks passed, and HTTP discovery checks passed for all 31 published models (directory links, canonical URLs, buying guidance, FAQ HTML and parseable structured data). Existing carousel image warnings remain. These checks do not verify external crawler receipt or rankings.

Release: deploy the tested changes, verify production `/machines`, `/robots.txt` and `/sitemap.xml`, then inspect priority product URLs in Search Console. Track impressions/clicks for model and family queries and qualified enquiries. Actual AI referrals, indexing and recommendations require measurement after publication; this repository change alone is not a production deployment.
