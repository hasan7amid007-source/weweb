/**
 * Briefing conditional logic + scope routing tests.
 * Run: node --test scripts/briefing-rules.test.mjs
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const catalog = JSON.parse(readFileSync(join(root, 'api/shop-catalog.json'), 'utf8'))

function canPurchaseDirect(pkg) {
  if (pkg.purchaseMode === 'quote') return false
  if (pkg.directCheckout === false) return false
  return pkg.purchaseMode === 'checkout' || pkg.purchaseMode === 'subscription'
}

function profileForService(service, packageId) {
  if (service === 'e-commerce') return 'ecommerce'
  if (service === 'mobile-app') return 'mobile'
  if (service === 'web-hosting') return 'hosting'
  if (service === 'offline-marketing') return 'offline'
  if (service === 'general') return 'general'
  if (service === 'digital-marketing') {
    if (packageId === 'audit' || packageId === 'seo-pflege') return 'seo'
    return 'marketing'
  }
  return 'web'
}

function stepsFor(service, packageId) {
  const profile = profileForService(service, packageId)
  const steps = ['business', 'requirements']
  if (profile !== 'hosting' && profile !== 'seo') steps.push('visual')
  steps.push('materials', 'review')
  return steps
}

function evaluateNextAction(service, packageId, answers = {}) {
  const shop = catalog[service]
  if (!shop) return 'quote'
  const pkg = shop.packages.find((p) => p.id === packageId)
  if (!pkg || !canPurchaseDirect(pkg)) return 'quote'
  if (answers.websitePurpose === 'webapp') return 'review'
  if (answers.storeStatus === 'migration') return 'review'
  if (answers.hostingNeed === 'troubleshoot') return 'review'
  return 'checkout'
}

test('hosting briefing skips visual identity step', () => {
  const steps = stepsFor('web-hosting', 'shared')
  assert.deepEqual(steps, ['business', 'requirements', 'materials', 'review'])
})

test('seo packages skip visual identity step', () => {
  assert.ok(!stepsFor('digital-marketing', 'audit').includes('visual'))
  assert.ok(!stepsFor('digital-marketing', 'seo-pflege').includes('visual'))
})

test('web design briefing includes visual step', () => {
  assert.ok(stepsFor('web-development', 'landing').includes('visual'))
})

test('quote-only custom routes to quotation', () => {
  assert.equal(evaluateNextAction('web-development', 'custom'), 'quote')
})

test('payable landing can checkout when in scope', () => {
  assert.equal(evaluateNextAction('web-development', 'landing'), 'checkout')
})

test('custom webapp intent forces review not silent charge', () => {
  assert.equal(
    evaluateNextAction('web-development', 'landing', { websitePurpose: 'webapp' }),
    'review',
  )
})

test('gated retainer cannot silent-checkout via briefing', () => {
  assert.equal(evaluateNextAction('web-hosting', 'care'), 'quote')
})

test('e-commerce packages remain under web-design shopCategory (taxonomy flag)', () => {
  for (const pkg of catalog['e-commerce'].packages) {
    assert.equal(pkg.shopCategory, 'web-design')
  }
})

test('invalid package id is not in catalog', () => {
  assert.equal(
    catalog['web-development'].packages.some((p) => p.id === 'does-not-exist'),
    false,
  )
})

test('one-time vs subscription modes stay distinct', () => {
  const landing = catalog['web-development'].packages.find((p) => p.id === 'landing')
  const care = catalog['web-hosting'].packages.find((p) => p.id === 'care')
  assert.equal(landing.purchaseMode, 'checkout')
  assert.equal(care.purchaseMode, 'subscription')
  assert.notEqual(landing.priceEur, care.priceEur)
})
