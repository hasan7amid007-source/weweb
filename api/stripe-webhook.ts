import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Stripe webhook — verifies signature, handles checkout.session.completed.
 * Duplicate events: in-memory set (soft-launch). Production should persist event.id.
 */

const processed = new Set<string>()
const PROCESSED_CAP = 500

export const config = {
  api: {
    bodyParser: false,
  },
}

async function rawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).send('Method not allowed')
    }

    const secret = (process.env.STRIPE_SECRET_KEY || '').trim()
    const whSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim()
    if (!secret || !whSecret) {
      return res.status(503).json({
        error: 'Stripe webhook not configured (STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET)',
      })
    }

    const signature = req.headers['stripe-signature']
    if (!signature || Array.isArray(signature)) {
      return res.status(400).send('Missing stripe-signature')
    }

    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(secret)
    const buf = await rawBody(req)
    const event = stripe.webhooks.constructEvent(buf, signature, whSecret)

    if (processed.has(event.id)) {
      return res.status(200).json({ received: true, duplicate: true })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as {
        id: string
        amount_total: number | null
        currency: string | null
        metadata: Record<string, string> | null
        customer_email: string | null
        payment_status: string
      }
      console.info('[stripe-webhook] checkout.session.completed', {
        id: event.id,
        sessionId: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
        customer_email: session.customer_email,
        payment_status: session.payment_status,
      })
    }

    processed.add(event.id)
    if (processed.size > PROCESSED_CAP) {
      const first = processed.values().next().value
      if (first) processed.delete(first)
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error'
    console.error('[stripe-webhook]', message)
    return res.status(400).send(`Webhook Error: ${message}`)
  }
}
