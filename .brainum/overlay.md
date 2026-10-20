# WEWEB — Brainum overlay

Profile: `marketing-website`
Selection mode: `RECOMMENDED`
Programmer: Hasan Hamid
Developer: Hasan Hamid
Owner: Hasan Hamid

## Identity
Use programmer/developer/owner from `.brainum/project.json` in README metadata, architecture docs, project reports, Brainum manifests, and release summaries. Do **not** stamp the developer name into every source file.

## Routing policy
- Prefer project `.brainum/selected-skills.json` modes over ad-hoc skill dumps.
- Task router must respect REQUIRED / PREFERRED / OPTIONAL / FORBIDDEN.
- Do not load the full Brainum catalog into context.
- External skills remain untrusted until classified.

## Human gates
- [x] Brand voice confirmed (2026-10-18) — Hasan Hamid: keep current BDITEC tone
- [x] Indexable URL inventory confirmed (2026-10-18)

## Indexable URL inventory (canonical)
Origin (temporary until `bditec.com` is owned + attached): `https://weweb-weld.vercel.app`
- `/`
- `/services/web-hosting.html`
- `/services/mobile-app.html`
- `/services/web-development.html`
- `/services/e-commerce.html`
- `/services/digital-marketing.html`
- `/services/offline-marketing.html`
- `/impressum.html`
- `/datenschutz.html`
- `/shop.html` (also `/shop` via rewrite)
- Note: `/#booking` is an in-page checkout hash (not a separate crawl URL)

## Notes
Tech showcase marketing site inspired by Slider Revolution Tech Showcase: device mockups, parallax slider hero, responsive landing, later custom branding

## Brainum operating mode
- Active: **linked** continuous use for this product (owner request 2026-10-19).
- Primary family default: `content-brand-agent` (router may select supporting agents per task).
- Domain purchase skipped; stay on `weweb-weld.vercel.app` until a new domain is chosen.

## Product backlog (non-gate)
- [x] Stripe live pay — skipped for now (demo checkout OK)
- [x] Deploy production — Vercel `hh-7/weweb` ← GitHub `hasan7amid007-source/weweb` (alias `weweb-weld.vercel.app`); SSO protection disabled 2026-10-19
- [x] Impressum + Datenschutz draft pages (counsel review still required)
- [x] SEO origin aligned to indexable production host (2026-10-19) — `SITE_ORIGIN` / robots / sitemap → `weweb-weld.vercel.app` (not team alias `weweb-hh-7`, which sends `X-Robots-Tag: noindex`)
- [x] Custom domain — **skipped for now** (2026-10-19, Hasan Hamid): keep Vercel host; owner will pick a new domain later, then attach + flip origin
- [x] Mobile nav + skip link + `?lang=` (2026-10-19) — Brainum frontend-product / a11y pass
- [x] Vercel Git auto-deployments enabled for `hh-7/weweb`
- [x] Responsive QA (mobile 390 / tablet 768) — nav + no page overflow; demo checkout soft-launch default (2026-10-19)
- [ ] Deferred: Google Search Console — wait until custom domain is attached, then flip `SITE_ORIGIN` + submit sitemap
- [ ] Optional: legal counsel sign-off on Impressum/Datenschutz
- [x] Soft-launch: Vercel Web Analytics (2026-10-19) — `@vercel/analytics` + Datenschutz note; enabled on `hh-7/weweb` (Speed Insights skipped — paid, needs interactive confirm)
- [x] Soft-launch SEO/UX batch (2026-10-19) — booking funnel `track()` events; home JSON-LD + hreflang; `?lang=` URL sync; service static meta shells; Twitter/OG image on legal+services; lazy join image; reduced-motion hero pause
- [x] Soft-launch perf polish (2026-10-19) — trim Google Font weights; home OG/preload; `site.webmanifest` + theme-color
- [x] Soft-launch hardening (2026-10-19) — security headers in `vercel.json`; branded `404.html`
- [x] Shop-style order options (2026-10-19) — per-service packages + add-ons; 4-step checkout (service → options → details → pay)
- [x] Public agency shop Phase 1 (2026-10-19) — `/shop.html` categories/filters/search, package detail, quote mailto, booking deep-links; Stripe live still deferred
- [x] Shop Phase 2 scaffold (2026-10-19) — `/api/create-checkout` (server price validation), `/api/stripe-webhook` (signed + duplicate guard), `/order.html` briefing; demo without `STRIPE_SECRET_KEY`
- [x] Shared catalog + session cart (2026-10-19) — `api/shop-catalog.json` single source; shop cart with multi-item checkout via `items[]`
- [x] Stripe Payments/Billing code path (2026-10-19, Brainum) — Price ID env map, subscription Checkout when all lines recurring, Billing webhooks, Customer Portal API + order page; Connect deferred
- [x] Prod API verify (2026-10-19) — `POST /api/create-checkout` → demo total=349; `POST /api/create-portal-session` → 503 until `STRIPE_SECRET_KEY`
- [x] Webhook idempotency adapter (2026-10-19) — `api/_lib/webhook-events.ts` (KV/Upstash REST when env set; memory fallback + release on handler failure)
- [x] Shop ItemList JSON-LD (2026-10-19) — structured Offers from `shop-catalog.json` (catalog amounts only; business approval still required before live pay)
- [x] Brainum review/verify pass (2026-10-19) — seo: shop public + ItemList×18 + sitemap; ux: skip-link/nav/cart/quote; webhook 503 without secrets; checkout demo OK; PASS-WITH-RISKS (live Stripe + price approval + KV still ops/business gates)
- [x] Soft-launch SEO/a11y batch (2026-10-19) — service→shop deep links (`?service=` grid filter); Datenschutz Stripe Checkout/Billing/Portal wording; shop filter `aria-pressed` + cart `aria-live`
- [x] Soft-launch hardening+content (2026-10-19) — API CORS allowlist + same-site success/return URLs; HSTS/COOP headers; home+shop FAQPage JSON-LD; shop FAQ accordion; `/llms.txt`; robots Disallow `/order`
- [x] Soft-launch perf/analytics polish (2026-10-19) — immutable `/assets` cache; `/page` SWR cache; 404→shop link + `page_404` event; shop FAQ `shop_faq_open` tracking
- [x] Soft-launch agent/security surfaces (2026-10-19) — `/.well-known/security.txt`; home FAQ `home_faq_open`; service→shop prefetch
- [x] Soft-launch cart UX + SEO polish (2026-10-19) — cart flash survives rerender + scroll to `#cart`; sticky cart bar; sitemap `lastmod`; manifest shortcuts; checkout name/email length limits; Stripe ops checklist in `.env.example`
- [ ] Business: approve shop prices / inclusions / subscription terms before live Payment Links
- [ ] Ops: add Stripe **test** account to MCP/session; set Vercel `STRIPE_SECRET_KEY` (sk_test) + `STRIPE_WEBHOOK_SECRET`; create EUR Products/Prices; enable Customer Portal; attach KV/Upstash for webhook durability (checklist in `.env.example`)
- [ ] Connect marketplace — deferred until Payments + Billing are live
