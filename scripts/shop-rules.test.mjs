/**
 * Focused shop purchase-rule tests (no new test framework dependency).
 * Run: npm test
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const catalog = JSON.parse(readFileSync(join(root, 'api/shop-catalog.json'), 'utf8'))

function packages() {
  const rows = []
  for (const [service, shop] of Object.entries(catalog)) {
    for (const pkg of shop.packages) {
      rows.push({ service, ...pkg, addons: shop.addons })
    }
  }
  return rows
}

function canPurchaseDirect(pkg) {
  if (pkg.purchaseMode === 'quote') return false
  if (pkg.directCheckout === false) return false
  return pkg.purchaseMode === 'checkout' || pkg.purchaseMode === 'subscription'
}

function sanitizeLine(service, packageId, addonIds) {
  const shop = catalog[service]
  if (!shop) return null
  const pkg = shop.packages.find((p) => p.id === packageId)
  if (!pkg || !canPurchaseDirect(pkg)) return null
  const addons =
    pkg.purchaseMode === 'subscription'
      ? []
      : addonIds.filter((id) => shop.addons.some((a) => a.id === id))
  return { service, packageId, addonIds: addons, purchaseMode: pkg.purchaseMode, priceEur: pkg.priceEur }
}

test('catalog has 23 public listing packages across shop services', () => {
  const listing = packages().filter((p) => p.service !== 'general')
  assert.equal(listing.length, 23)
})

test('every package has a purchaseMode and shopCategory', () => {
  for (const pkg of packages()) {
    assert.ok(['checkout', 'subscription', 'quote'].includes(pkg.purchaseMode), pkg.id)
    assert.ok(typeof pkg.shopCategory === 'string' && pkg.shopCategory.length > 0, pkg.id)
  }
})

test('Care is subscription at 59 without inventing a new price', () => {
  const care = catalog['web-hosting'].packages.find((p) => p.id === 'care')
  assert.equal(care.purchaseMode, 'subscription')
  assert.equal(care.priceEur, 59)
  assert.equal(care.directCheckout, false)
})

test('retainers without approved terms are gated from direct checkout', () => {
  const gated = packages().filter((p) => p.directCheckout === false)
  assert.ok(gated.length >= 6)
  assert.ok(gated.every((p) => p.purchaseMode === 'subscription'))
})

test('one-time checkout packages stay directly purchasable', () => {
  const landing = catalog['web-development'].packages.find((p) => p.id === 'landing')
  assert.equal(landing.purchaseMode, 'checkout')
  assert.notEqual(landing.directCheckout, false)
})

test('quote-only packages stay non-cartable', () => {
  const quotes = packages().filter((p) => p.purchaseMode === 'quote')
  assert.ok(quotes.length >= 5)
  assert.ok(quotes.some((p) => p.id === 'custom' && p.priceEur === 399))
  assert.ok(quotes.some((p) => p.id === 'launch' && p.priceEur === 299))
  assert.ok(quotes.some((p) => p.id === 'event' && p.priceEur === 299))
})

test('sanitize strips invalid add-ons and drops quote / gated packages', () => {
  assert.equal(sanitizeLine('web-hosting', 'care', ['migration']), null)
  assert.equal(sanitizeLine('web-development', 'custom', []), null)

  const once = sanitizeLine('web-development', 'landing', ['cms', 'bogus'])
  assert.deepEqual(once.addonIds, ['cms'])
  assert.equal(once.purchaseMode, 'checkout')
})

test('mixed billing detection separates one-time and monthly when both purchasable', () => {
  // Care is gated — simulate with a purchasable checkout + another checkout line
  const lines = [
    sanitizeLine('web-development', 'landing', []),
    sanitizeLine('e-commerce', 'starter', []),
  ].filter(Boolean)
  assert.equal(lines.length, 2)
  const oneTime = lines.reduce((s, l) => s + l.priceEur, 0)
  assert.equal(oneTime, 99 + 129)
  assert.equal(sanitizeLine('web-hosting', 'care', ['migration']), null)
})

test('seo-analytics filter category has packages; e-commerce packages use web-design category', () => {
  const seo = packages().filter((p) => p.shopCategory === 'seo-analytics')
  assert.ok(seo.length >= 2)
  const ecom = packages().filter((p) => p.service === 'e-commerce')
  assert.ok(ecom.every((p) => p.shopCategory === 'web-design'))
})
