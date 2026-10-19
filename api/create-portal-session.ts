import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Stripe Customer Portal session (Billing self-serve).
 * Requires Customer Portal enabled in Dashboard + STRIPE_SECRET_KEY.
 */

type Body = {
  email?: string
  customerId?: string
  returnUrl?: string
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

    const secret = (process.env.STRIPE_SECRET_KEY || '').trim()
    if (!secret) {
      return res.status(503).json({
        error: 'Portal unavailable until STRIPE_SECRET_KEY is configured (use test key first)',
      })
    }

    const body = parseBody(req)
    const email = String(body.email || '').trim()
    let customerId = String(body.customerId || '').trim()
    const origin = originFromReq(req)
    const returnUrl = (body.returnUrl || `${origin}/order.html`).trim()

    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(secret)

    if (!customerId) {
      if (!email.includes('@')) {
        return res.status(400).json({ error: 'Valid email or customerId required' })
      }
      const list = await stripe.customers.list({ email, limit: 1 })
      const customer = list.data[0]
      if (!customer) {
        return res.status(404).json({
          error: 'No Stripe customer found for this email. Complete a checkout first.',
        })
      }
      customerId = customer.id
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl.startsWith('http') ? returnUrl : `${origin}/order.html`,
    })

    if (!session.url) {
      return res.status(500).json({ error: 'Portal session missing URL' })
    }

    return res.status(200).json({ url: session.url, customerId })
  } catch (err) {
    console.error('[create-portal-session]', err)
    return res.status(500).json({
      error: 'Portal session failed',
      detail: err instanceof Error ? err.message : 'unknown',
    })
  }
}
