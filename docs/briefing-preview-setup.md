# Briefing durable store + staff viewer — Preview setup

Owner: Hasan Hamid  
Scope: configuration **you** complete in Vercel / provider consoles.  
This document never contains secret values. Do not paste tokens into tickets or chat.

## Status (checked 2026-10-21)

- Vercel project `weweb` (team `hh-7`): **no** Marketplace storage/integration resources found (`vercel integration list` → no resources).
- Project env keys present: Stripe-related only. **No** `KV_*`, `UPSTASH_*`, or `BRIEFING_STAFF_TOKEN`.
- Staff viewer remains **local-only** until you approve commit/push.

**Conclusion:** there is **no approved KV/Upstash integration already attached** to this project. You must choose a provider (below) before Preview verification can be real.

---

## 1. Provider choice (needs your approval)

Code accepts **either** pair (same REST shape):

| Option | Env names the code reads | Notes |
|--|--|--|
| **A — Upstash Redis via Vercel Marketplace** (recommended) | `KV_REST_API_URL` + `KV_REST_API_TOKEN` *or* `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (Marketplace usually injects the `KV_*` names) | Create Redis in Vercel Storage / Integrations; connect to project |
| **B — Existing Upstash account (manual)** | `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Create DBs in Upstash console; paste REST URL + token into Vercel env (Preview / Production separately) |

Do **not** use a generic `REDIS_URL` — the app does not read it.

Approve **A** or **B** before anyone creates accounts or attaches billing.

### Separate Preview database (required for safe testing)

Do **not** point Preview and Production at the same Redis database if you can avoid it.

**Recommended:**

1. Create **two** Redis databases: e.g. `weweb-briefing-preview` and `weweb-briefing-prod`.
2. Connect / set env:
   - Preview → Preview DB credentials only  
   - Production → Production DB credentials only  
3. Optionally set `BRIEFING_STAFF_TOKEN` **differently** per environment (Preview vs Production).

**If Marketplace “connect” only offers one database:** create a second Redis resource and connect it with environment targeting **Preview** only (Vercel Storage → connect → choose environments).

---

## 2. Exact environment variable names

### Durable briefing + webhook idempotency (one pair)

```
KV_REST_API_URL
KV_REST_API_TOKEN
```

— or —

```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

### Staff viewer (when you deploy that code)

```
BRIEFING_STAFF_TOKEN
```

- Minimum length: **24** characters (enforced in code).
- Fail-closed: if missing/short → `503` (staff API unavailable).
- Shared secret — see limitations below.

### Not used for briefing store

- `REDIS_URL`, `REDIS_TOKEN`, arbitrary Upstash SDK vars without the REST names above.

---

## 3. Setup steps (no secrets in this doc)

### Option A — Marketplace Upstash Redis

1. Vercel → team `hh-7` → project `weweb` → **Storage** (or **Integrations**).
2. Create / add **Upstash Redis** (approve Marketplace terms / plan in the UI).
3. Create **Preview** database (or a second Redis resource named for Preview).
4. **Connect** to `weweb` with target **Preview** only; confirm env names appear as `KV_REST_API_*` or `UPSTASH_REDIS_REST_*`.
5. Repeat for **Production** with a **separate** database when ready (not required for Preview-only verification).
6. Set `BRIEFING_STAFF_TOKEN` for Preview (Dashboard → Settings → Environment Variables → Preview). Generate a long random value offline; store it in your password manager.
7. Redeploy the **Preview** deployment so new env vars apply (Git push of an empty commit is unnecessary if you use “Redeploy” in the dashboard).

### Option B — Manual Upstash

1. In Upstash: create Preview Redis + (later) Production Redis.
2. Copy **REST URL** and **REST TOKEN** from Upstash (do not paste into chat).
3. In Vercel → `weweb` → Environment Variables → add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for **Preview**.
4. Add `BRIEFING_STAFF_TOKEN` for Preview.
5. Redeploy Preview.

### Verification that config is present (names only)

```text
vercel env ls --scope hh-7
```

Expect to see the key **names** for Preview. Do not use decrypt / `env pull` in shared logs.

---

## 4. Shared-token limitations & rotation (`BRIEFING_STAFF_TOKEN`)

| Limitation | Implication |
|--|--|
| One shared secret | Anyone with the token can read any briefing by reference |
| No per-user audit identity | Logs only show that *a* staff retrieval happened, not *who* |
| Browser `sessionStorage` | Cleared on tab close / Logout; still visible to XSS on that origin |
| `noindex` / robots Disallow | **Not access control** — URLs remain reachable if guessed |
| Customer `accessToken` | Never a staff credential; staff secret is separate |

**Rotation**

1. Generate a new token (≥24 chars).
2. Set Preview (then Production) `BRIEFING_STAFF_TOKEN` to the new value.
3. Redeploy.
4. Tell staff to use Logout, then paste the new token.
5. Invalidate the old token by overwriting the env var (no dual-token window unless you deliberately keep both briefly).

Upgrade path later: real staff IdP / SSO + role checks (not implemented).

---

## 5. Security notes for staff viewer (pre-deploy review)

- Authorization enforced on every `GET` of `/api/staff-briefing` before any store read.
- Sensitive responses send `Cache-Control: no-store` (and related no-cache headers).
- Logs may include `referenceId`, `service`, `packageId` only — never staff token, customer access token, email, or payload body.
- Missing store or staff token → fail closed (`503` / `401`).
- Logout clears the session-stored staff token and on-screen payload.
- `meta robots noindex` and `robots.txt` Disallow reduce indexing; **they do not authenticate**.

---

## 6. Preview verification procedure

Use **synthetic** data only (`qa+preview@example.com`, fake business names). No live Stripe, no real customer PII, no real payments.

Label every result: **REAL (Preview)** vs **MOCKED (local unit tests)**.

### A. Preconditions

- [ ] Provider approved and Preview Redis connected  
- [ ] Preview env shows store pair **names** + `BRIEFING_STAFF_TOKEN` name  
- [ ] Preview deployment URL known (e.g. `weweb-*-hh-7.vercel.app`)  
- [ ] Staff viewer available on that deployment (today: local-only until you approve ship)

### B. Durable submission — REAL (Preview)

1. Open Preview `/briefing.html?service=web-development&package=landing`.
2. Fill **synthetic** required fields; submit.
3. Expect `durable: true`, `referenceId` `BRF_…`, and an opaque access token kept in session (not in the URL).
4. If store missing: expect failure / no checkout unlock (**fail closed**).

### C. Authorized staff retrieval — REAL (Preview)

1. Open `/staff-briefing` (after that code is on Preview).
2. Enter staff token (not in URL). Load the `BRF_…` from step B.
3. Expect full synthetic payload; confirm response headers include `Cache-Control: no-store`.
4. Negative checks:
   - No token / wrong token → `401`
   - Valid token, unknown ref → `404`
   - Customer access token as staff token → `401`
   - Logout → token + payload cleared from UI/session

### D. Briefing → test checkout continuity — REAL (Preview)

1. From briefing success, continue to shop/cart checkout with the **same** package/add-ons/email.
2. Expect demo/test checkout unlock only when briefing matches (server validates fingerprint).
3. Negative checks:
   - Change package or add-ons → previous briefing must **not** unlock  
   - Wrong email → reject  
   - Multi-item cart → reject in UI and API  
4. Do **not** enable live Stripe; demo / test mode only.

### E. Storage failure — REAL or MOCKED

- **MOCKED:** `npm test` (storage-unavailable paths).  
- **REAL:** temporarily impossible without breaking Preview env; do not delete Production keys. Prefer MOCKED unless you use a throwaway Preview-only misconfig.

### F. Local mocks (already available)

```text
npm test
```

Covers token mismatch, package/addon/email mismatch, missing store, multi-item policy, staff gate — labeled `[MOCK]` / `[STATIC]` in test names.

---

## 7. Minimum you need to complete next

1. **Approve** provider option A or B.  
2. Create **Preview-only** Redis and set the matching env **names** on Preview.  
3. Set Preview `BRIEFING_STAFF_TOKEN` (in password manager + Vercel UI).  
4. Redeploy Preview.  
5. When ready: approve shipping the local staff viewer to `main` (separate decision).  
6. Run §6 procedure; keep Production Redis / live pay off until signed off.
