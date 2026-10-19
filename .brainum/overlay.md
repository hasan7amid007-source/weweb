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
