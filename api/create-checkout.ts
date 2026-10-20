import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyApiCors, safeSameSiteUrl } from './_lib/cors.js'

/**
 * Checkout with server-side price validation from api/shop-catalog.json.
 * Uses Stripe Price IDs when STRIPE_PRICE_* is set; otherwise price_data.
 * Subscription-only carts (all lines subscription + Price IDs) use mode=subscription.
 */

function packagePriceEnvKey(service: string, packageId: string): string {
  const s = service.replace(/-/g, '_').toUpperCase()
  const p = packageId.replace(/-/g, '_').toUpperCase()
  return `STRIPE_PRICE_${s}_${p}`
}

function addonPriceEnvKey(service: string, addonId: string): string {
  const s = service.replace(/-/g, '_').toUpperCase()
  const a = addonId.replace(/-/g, '_').toUpperCase()
  return `STRIPE_PRICE_${s}_ADDON_${a}`
}

function resolvePackagePriceId(service: string, packageId: string): string | undefined {
  const id = (process.env[packagePriceEnvKey(service, packageId)] || '').trim()
  return id.startsWith('price_') ? id : undefined
}

function resolveAddonPriceId(service: string, addonId: string): string | undefined {
  const id = (process.env[addonPriceEnvKey(service, addonId)] || '').trim()
  return id.startsWith('price_') ? id : undefined
}

type PurchaseMode = 'checkout' | 'subscription' | 'quote'
type ServiceKey =
  | 'general'
  | 'web-hosting'
  | 'mobile-app'
  | 'web-development'
  | 'e-commerce'
  | 'digital-marketing'
  | 'offline-marketing'

type Shop = {
  packages: {
    id: string
    priceEur: number
    purchaseMode: PurchaseMode
    shopCategory?: string
    recommended?: boolean
  }[]
  addons: { id: string; priceEur: number }[]
}

type Catalog = Record<ServiceKey, Shop>

type CartItemIn = {
  service?: string
  packageId?: string
  addonIds?: string[]
}

type Body = {
  service?: string
  packageId?: string
  addonIds?: string[]
  items?: CartItemIn[]
  email?: string
  name?: string
  locale?: string
  successUrl?: string
  cancelUrl?: string
}

type ResolvedLine = {
  service: ServiceKey
  packageId: string
  addonIds: string[]
  purchaseMode: PurchaseMode
  packagePrice: number
  addonPrices: { id: string; priceEur: number; priceId?: string }[]
  lineTotal: number
  packagePriceId?: string
}

function loadCatalog(): Catalog {
  const here = dirname(fileURLToPath(import.meta.url))
  const raw = readFileSync(join(here, 'shop-catalog.json'), 'utf8')
  return JSON.parse(raw) as Catalog
}

function isServiceKey(v: string, catalog: Catalog): v is ServiceKey {
  return Object.prototype.hasOwnProperty.call(catalog, v)
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

function originFromReq(req: VercelRequest): string {
  const proto = String(req.headers['x-forwarded-proto'] || 'https')
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'weweb-weld.vercel.app')
  return `${proto}://${host}`
}

function resolveLines(
  catalog: Catalog,
  body: Body,
): { ok: true; lines: ResolvedLine[] } | { ok: false; error: string; status: number } {
  const rawItems: CartItemIn[] =
    Array.isArray(body.items) && body.items.length > 0
      ? body.items
      : [{ service: body.service, packageId: body.packageId, addonIds: body.addonIds }]

  if (rawItems.length > 8) {
    return { ok: false, error: 'Too many cart items (max 8)', status: 400 }
  }

  const lines: ResolvedLine[] = []
  const seen = new Set<string>()

  for (const raw of rawItems) {
    const serviceRaw = String(raw.service || '').trim()
    if (!isServiceKey(serviceRaw, catalog)) {
      return { ok: false, error: 'Invalid service', status: 400 }
    }
    const packageId = String(raw.packageId || '').trim()
    const pkg = catalog[serviceRaw].packages.find((p) => p.id === packageId)
    if (!pkg) {
      return { ok: false, error: 'Invalid package', status: 400 }
    }
    if (pkg.purchaseMode === 'quote') {
      return { ok: false, error: 'Package requires a quote, not checkout', status: 400 }
    }
    const key = `${serviceRaw}:${packageId}`
    if (seen.has(key)) continue
    seen.add(key)
    const addonIds = (Array.isArray(raw.addonIds) ? raw.addonIds : [])
      .map((id) => String(id))
      .filter((id) => catalog[serviceRaw].addons.some((a) => a.id === id))
    const addonPrices = catalog[serviceRaw].addons
      .filter((a) => addonIds.includes(a.id))
      .map((a) => ({
        id: a.id,
        priceEur: a.priceEur,
        priceId: resolveAddonPriceId(serviceRaw, a.id),
      }))
    const lineTotal = pkg.priceEur + addonPrices.reduce((sum, a) => sum + a.priceEur, 0)
    lines.push({
      service: serviceRaw,
      packageId,
      addonIds,
      purchaseMode: pkg.purchaseMode,
      packagePrice: pkg.priceEur,
      addonPrices,
      lineTotal,
      packagePriceId: resolvePackagePriceId(serviceRaw, packageId),
    })
  }

  if (!lines.length) {
    return { ok: false, error: 'Cart is empty', status: 400 }
  }
  return { ok: true, lines }
}

/** Billing subscription Checkout only when every line is subscription + has Price ID and no one-time addons. */
function useSubscriptionMode(lines: ResolvedLine[]): boolean {
  if (!lines.length) return false
  return lines.every(
    (line) =>
      line.purchaseMode === 'subscription' &&
      !!line.packagePriceId &&
      line.addonPrices.length === 0,
  )
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!applyApiCors(req, res)) {
      return res.status(403).json({ error: 'Origin not allowed' })
    }
    if (req.method === 'OPTIONS') {
      return res.status(204).end()
    }
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const catalog = loadCatalog()
    const body = parseBody(req)
    const resolved = resolveLines(catalog, body)
    if (!resolved.ok) {
      return res.status(resolved.status).json({ error: resolved.error })
    }
    const { lines } = resolved
    const email = String(body.email || '').trim()
    const name = String(body.name || '').trim()
    if (!email.includes('@') || !name) {
      return res.status(400).json({ error: 'Name and valid email required' })
    }
    if (email.length > 254 || name.length > 120) {
      return res.status(400).json({ error: 'Name or email too long' })
    }
    const totalEur = lines.reduce((sum, line) => sum + line.lineTotal, 0)
    const locale = String(body.locale || 'de').slice(0, 5)
    const origin = originFromReq(req)
    const primary = lines[0]!
    const successUrl = safeSameSiteUrl(
      body.successUrl,
      `${origin}/order.html?session_id={CHECKOUT_SESSION_ID}&service=${encodeURIComponent(primary.service)}&package=${encodeURIComponent(primary.packageId)}&total=${totalEur}&email=${encodeURIComponent(email)}`,
    )
    const cancelUrl = safeSameSiteUrl(body.cancelUrl, `${origin}/shop.html#cart`)

    const secret = (process.env.STRIPE_SECRET_KEY || '').trim()
    // Soft-launch: only real secret keys (sk_test_ / sk_live_). pk_/rk_/empty → demo checkout.
    const stripeReady = secret.startsWith('sk_test_') || secret.startsWith('sk_live_')
    if (!stripeReady) {
      const demoId = `demo_${Date.now().toString(36)}`
      const demoUrl = new URL(`${origin}/order.html`)
      demoUrl.searchParams.set('demo', '1')
      demoUrl.searchParams.set('order', demoId)
      demoUrl.searchParams.set('service', primary.service)
      demoUrl.searchParams.set('package', primary.packageId)
      demoUrl.searchParams.set('total', String(totalEur))
      demoUrl.searchParams.set('email', email)
      demoUrl.searchParams.set('name', name)
      demoUrl.searchParams.set(
        'items',
        lines
          .map((l) => {
            const base = `${l.service}:${l.packageId}`
            return l.addonIds.length ? `${base}:${l.addonIds.join('+')}` : base
          })
          .join('|'),
      )
      if (primary.addonIds.length) demoUrl.searchParams.set('addons', primary.addonIds.join(','))
      return res.status(200).json({
        mode: 'demo',
        url: demoUrl.toString(),
        totalEur,
        orderId: demoId,
        itemCount: lines.length,
      })
    }

    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(secret)
    const subscriptionMode = useSubscriptionMode(lines)
    const checkoutMode = subscriptionMode ? 'subscription' : 'payment'

    const line_items = lines.flatMap((line) => {
      const packageItem = line.packagePriceId
        ? { quantity: 1, price: line.packagePriceId }
        : {
            quantity: 1,
            price_data: {
              currency: 'eur' as const,
              unit_amount: line.packagePrice * 100,
              ...(subscriptionMode
                ? { recurring: { interval: 'month' as const } }
                : {}),
              product_data: {
                name: `BDITEC ${line.service} / ${line.packageId}`,
                description: subscriptionMode
                  ? 'Monthly subscription (catalog start amount)'
                  : 'Online start / deposit amount',
              },
            },
          }

      const addonItems = line.addonPrices.map((addon) =>
        addon.priceId
          ? { quantity: 1, price: addon.priceId }
          : {
              quantity: 1,
              price_data: {
                currency: 'eur' as const,
                unit_amount: addon.priceEur * 100,
                product_data: {
                  name: `Extra: ${addon.id}`,
                  description: `Add-on for ${line.service}`,
                },
              },
            },
      )

      return [packageItem, ...addonItems]
    })

    const session = await stripe.checkout.sessions.create({
      mode: checkoutMode,
      customer_email: email,
      client_reference_id: `bditec-cart-${Date.now().toString(36)}`,
      success_url: successUrl.includes('{CHECKOUT_SESSION_ID}')
        ? successUrl
        : `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      line_items,
      ...(checkoutMode === 'payment' ? { customer_creation: 'always' as const } : {}),
      metadata: {
        itemCount: String(lines.length),
        items: lines.map((l) => `${l.service}:${l.packageId}`).join('|').slice(0, 450),
        customerName: name.slice(0, 200),
        locale,
        totalEur: String(totalEur),
        checkoutMode,
      },
    })

    if (!session.url) {
      return res.status(500).json({ error: 'Stripe session missing URL' })
    }

    return res.status(200).json({
      mode: 'stripe',
      url: session.url,
      sessionId: session.id,
      totalEur,
      itemCount: lines.length,
      checkoutMode,
    })
  } catch (err) {
    console.error('[create-checkout]', err)
    return res.status(500).json({
      error: 'Checkout failed',
      detail: err instanceof Error ? err.message : 'unknown',
    })
  }
}
