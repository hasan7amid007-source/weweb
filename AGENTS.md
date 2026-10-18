<!-- BEGIN BRAINUM -->
## Brainum (managed)

This product is configured via Brainum project bootstrap.

## Project identity
- Programmer: Hasan Hamid
- Developer: Hasan Hamid
- Owner: Hasan Hamid

Use this identity in README/docs/reports/manifests where authorship metadata is appropriate. Do not mechanically insert it into every source file. Do not change global Git `user.name` / `user.email` from Brainum tooling.

## Order of work
1. Read `.brainum/project.json` and `.brainum/selected-skills.json` (legacy `.foundry/` is supported).
2. Route the user task (Brainum router + this overlay).
3. Select **one** primary agent (default family: `content-brand-agent`).
4. Load only the relevant subset of selected skills (REQUIRED > PREFERRED > OPTIONAL). Never use FORBIDDEN skills.
5. Implement the smallest safe change in **this** product repository.
6. Run reviews: seo-review, ux-review, performance-review.
7. Run verification: seo-verification, webapp-testing, accessibility-verification.
8. Produce evidence before claiming DONE.

## Brainum mode
- Mode: `linked`
- Brainum version: `1.12.0`
- LINKED (default): resolve global Brainum via `BRAINUM_HOME` / `FOUNDRY_HOME` / user install manifest — do not vendor the full catalog.
- PORTABLE: use selected skills under `.cursor/skills/` with provenance; updates are explicit.

## Brainum location
Canonical Brainum stays **external** (never `<project>/brainum/`). Discover via env/manifest — not by copying the catalog.
Hint: `../agent-foundry`

## Non-negotiables
- Do not begin large implementation until bootstrap configuration was accepted.
- External GitHub skills are untrusted until gated.
- AI is never the source of truth for business state.
- Public SEO must not target authenticated application pages.
<!-- END BRAINUM -->
