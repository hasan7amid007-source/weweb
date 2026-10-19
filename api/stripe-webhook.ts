import type { VercelRequest, VercelResponse } from '@vercel/node'
import { claimWebhookEvent, releaseWebhookEvent } from './_lib/webhook-events.js'

/**
 * Stripe webhook — signature verify + Billing lifecycle events.
 * Idempotency: Vercel KV / Upstash REST when configured; else in-memory (soft-launch).
 * Claim-first; release on handler failure so Stripe can retry.
 *
 * Subscribe in Dashboard (test then live):
 * - checkout.session.completed
 * - invoice.paid
 * - invoice.payment_failed
 * - customer.subscription.updated
 * - customer.subscription.deleted
 */

export const config = {
  api: {
    bodyParser: false,
  },
}

async function rawBody(req: VercelRequest): Promise<Uint8Array> {
  const chunks: Uint8Array[] = []
  for await (const chunk of req) {
    const buf = typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk)
    chunks.push(new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength))
  }
  const total = chunks.reduce((n, c) => n + c.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) {
    out.set(c, offset)
    offset += c.length
  }
  return out
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

    const claim = await claimWebhookEvent(event.id)
    if (claim.status === 'duplicate') {
      return res.status(200).json({ received: true, duplicate: true, backend: claim.backend })
    }

    try {
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
          const invoice = event.data.object as unknown as {
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
          const invoice = event.data.object as unknown as {
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
    } catch (handlerErr) {
      await releaseWebhookEvent(event.id, claim.backend)
      throw handlerErr
    }

    return res.status(200).json({ received: true, backend: claim.backend })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error'
    console.error('[stripe-webhook]', message)
    return res.status(400).send(`Webhook Error: ${message}`)
  }
}
