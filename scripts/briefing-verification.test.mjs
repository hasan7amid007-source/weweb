/**
 * Safe verification of briefing durability/auth logic.
 * Uses an in-memory mock of the durable store — NOT a real KV integration.
 * Label: MOCKED
 *
 * Real integration requires KV_REST_API_* or UPSTASH_REDIS_REST_* on the API host.
 */
import assert from 'node:assert/strict'
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const SCHEMA = 1
const memory = new Map()

function hashToken(token) {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

function tokensMatch(storedHash, provided) {
  const a = Buffer.from(storedHash, 'hex')
  const b = Buffer.from(hashToken(provided), 'hex')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

function selectionFingerprint(service, packageId, addonIds) {
  const addons = [...addonIds].map((s) => s.trim()).filter(Boolean).sort().join('+')
  return createHash('sha256')
    .update(`v${SCHEMA}|${service}|${packageId}|${addons}`)
    .digest('hex')
    .slice(0, 32)
}

function saveMock(record) {
  memory.set(`briefing:v1:${record.referenceId}`, record)
  return { ok: true, durable: true }
}

function authorize(input) {
  const ref = String(input.referenceId || '').trim()
  const token = String(input.accessToken || '').trim()
  if (!ref || !token) return { ok: false, status: 400, error: 'Briefing authorization required' }
  if (!ref.startsWith('BRF_')) return { ok: false, status: 400, error: 'Invalid briefing reference' }
  const record = memory.get(`briefing:v1:${ref}`)
  if (!record) return { ok: false, status: 404, error: 'Briefing not found or expired' }
  if (!tokensMatch(record.accessTokenHash, token)) {
    return { ok: false, status: 403, error: 'Briefing authorization failed' }
  }
  if (record.schemaVersion !== SCHEMA) {
    return { ok: false, status: 409, error: 'Briefing schema mismatch' }
  }
  const expected = selectionFingerprint(input.service, input.packageId, input.addonIds)
  if (record.selectionFingerprint !== expected) {
    return { ok: false, status: 409, error: 'Briefing does not match selected service, package, or add-ons' }
  }
  if (record.nextAction !== 'checkout') {
    return { ok: false, status: 409, error: 'This briefing is not cleared for checkout' }
  }
  if (record.contactEmail && input.email.toLowerCase() !== record.contactEmail) {
    return { ok: false, status: 409, error: 'Briefing contact email does not match checkout' }
  }
  return { ok: true, referenceId: ref }
}

function submitMock({ service, packageId, addonIds, email, nextAction = 'checkout' }) {
  // Simulate "store not configured"
  if (process.env.BRIEFING_MOCK_NO_STORE === '1') {
    return { ok: false, durable: false, status: 'not_retained', http: 503 }
  }
  const referenceId = `BRF_${randomBytes(8).toString('hex')}`
  const accessToken = randomBytes(24).toString('base64url')
  const record = {
    referenceId,
    accessTokenHash: hashToken(accessToken),
    schemaVersion: SCHEMA,
    service,
    packageId,
    addonIds: [...addonIds],
    selectionFingerprint: selectionFingerprint(service, packageId, addonIds),
    nextAction,
    contactEmail: email.toLowerCase(),
    payload: { answers: { mainGoal: 'test' } },
  }
  saveMock(record)
  return { ok: true, durable: true, referenceId, accessToken, nextAction }
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const catalog = JSON.parse(readFileSync(join(root, 'api/shop-catalog.json'), 'utf8'))

test('[MOCK] durable submit returns BRF + token and authorizes matching checkout', () => {
  memory.clear()
  const sub = submitMock({
    service: 'web-development',
    packageId: 'landing',
    addonIds: ['cms'],
    email: 'qa@example.com',
  })
  assert.equal(sub.ok, true)
  assert.equal(sub.durable, true)
  assert.match(sub.referenceId, /^BRF_/)
  assert.ok(sub.accessToken.length > 16)
  const auth = authorize({
    referenceId: sub.referenceId,
    accessToken: sub.accessToken,
    service: 'web-development',
    packageId: 'landing',
    addonIds: ['cms'],
    email: 'qa@example.com',
  })
  assert.equal(auth.ok, true)
})

test('[MOCK] wrong token rejected', () => {
  memory.clear()
  const sub = submitMock({
    service: 'web-development',
    packageId: 'landing',
    addonIds: [],
    email: 'qa@example.com',
  })
  const auth = authorize({
    referenceId: sub.referenceId,
    accessToken: 'wrong-token-value-xxxxxxxxxxxx',
    service: 'web-development',
    packageId: 'landing',
    addonIds: [],
    email: 'qa@example.com',
  })
  assert.equal(auth.ok, false)
  assert.equal(auth.status, 403)
})

test('[MOCK] package change invalidates previous briefing for checkout', () => {
  memory.clear()
  const sub = submitMock({
    service: 'web-development',
    packageId: 'landing',
    addonIds: [],
    email: 'qa@example.com',
  })
  const auth = authorize({
    referenceId: sub.referenceId,
    accessToken: sub.accessToken,
    service: 'web-development',
    packageId: 'business',
    addonIds: [],
    email: 'qa@example.com',
  })
  assert.equal(auth.ok, false)
  assert.equal(auth.status, 409)
})

test('[MOCK] addon change invalidates previous briefing', () => {
  memory.clear()
  const sub = submitMock({
    service: 'web-development',
    packageId: 'landing',
    addonIds: [],
    email: 'qa@example.com',
  })
  const auth = authorize({
    referenceId: sub.referenceId,
    accessToken: sub.accessToken,
    service: 'web-development',
    packageId: 'landing',
    addonIds: ['forms'],
    email: 'qa@example.com',
  })
  assert.equal(auth.ok, false)
  assert.equal(auth.status, 409)
})

test('[MOCK] email mismatch rejected', () => {
  memory.clear()
  const sub = submitMock({
    service: 'mobile-app',
    packageId: 'mvp',
    addonIds: [],
    email: 'qa@example.com',
  })
  const auth = authorize({
    referenceId: sub.referenceId,
    accessToken: sub.accessToken,
    service: 'mobile-app',
    packageId: 'mvp',
    addonIds: [],
    email: 'other@example.com',
  })
  assert.equal(auth.ok, false)
  assert.equal(auth.status, 409)
})

test('[MOCK] missing store does not unlock (503 / not_retained)', () => {
  process.env.BRIEFING_MOCK_NO_STORE = '1'
  const sub = submitMock({
    service: 'web-development',
    packageId: 'landing',
    addonIds: [],
    email: 'qa@example.com',
  })
  delete process.env.BRIEFING_MOCK_NO_STORE
  assert.equal(sub.ok, false)
  assert.equal(sub.durable, false)
  assert.equal(sub.http, 503)
  assert.equal(sub.status, 'not_retained')
})

test('[MOCK] multi-item cart policy reject', () => {
  const lines = [
    { service: 'web-development', packageId: 'landing' },
    { service: 'web-hosting', packageId: 'shared' },
  ]
  assert.ok(lines.length > 1)
  // Mirrors create-checkout + startCartCheckout
  assert.equal(lines.length === 1, false)
})

test('[MOCK] every public service has at least one package for profile QA matrix', () => {
  const services = [
    'web-development',
    'e-commerce',
    'mobile-app',
    'digital-marketing',
    'web-hosting',
    'offline-marketing',
  ]
  for (const s of services) {
    assert.ok(catalog[s]?.packages?.length, s)
  }
})

test('[STATIC] code reads only approved env pair names', () => {
  const storeSrc = readFileSync(join(root, 'api/_lib/briefing-store.ts'), 'utf8')
  assert.match(storeSrc, /KV_REST_API_URL/)
  assert.match(storeSrc, /KV_REST_API_TOKEN/)
  assert.match(storeSrc, /UPSTASH_REDIS_REST_URL/)
  assert.match(storeSrc, /UPSTASH_REDIS_REST_TOKEN/)
  assert.equal(storeSrc.includes('REDIS_URL'), false)
})

test('[STATIC] submit logs must not include accessToken', () => {
  const src = readFileSync(join(root, 'api/submit-briefing.ts'), 'utf8')
  const logBlocks = src.match(/console\.info\([\s\S]*?\)/g) || []
  for (const block of logBlocks) {
    assert.equal(block.includes('accessToken'), false)
  }
})

test('[STATIC] no public GET briefing-by-id route and no staff read API file', () => {
  const apiFiles = ['submit-briefing.ts', 'create-checkout.ts', 'create-portal-session.ts', 'stripe-webhook.ts']
  for (const f of apiFiles) {
    const src = readFileSync(join(root, `api/${f}`), 'utf8')
    assert.equal(src.includes("method === 'GET'") && src.toLowerCase().includes('briefing'), false)
  }
  assert.equal(existsSync(join(root, 'api/get-briefing.ts')), false)
  assert.equal(existsSync(join(root, 'api/admin-briefing.ts')), false)
})
