import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Single-file checkout handler (no relative imports — Vercel Node ESM
 * does not reliably package api/_lib for this Vite MPA).
 * Keep prices aligned with src/features/booking/shop-catalog.ts.
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
  packages: { id: string; priceEur: number; purchaseMode: PurchaseMode }[]
  addons: { id: string; priceEur: number }[]
}

const SERVICE_SHOP: Record<ServiceKey, Shop> = {
  general: {
    packages: [
      { id: 'kickoff', priceEur: 49, purchaseMode: 'checkout' },
      { id: 'briefing', priceEur: 89, purchaseMode: 'checkout' },
      { id: 'roadmap', priceEur: 149, purchaseMode: 'quote' },
    ],
    addons: [
      { id: 'priority', priceEur: 39 },
      { id: 'competitor', priceEur: 59 },
    ],
  },
  'web-hosting': {
    packages: [
      { id: 'shared', priceEur: 79, purchaseMode: 'checkout' },
      { id: 'vps', priceEur: 129, purchaseMode: 'subscription' },
      { id: 'dedicated', priceEur: 249, purchaseMode: 'quote' },
    ],
    addons: [
      { id: 'migration', priceEur: 49 },
      { id: 'ssl-backup', priceEur: 29 },
      { id: 'monitoring', priceEur: 39 },
    ],
  },
  'mobile-app': {
    packages: [
      { id: 'mvp', priceEur: 149, purchaseMode: 'checkout' },
      { id: 'launch', priceEur: 299, purchaseMode: 'quote' },
      { id: 'scale', priceEur: 499, purchaseMode: 'quote' },
    ],
    addons: [
      { id: 'ui-kit', priceEur: 79 },
      { id: 'store-assets', priceEur: 59 },
      { id: 'api-extra', priceEur: 99 },
    ],
  },
  'web-development': {
    packages: [
      { id: 'landing', priceEur: 99, purchaseMode: 'checkout' },
      { id: 'business', priceEur: 199, purchaseMode: 'checkout' },
      { id: 'custom', priceEur: 399, purchaseMode: 'quote' },
    ],
    addons: [
      { id: 'cms', priceEur: 69 },
      { id: 'seo-tech', priceEur: 49 },
      { id: 'forms', priceEur: 39 },
    ],
  },
  'e-commerce': {
    packages: [
      { id: 'starter', priceEur: 129, purchaseMode: 'checkout' },
      { id: 'growth', priceEur: 249, purchaseMode: 'checkout' },
      { id: 'scale', priceEur: 449, purchaseMode: 'quote' },
    ],
    addons: [
      { id: 'payments', priceEur: 59 },
      { id: 'catalog', priceEur: 79 },
      { id: 'shipping', priceEur: 49 },
    ],
  },
  'digital-marketing': {
    packages: [
      { id: 'audit', priceEur: 99, purchaseMode: 'checkout' },
      { id: 'campaign', priceEur: 199, purchaseMode: 'checkout' },
      { id: 'retainer', priceEur: 349, purchaseMode: 'subscription' },
    ],
    addons: [
      { id: 'ads-setup', priceEur: 69 },
      { id: 'content-pack', priceEur: 89 },
      { id: 'reporting', priceEur: 39 },
    ],
  },
  'offline-marketing': {
    packages: [
      { id: 'print', priceEur: 89, purchaseMode: 'checkout' },
      { id: 'campaign', priceEur: 179, purchaseMode: 'quote' },
      { id: 'event', priceEur: 299, purchaseMode: 'quote' },
    ],
    addons: [
      { id: 'design', priceEur: 59 },
      { id: 'print-prod', priceEur: 79 },
      { id: 'install', priceEur: 69 },
    ],
  },
}

function isServiceKey(v: string): v is ServiceKey {
  return Object.prototype.hasOwnProperty.call(SERVICE_SHOP, v)
}

type Body = {
  service?: string
  packageId?: string
  addonIds?: string[]
  email?: string
  name?: string
  locale?: string
  successUrl?: string
  cancelUrl?: string
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

    const body = parseBody(req)
    const serviceRaw = String(body.service || '').trim()
    if (!isServiceKey(serviceRaw)) {
      return res.status(400).json({ error: 'Invalid service' })
    }
    const packageId = String(body.packageId || '').trim()
    const pkg = SERVICE_SHOP[serviceRaw].packages.find((p) => p.id === packageId)
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid package' })
    }
    if (pkg.purchaseMode === 'quote') {
      return res.status(400).json({ error: 'Package requires a quote, not checkout' })
    }
    const addonIds = (Array.isArray(body.addonIds) ? body.addonIds : [])
      .map((id) => String(id))
      .filter((id) => SERVICE_SHOP[serviceRaw].addons.some((a) => a.id === id))
    const email = String(body.email || '').trim()
    const name = String(body.name || '').trim()
    if (!email.includes('@') || !name) {
      return res.status(400).json({ error: 'Name and valid email required' })
    }
    const addons = SERVICE_SHOP[serviceRaw].addons.filter((a) => addonIds.includes(a.id))
    const totalEur = pkg.priceEur + addons.reduce((sum, a) => sum + a.priceEur, 0)
    const locale = String(body.locale || 'de').slice(0, 5)
    const origin = originFromReq(req)
    const successUrl = safeUrl(
      body.successUrl,
      `${origin}/order.html?session_id={CHECKOUT_SESSION_ID}&service=${encodeURIComponent(serviceRaw)}&package=${encodeURIComponent(packageId)}`,
    )
    const cancelUrl = safeUrl(body.cancelUrl, `${origin}/shop.html`)

    const secret = (process.env.STRIPE_SECRET_KEY || '').trim()
    if (!secret) {
      const demoId = `demo_${Date.now().toString(36)}`
      const demoUrl = new URL(`${origin}/order.html`)
      demoUrl.searchParams.set('demo', '1')
      demoUrl.searchParams.set('order', demoId)
      demoUrl.searchParams.set('service', serviceRaw)
      demoUrl.searchParams.set('package', packageId)
      demoUrl.searchParams.set('total', String(totalEur))
      demoUrl.searchParams.set('email', email)
      demoUrl.searchParams.set('name', name)
      if (addonIds.length) demoUrl.searchParams.set('addons', addonIds.join(','))
      return res.status(200).json({
        mode: 'demo',
        url: demoUrl.toString(),
        totalEur,
        orderId: demoId,
      })
    }

    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(secret)
    const line_items = [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: pkg.priceEur * 100,
          product_data: {
            name: `BDITEC ${serviceRaw} / ${packageId}`,
            description:
              pkg.purchaseMode === 'subscription'
                ? 'Start amount (recurring billing terms pending business setup)'
                : 'Online start / deposit amount',
          },
        },
      },
      ...addons.map((addon) => ({
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: addon.priceEur * 100,
          product_data: {
            name: `Extra: ${addon.id}`,
            description: `Add-on for ${serviceRaw}`,
          },
        },
      })),
    ]

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      client_reference_id: `bditec-${serviceRaw}-${packageId}-${Date.now().toString(36)}`,
      success_url: successUrl.includes('{CHECKOUT_SESSION_ID}')
        ? successUrl
        : `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      line_items,
      metadata: {
        service: serviceRaw,
        packageId,
        addonIds: addonIds.join(',') || 'none',
        purchaseMode: pkg.purchaseMode,
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
    })
  } catch (err) {
    console.error('[create-checkout]', err)
    return res.status(500).json({
      error: 'Checkout failed',
      detail: err instanceof Error ? err.message : 'unknown',
    })
  }
}
