import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Stripe webhook — signature verify + Billing lifecycle events.
 * Duplicate events: in-memory set (soft-launch). Prefer durable store (KV) for production.
 *
 * Subscribe in Dashboard (test then live):
 * - checkout.session.completed
 * - invoice.paid
 * - invoice.payment_failed
 * - customer.subscription.updated
 * - customer.subscription.deleted
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

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          id: string
          mode: string | null
          amount_total: number | null
          currency: string | null
          metadata: Record<string, string> | null
          customer: string | null
          customer_email: string | null
          payment_status: string
          subscription: string | null
        }
        console.info('[stripe-webhook] checkout.session.completed', {
          id: event.id,
          sessionId: session.id,
          mode: session.mode,
          amount_total: session.amount_total,
          currency: session.currency,
          metadata: session.metadata,
          customer: session.customer,
          customer_email: session.customer_email,
          payment_status: session.payment_status,
          subscription: session.subscription,
        })
        break
      }
      case 'invoice.paid': {
        const invoice = event.data.object as {
          id: string
          customer: string | null
          subscription: string | null
          amount_paid: number
          currency: string
          status: string
        }
        console.info('[stripe-webhook] invoice.paid', {
          id: event.id,
          invoiceId: invoice.id,
          customer: invoice.customer,
          subscription: invoice.subscription,
          amount_paid: invoice.amount_paid,
          currency: invoice.currency,
          status: invoice.status,
        })
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as {
          id: string
          customer: string | null
          subscription: string | null
          amount_due: number
          currency: string
          attempt_count: number | null
        }
        console.info('[stripe-webhook] invoice.payment_failed', {
          id: event.id,
          invoiceId: invoice.id,
          customer: invoice.customer,
          subscription: invoice.subscription,
          amount_due: invoice.amount_due,
          currency: invoice.currency,
          attempt_count: invoice.attempt_count,
        })
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as {
          id: string
          customer: string
          status: string
          cancel_at_period_end: boolean
        }
        console.info(`[stripe-webhook] ${event.type}`, {
          id: event.id,
          subscriptionId: sub.id,
          customer: sub.customer,
          status: sub.status,
          cancel_at_period_end: sub.cancel_at_period_end,
        })
        break
      }
      default:
        console.info('[stripe-webhook] unhandled', { id: event.id, type: event.type })
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
