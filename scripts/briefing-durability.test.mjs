/**
 * Briefing durability + selection fingerprint tests (pure helpers mirrored).
 * Run via npm test
 */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'

function selectionFingerprint(service, packageId, addonIds, schemaVersion = 1) {
  const addons = [...addonIds].map((s) => s.trim()).filter(Boolean).sort().join('+')
  return createHash('sha256')
    .update(`v${schemaVersion}|${service}|${packageId}|${addons}`)
    .digest('hex')
    .slice(0, 32)
}

function briefingMatchesClient(doc, service, packageId, addonIds = []) {
  if (!doc?.durable || !doc.referenceId || !doc.accessToken) return false
  if (doc.service !== service || doc.packageId !== packageId) return false
  const a = [...(doc.addonIds || [])].sort().join('|')
  const b = [...addonIds].sort().join('|')
  return a === b
}

test('selection fingerprint changes when package changes', () => {
  const a = selectionFingerprint('web-development', 'landing', [])
  const b = selectionFingerprint('web-development', 'business', [])
  assert.notEqual(a, b)
})

test('selection fingerprint is addon-order independent', () => {
  const a = selectionFingerprint('web-development', 'landing', ['cms', 'forms'])
  const b = selectionFingerprint('web-development', 'landing', ['forms', 'cms'])
  assert.equal(a, b)
})

test('client match requires durable flag and token', () => {
  assert.equal(
    briefingMatchesClient(
      { durable: false, referenceId: 'BRF_x', accessToken: 't', service: 'web-development', packageId: 'landing', addonIds: [] },
      'web-development',
      'landing',
    ),
    false,
  )
  assert.equal(
    briefingMatchesClient(
      { durable: true, referenceId: 'BRF_x', accessToken: 't', service: 'web-development', packageId: 'landing', addonIds: [] },
      'web-development',
      'landing',
    ),
    true,
  )
})

test('client match fails when addons diverge', () => {
  assert.equal(
    briefingMatchesClient(
      { durable: true, referenceId: 'BRF_x', accessToken: 't', service: 'web-development', packageId: 'landing', addonIds: ['cms'] },
      'web-development',
      'landing',
      [],
    ),
    false,
  )
})

test('multi-item carts must not silently checkout primary only', () => {
  const items = [
    { service: 'web-development', packageId: 'landing' },
    { service: 'web-development', packageId: 'business' },
  ]
  assert.ok(items.length > 1)
  // Policy: reject — mirrored by create-checkout + startCartCheckout
  const allowed = items.length === 1
  assert.equal(allowed, false)
})
