import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyApiCors } from './_lib/cors.js'
import {
  BRIEFING_SCHEMA_VERSION,
  contentFingerprint,
  durableStoreConfigured,
  findReferenceByContentFingerprint,
  getBriefingByReference,
  hashToken,
  makeAccessToken,
  makeReferenceId,
  saveBriefingDurable,
  selectionFingerprint,
  type StoredBriefing,
} from './_lib/briefing-store.js'

type PurchaseMode = 'checkout' | 'subscription' | 'quote'
type ServiceKey =
  | 'general'
  | 'web-hosting'
  | 'mobile-app'
  | 'web-development'
  | 'e-commerce'
  | 'digital-marketing'
  | 'offline-marketing'

type Catalog = Record<
  ServiceKey,
  {
    packages: { id: string; purchaseMode: PurchaseMode; directCheckout?: boolean }[]
    addons: { id: string }[]
  }
>

type Body = {
  schemaVersion?: number
  service?: string
  packageId?: string
  addonIds?: string[]
  intent?: string
  locale?: string
  business?: Record<string, string>
  answers?: Record<string, string | string[]>
  visual?: Record<string, string>
  materials?: Record<string, string>
  scopeFlags?: string[]
  reviewNotes?: string[]
  /** Optional: re-request access token for same content (idempotent) — requires prior token not returned */
  idempotentRetry?: boolean
}

const RATE = new Map<string, { n: number; t: number }>()

function loadCatalog(): Catalog {
  const here = dirname(fileURLToPath(import.meta.url))
  return JSON.parse(readFileSync(join(here, 'shop-catalog.json'), 'utf8')) as Catalog
}

function parseBody(req: VercelRequest): Body {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Body
    } catch {
      return {}
    }
  }
  return req.body as Body
}

function isServiceKey(v: string, catalog: Catalog): v is ServiceKey {
  return Object.prototype.hasOwnProperty.call(catalog, v)
}

function cleanString(v: unknown, max: number): string {
  return String(v ?? '')
    .trim()
    .slice(0, max)
}

function cleanAnswers(
  raw: Record<string, string | string[]> | undefined,
): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {}
  if (!raw || typeof raw !== 'object') return out
  for (const [k, v] of Object.entries(raw)) {
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(k)) continue
    if (Array.isArray(v)) {
      out[k] = v.map((x) => cleanString(x, 200)).filter(Boolean).slice(0, 20)
    } else {
      out[k] = cleanString(v, 4000)
    }
  }
  return out
}

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const row = RATE.get(ip) || { n: 0, t: now }
  if (now - row.t > 60_000) {
    row.n = 0
    row.t = now
  }
  row.n += 1
  RATE.set(ip, row)
  return row.n <= 20
}

function classifyNextAction(
  catalog: Catalog,
  service: ServiceKey,
  packageId: string,
  intent: string,
  reviewNotes: string[],
): 'checkout' | 'quote' | 'review' {
  if (!packageId) return 'quote'
  const pkg = catalog[service].packages.find((p) => p.id === packageId)
  if (!pkg) return 'quote'
  const direct =
    pkg.purchaseMode !== 'quote' &&
    pkg.directCheckout !== false &&
    (pkg.purchaseMode === 'checkout' || pkg.purchaseMode === 'subscription')
  if (!direct) return 'quote'
  if (reviewNotes.length > 0 || intent === 'review') return 'review'
  if (intent === 'checkout') return 'checkout'
  return 'quote'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!applyApiCors(req, res)) {
      return res.status(403).json({ error: 'Origin not allowed' })
    }
    if (req.method === 'OPTIONS') return res.status(204).end()
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
      .split(',')[0]!
      .trim()
    if (!rateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests' })
    }

    const catalog = loadCatalog()
    const body = parseBody(req)
    if (body.schemaVersion !== BRIEFING_SCHEMA_VERSION) {
      return res.status(400).json({ error: 'Unsupported schema version' })
    }
    const service = cleanString(body.service, 64)
    if (!isServiceKey(service, catalog)) {
      return res.status(400).json({ error: 'Invalid service' })
    }
    const packageId = cleanString(body.packageId, 64)
    if (packageId) {
      const pkg = catalog[service].packages.find((p) => p.id === packageId)
      if (!pkg) return res.status(400).json({ error: 'Invalid package' })
    }
    const addonIds = (body.addonIds || [])
      .map((id) => cleanString(id, 64))
      .filter((id) => catalog[service].addons.some((a) => a.id === id))
      .slice(0, 8)

    const business = cleanAnswers(body.business as Record<string, string | string[]>) as Record<
      string,
      string
    >
    const contactEmail = cleanString(business.contactEmail, 254).toLowerCase()
    const contactName = cleanString(business.contactName, 120)
    const company = cleanString(business.company, 160)
    if (!contactEmail.includes('@') || !contactName || !company) {
      return res.status(400).json({ error: 'Company, contact name, and email required' })
    }

    const answers = cleanAnswers(body.answers)
    const visual = cleanAnswers(body.visual) as Record<string, string>
    const materials = cleanAnswers(body.materials) as Record<string, string>
    const intent =
      body.intent === 'checkout' || body.intent === 'quote' || body.intent === 'review'
        ? body.intent
        : 'quote'
    const reviewNotes = (body.reviewNotes || []).map((s) => cleanString(s, 64)).slice(0, 20)
    const nextAction = classifyNextAction(catalog, service, packageId, intent, reviewNotes)

    const selFp = selectionFingerprint(service, packageId, addonIds, BRIEFING_SCHEMA_VERSION)
    const contentFp = contentFingerprint({
      service,
      packageId,
      addonIds,
      contactEmail,
      answers,
      visual,
      materials,
    })

    // Honest durability: without KV/Upstash we do NOT issue a BRF or unlock checkout.
    if (!durableStoreConfigured()) {
      console.info(
        JSON.stringify({
          event: 'briefing_submit_unavailable',
          service,
          packageId: packageId || null,
          nextAction,
          reason: 'store_not_configured',
        }),
      )
      return res.status(503).json({
        ok: false,
        durable: false,
        status: 'not_retained',
        error: 'Briefing store unavailable',
        detail:
          'No durable briefing store is configured. Your answers were not retained by BDITEC. Copy or download the summary and, for quotes, send it by email. Checkout cannot be unlocked until storage is configured.',
        nextActionHint: nextAction === 'checkout' ? 'blocked' : 'customer_email_fallback',
        selectionFingerprint: selFp,
      })
    }

    // Idempotent duplicate: same content already stored → issue a fresh access token (re-auth)
    const existingRef = await findReferenceByContentFingerprint(contentFp)
    if (existingRef) {
      const existing = await getBriefingByReference(existingRef)
      if (existing && existing.selectionFingerprint === selFp) {
        const accessToken = makeAccessToken()
        const updated: StoredBriefing = {
          ...existing,
          accessTokenHash: hashToken(accessToken),
        }
        const saved = await saveBriefingDurable(updated)
        if (!saved.ok) {
          return res.status(503).json({
            ok: false,
            durable: false,
            status: 'not_retained',
            error: 'Briefing store write failed',
            detail: 'Could not refresh briefing authorization. Answers were not confirmed retained.',
          })
        }
        console.info(
          JSON.stringify({
            event: 'briefing_resubmit_idempotent',
            referenceId: existingRef,
            service,
            packageId: packageId || null,
          }),
        )
        return res.status(200).json({
          ok: true,
          durable: true,
          duplicate: true,
          referenceId: existingRef,
          accessToken,
          nextAction: existing.nextAction,
          status: 'brief_submitted',
          selectionFingerprint: existing.selectionFingerprint,
        })
      }
    }

    const referenceId = makeReferenceId()
    const accessToken = makeAccessToken()
    const record: StoredBriefing = {
      referenceId,
      accessTokenHash: hashToken(accessToken),
      schemaVersion: BRIEFING_SCHEMA_VERSION,
      service,
      packageId,
      addonIds,
      selectionFingerprint: selFp,
      contentFingerprint: contentFp,
      nextAction,
      status: 'brief_submitted',
      locale: cleanString(body.locale, 5) || 'de',
      contactEmail,
      createdAt: new Date().toISOString(),
      payload: {
        business,
        answers,
        visual,
        materials,
        scopeFlags: (body.scopeFlags || []).map((s) => cleanString(s, 64)).slice(0, 20),
        reviewNotes,
        intent,
      },
    }

    const saved = await saveBriefingDurable(record)
    if (!saved.ok) {
      console.info(
        JSON.stringify({
          event: 'briefing_submit_write_failed',
          service,
          packageId: packageId || null,
          reason: saved.reason,
        }),
      )
      return res.status(503).json({
        ok: false,
        durable: false,
        status: 'not_retained',
        error: 'Briefing store write failed',
        detail:
          'The briefing could not be retained. Copy or download your summary. Checkout is not unlocked.',
        nextActionHint: nextAction === 'checkout' ? 'blocked' : 'customer_email_fallback',
      })
    }

    console.info(
      JSON.stringify({
        event: 'briefing_submitted',
        referenceId,
        service,
        packageId: packageId || null,
        nextAction,
        durable: true,
        selectionFingerprint: selFp,
      }),
    )

    return res.status(200).json({
      ok: true,
      durable: true,
      referenceId,
      accessToken,
      nextAction,
      status: 'brief_submitted',
      selectionFingerprint: selFp,
    })
  } catch (e) {
    console.error('submit-briefing failed', e instanceof Error ? e.message : 'error')
    return res.status(500).json({
      ok: false,
      durable: false,
      status: 'not_retained',
      error: 'Briefing submission failed',
    })
  }
}
