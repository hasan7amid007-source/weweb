import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Checkout with server-side price validation from api/shop-catalog.json.
 * Supports single package (legacy) or items[] for session cart.
 */

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
  addonPrices: { id: string; priceEur: number }[]
  lineTotal: number
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

function safeUrl(raw: string | undefined, fallback: string): string {
  const value = (raw || '').trim()
  if (!value) return fallback
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return fallback
    return url.toString()
  } catch {
    return fallback
  }
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
    const addonPrices = catalog[serviceRaw].addons.filter((a) => addonIds.includes(a.id))
    const lineTotal = pkg.priceEur + addonPrices.reduce((sum, a) => sum + a.priceEur, 0)
    lines.push({
      service: serviceRaw,
      packageId,
      addonIds,
      purchaseMode: pkg.purchaseMode,
      packagePrice: pkg.priceEur,
      addonPrices,
      lineTotal,
    })
  }

  if (!lines.length) {
    return { ok: false, error: 'Cart is empty', status: 400 }
  }
  return { ok: true, lines }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
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
    const totalEur = lines.reduce((sum, line) => sum + line.lineTotal, 0)
    const locale = String(body.locale || 'de').slice(0, 5)
    const origin = originFromReq(req)
    const primary = lines[0]!
    const successUrl = safeUrl(
      body.successUrl,
      `${origin}/order.html?session_id={CHECKOUT_SESSION_ID}&service=${encodeURIComponent(primary.service)}&package=${encodeURIComponent(primary.packageId)}&total=${totalEur}`,
    )
    const cancelUrl = safeUrl(body.cancelUrl, `${origin}/shop.html#cart`)

    const secret = (process.env.STRIPE_SECRET_KEY || '').trim()
    if (!secret) {
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
        lines.map((l) => `${l.service}:${l.packageId}`).join('|'),
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
    const line_items = lines.flatMap((line) => [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: line.packagePrice * 100,
          product_data: {
            name: `BDITEC ${line.service} / ${line.packageId}`,
            description:
              line.purchaseMode === 'subscription'
                ? 'Start amount (recurring billing terms pending business setup)'
                : 'Online start / deposit amount',
          },
        },
      },
      ...line.addonPrices.map((addon) => ({
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: addon.priceEur * 100,
          product_data: {
            name: `Extra: ${addon.id}`,
            description: `Add-on for ${line.service}`,
          },
        },
      })),
    ])

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      client_reference_id: `bditec-cart-${Date.now().toString(36)}`,
      success_url: successUrl.includes('{CHECKOUT_SESSION_ID}')
        ? successUrl
        : `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      line_items,
      metadata: {
        itemCount: String(lines.length),
        items: lines.map((l) => `${l.service}:${l.packageId}`).join('|').slice(0, 450),
        customerName: name.slice(0, 200),
        locale,
        totalEur: String(totalEur),
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
    })
  } catch (err) {
    console.error('[create-checkout]', err)
    return res.status(500).json({
      error: 'Checkout failed',
      detail: err instanceof Error ? err.message : 'unknown',
    })
  }
}
