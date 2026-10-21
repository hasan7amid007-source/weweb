/**
 * Durable briefing persistence (Vercel KV / Upstash REST only).
 * In-memory is intentionally NOT treated as durable — serverless instances do not share it.
 */

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

export const BRIEFING_SCHEMA_VERSION = 1
const TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days
const KEY_PREFIX = 'briefing:v1:'
const FINGERPRINT_PREFIX = 'briefing:fp:v1:'

export type StoredBriefing = {
  referenceId: string
  accessTokenHash: string
  schemaVersion: number
  service: string
  packageId: string
  addonIds: string[]
  selectionFingerprint: string
  contentFingerprint: string
  nextAction: 'checkout' | 'quote' | 'review'
  status: 'brief_submitted'
  locale: string
  /** Redacted contact — email only for checkout match, not full answers in checkout path */
  contactEmail: string
  createdAt: string
  /** Full payload for staff handoff — only in durable store, never returned by public GET */
  payload: Record<string, unknown>
}

function redisRest(): { url: string; token: string } | null {
  const url = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').trim()
  const token = (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '').trim()
  if (!url || !token) return null
  return { url: url.replace(/\/$/, ''), token }
}

export function durableStoreConfigured(): boolean {
  return redisRest() != null
}

export function makeReferenceId(): string {
  return `BRF_${randomBytes(8).toString('hex')}`
}

export function makeAccessToken(): string {
  return randomBytes(24).toString('base64url')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

export function tokensMatch(storedHash: string, providedToken: string): boolean {
  const a = Buffer.from(storedHash, 'hex')
  const b = Buffer.from(hashToken(providedToken), 'hex')
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function selectionFingerprint(
  service: string,
  packageId: string,
  addonIds: string[],
  schemaVersion: number,
): string {
  const addons = [...addonIds].map((s) => s.trim()).filter(Boolean).sort().join('+')
  return createHash('sha256')
    .update(`v${schemaVersion}|${service}|${packageId}|${addons}`)
    .digest('hex')
    .slice(0, 32)
}

export function contentFingerprint(input: {
  service: string
  packageId: string
  addonIds: string[]
  contactEmail: string
  answers: unknown
  visual: unknown
  materials: unknown
}): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        s: input.service,
        p: input.packageId,
        a: [...input.addonIds].sort(),
        e: input.contactEmail.toLowerCase(),
        ans: input.answers,
        vis: input.visual,
        mat: input.materials,
      }),
    )
    .digest('hex')
    .slice(0, 32)
}

async function kvCommand(args: unknown[]): Promise<{ ok: boolean; result?: unknown }> {
  const rest = redisRest()
  if (!rest) return { ok: false }
  try {
    const res = await fetch(rest.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${rest.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    })
    if (!res.ok) return { ok: false }
    const body = (await res.json()) as { result?: unknown }
    return { ok: true, result: body.result }
  } catch {
    return { ok: false }
  }
}

export async function saveBriefingDurable(
  record: StoredBriefing,
): Promise<{ ok: true } | { ok: false; reason: 'not_configured' | 'write_failed' }> {
  if (!redisRest()) return { ok: false, reason: 'not_configured' }
  const key = `${KEY_PREFIX}${record.referenceId}`
  const fpKey = `${FINGERPRINT_PREFIX}${record.contentFingerprint}`
  const serialized = JSON.stringify(record)
  const setMain = await kvCommand(['SET', key, serialized, 'EX', String(TTL_SECONDS)])
  if (!setMain.ok) return { ok: false, reason: 'write_failed' }
  // Map content fingerprint → reference for idempotent resubmit (stores ref only)
  await kvCommand([
    'SET',
    fpKey,
    record.referenceId,
    'EX',
    String(TTL_SECONDS),
  ])
  return { ok: true }
}

export async function getBriefingByReference(
  referenceId: string,
): Promise<StoredBriefing | null> {
  if (!redisRest()) return null
  const key = `${KEY_PREFIX}${referenceId}`
  const got = await kvCommand(['GET', key])
  if (!got.ok || got.result == null) return null
  try {
    const raw = typeof got.result === 'string' ? got.result : String(got.result)
    return JSON.parse(raw) as StoredBriefing
  } catch {
    return null
  }
}

export async function findReferenceByContentFingerprint(
  fingerprint: string,
): Promise<string | null> {
  if (!redisRest()) return null
  const got = await kvCommand(['GET', `${FINGERPRINT_PREFIX}${fingerprint}`])
  if (!got.ok || got.result == null) return null
  return String(got.result)
}

/**
 * Authorize checkout against a durable brief.
 * Requires referenceId + accessToken; verifies selection fingerprint.
 */
export async function authorizeBriefingForCheckout(input: {
  referenceId: string
  accessToken: string
  service: string
  packageId: string
  addonIds: string[]
  email: string
}): Promise<
  | { ok: true; referenceId: string }
  | { ok: false; error: string; status: number }
> {
  const ref = String(input.referenceId || '').trim()
  const token = String(input.accessToken || '').trim()
  if (!ref || !token) {
    return { ok: false, error: 'Briefing authorization required', status: 400 }
  }
  if (!ref.startsWith('BRF_') || ref.length > 48) {
    return { ok: false, error: 'Invalid briefing reference', status: 400 }
  }
  if (!durableStoreConfigured()) {
    return {
      ok: false,
      error: 'Briefing store unavailable',
      status: 503,
    }
  }
  const record = await getBriefingByReference(ref)
  if (!record) {
    return { ok: false, error: 'Briefing not found or expired', status: 404 }
  }
  if (!tokensMatch(record.accessTokenHash, token)) {
    return { ok: false, error: 'Briefing authorization failed', status: 403 }
  }
  if (record.schemaVersion !== BRIEFING_SCHEMA_VERSION) {
    return { ok: false, error: 'Briefing schema mismatch — please resubmit', status: 409 }
  }
  const expected = selectionFingerprint(
    input.service,
    input.packageId,
    input.addonIds,
    BRIEFING_SCHEMA_VERSION,
  )
  if (record.selectionFingerprint !== expected) {
    return {
      ok: false,
      error: 'Briefing does not match selected service, package, or add-ons',
      status: 409,
    }
  }
  if (record.nextAction !== 'checkout') {
    return { ok: false, error: 'This briefing is not cleared for checkout', status: 409 }
  }
  const email = input.email.trim().toLowerCase()
  if (record.contactEmail && email && record.contactEmail !== email) {
    return { ok: false, error: 'Briefing contact email does not match checkout', status: 409 }
  }
  return { ok: true, referenceId: record.referenceId }
}
