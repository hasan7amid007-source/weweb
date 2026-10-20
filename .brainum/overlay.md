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
- [x] Agency shop/services redesign (2026-10-20) — plan tables grouped by service; dark shop hero; home services show from-price → shop; softer terms note
- [x] Agency plan-card polish (2026-10-20) — package highlights, price-first cards, checkmarks, featured scale, professional lead copy
- [x] WooCommerce-aligned shop IA (2026-10-20) — catalog add-to-cart, sort, active filter chips, breadcrumbs, sticky buy box, related plans, proceed-to-checkout cart CTA
- [x] Shop logic audit (2026-10-20, Brainum) — catalog SSOT + server price validation PASS; fixed calcOrderTotalEur invalid-id fallback + multi-cart API-fail silent first-line checkout; residual: shop UI cannot pick addons; mixed sub+one-time → payment mode until Stripe Price IDs
- [x] Shop detail addon picker (2026-10-20) — buy-box extras with live subtotal; cart lines show addons; replace-on-readd from detail; server still validates addon prices
- [x] Soft-launch order/cart continuity (2026-10-20) — demo items encode addons; order page shows extras + multi-line items; empty cart browse link
- [x] Stuttgart/DE competitor parity (2026-10-20) — analysis vs Gaul / Website Stuttgart / Neckaralb / BAT; added Care (Wartung) + SEA monthly plans; richer DSGVO/shop/Festpreis framing + MwSt. note; BDITEC stays start/deposit model (not copying €1.5k–€7k Festpreise without approval)
- [ ] Business: approve shop prices / inclusions / subscription terms before live Payment Links (Care €59 / Care Pro €99 / SEA Start €299 / SEO Pflege €490 / Social €499 orientation; still not Festpreise)
- [x] Catalog orientation prices from DE competitor research (2026-10-20) — Care Pro, SEO Pflege, Social added; Care/SEA Start labeled with hour caps & exclusions; deposits unchanged
- [x] Shop price semantics (2026-10-20) — Startbetrag vs Monatlich vs Richtwert badges/notes; subscription buy-box note; FAQ updated for retainers
- [x] Brainum continuous mode confirmed (2026-10-20) — owner: continue using Brainum; code soft-launch gaps until human gates only remain
- [x] Domain ownership check (2026-10-20) — `weweb-weld.vercel.app` is production alias of Vercel project `hh-7/weweb` (this repo); webhook URL = `https://weweb-weld.vercel.app/api/stripe-webhook` (not `weweb-hh-7`, which is same app but `X-Robots-Tag: noindex`)
- [x] Ops: Stripe TEST verify — **left as-is** (2026-10-20, owner): Production key is not `sk_test_`; soft-launch uses **demo checkout** when secret is unset/`pk_`/`rk_` (only `sk_test_`/`sk_live_` enable Stripe Checkout). Webhook `whsec_…` remains; signed delivery deferred until usable secret
- [ ] Ops (optional later): set `sk_test_…`, EUR Prices, Customer Portal, KV/Upstash; then re-verify Checkout + signed webhooks
- [ ] Connect marketplace — deferred until Payments + Billing are live
- [x] Soft-launch continuity (2026-10-20, Brainum) — unusable Stripe secret → demo checkout; cart line edit deep-links; order briefing multi-line items; client demo totals/items; name/email maxlength; sitemap lastmod + llms Care/SEA; breadcrumb/focus a11y
- [x] Demo order UX (2026-10-20) — hide Stripe portal on demo orders; briefing section first (matches next-steps)
- [x] Soft-launch auto batch (2026-10-20) — `#booking` scroll + addon deep-link; mobile cart bar dock; invalid shop package URL cleanup + empty-filter CTA; order escapeHtml/i18n eyebrow/meta; `shop_page_view`/`shop_detail_view` analytics
- [x] Top UX/logic fixes (2026-10-20) — server-owned success URL; subscription hard-fail; booking quote gate + Startbetrag/Monatlich badges; step-4 mode from API (`paySecurePending`), not Payment Links
