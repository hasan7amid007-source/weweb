import type { VercelRequest, VercelResponse } from '@vercel/node'
import { orderLabel, validateOrderBody, type CreateCheckoutBody } from './_lib/order.js'
import { SERVICE_SHOP } from './_lib/shop-catalog.js'

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

function parseBody(req: VercelRequest): CreateCheckoutBody {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as CreateCheckoutBody
    } catch {
      return {}
    }
  }
  return req.body as CreateCheckoutBody
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
    const validated = validateOrderBody(body)
    if (!validated.ok) {
      return res.status(validated.status).json({ error: validated.error })
    }
    const { order } = validated
    const origin = originFromReq(req)
    const successUrl = safeUrl(
      body.successUrl,
      `${origin}/order.html?session_id={CHECKOUT_SESSION_ID}&service=${encodeURIComponent(order.service)}&package=${encodeURIComponent(order.packageId)}`,
    )
    const cancelUrl = safeUrl(body.cancelUrl, `${origin}/shop.html`)

    const secret = (process.env.STRIPE_SECRET_KEY || '').trim()
    if (!secret) {
      const demoId = `demo_${Date.now().toString(36)}`
      const demoUrl = new URL(`${origin}/order.html`)
      demoUrl.searchParams.set('demo', '1')
      demoUrl.searchParams.set('order', demoId)
      demoUrl.searchParams.set('service', order.service)
      demoUrl.searchParams.set('package', order.packageId)
      demoUrl.searchParams.set('total', String(order.totalEur))
      demoUrl.searchParams.set('email', order.email)
      demoUrl.searchParams.set('name', order.name)
      if (order.addonIds.length) demoUrl.searchParams.set('addons', order.addonIds.join(','))
      return res.status(200).json({
        mode: 'demo',
        url: demoUrl.toString(),
        totalEur: order.totalEur,
        orderId: demoId,
      })
    }

    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(secret)
    const pkg = SERVICE_SHOP[order.service].packages.find((p) => p.id === order.packageId)!
    const addonLines = SERVICE_SHOP[order.service].addons.filter((a) =>
      order.addonIds.includes(a.id),
    )

    const line_items = [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: pkg.priceEur * 100,
          product_data: {
            name: orderLabel(order.service, order.packageId),
            description:
              order.purchaseMode === 'subscription'
                ? 'Start amount (recurring billing terms pending business setup)'
                : 'Online start / deposit amount',
          },
        },
      },
      ...addonLines.map((addon) => ({
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: addon.priceEur * 100,
          product_data: {
            name: `Extra: ${addon.id}`,
            description: `Add-on for ${order.service}`,
          },
        },
      })),
    ]

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: order.email,
      client_reference_id: `bditec-${order.service}-${order.packageId}-${Date.now().toString(36)}`,
      success_url: successUrl.includes('{CHECKOUT_SESSION_ID}')
        ? successUrl
        : `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      line_items,
      metadata: {
        service: order.service,
        packageId: order.packageId,
        addonIds: order.addonIds.join(',') || 'none',
        purchaseMode: order.purchaseMode,
        customerName: order.name.slice(0, 200),
        locale: order.locale,
        totalEur: String(order.totalEur),
      },
    })

    if (!session.url) {
      return res.status(500).json({ error: 'Stripe session missing URL' })
    }

    return res.status(200).json({
      mode: 'stripe',
      url: session.url,
      sessionId: session.id,
      totalEur: order.totalEur,
    })
  } catch (err) {
    console.error('[create-checkout]', err)
    return res.status(500).json({
      error: 'Checkout failed',
      detail: err instanceof Error ? err.message : 'unknown',
    })
  }
}
