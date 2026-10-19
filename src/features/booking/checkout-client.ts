import type { BookingServiceKey } from './catalog'
import { resolveCheckout } from './catalog'

export type CheckoutRequest = {
  service: BookingServiceKey
  packageId: string
  addonIds: string[]
  email: string
  name: string
  locale: string
}

export type CheckoutResult =
  | { mode: 'stripe'; url: string; totalEur?: number }
  | { mode: 'demo'; url: string; totalEur?: number; orderId?: string }
  | { mode: 'unavailable'; error?: string }

/**
 * Prefer server /api/create-checkout (validated totals).
 * Fall back to Payment Links, then demo.
 */
export async function startCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
  const origin = window.location.origin
  const successUrl = `${origin}/order.html?session_id={CHECKOUT_SESSION_ID}&service=${encodeURIComponent(req.service)}&package=${encodeURIComponent(req.packageId)}`
  const cancelUrl = `${origin}/?service=${encodeURIComponent(req.service)}&package=${encodeURIComponent(req.packageId)}#booking`

  try {
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: req.service,
        packageId: req.packageId,
        addonIds: req.addonIds,
        email: req.email,
        name: req.name,
        locale: req.locale,
        successUrl,
        cancelUrl,
      }),
    })
    if (res.ok) {
      const data = (await res.json()) as {
        mode?: string
        url?: string
        totalEur?: number
        orderId?: string
        error?: string
      }
      if (data.url && (data.mode === 'stripe' || data.mode === 'demo')) {
        return {
          mode: data.mode,
          url: data.url,
          totalEur: data.totalEur,
          orderId: data.orderId,
        }
      }
    }
  } catch {
    /* API missing locally (vite-only) — fall through */
  }

  const link = resolveCheckout(req.service, req.email, req.packageId)
  if (link.mode === 'stripe') return { mode: 'stripe', url: link.url }
  if (link.mode === 'unavailable') return { mode: 'unavailable' }

  const demoUrl = new URL(`${origin}/order.html`)
  demoUrl.searchParams.set('demo', '1')
  demoUrl.searchParams.set('order', `demo_${Date.now().toString(36)}`)
  demoUrl.searchParams.set('service', req.service)
  demoUrl.searchParams.set('package', req.packageId)
  demoUrl.searchParams.set('email', req.email)
  demoUrl.searchParams.set('name', req.name)
  if (req.addonIds.length) demoUrl.searchParams.set('addons', req.addonIds.join(','))
  return { mode: 'demo', url: demoUrl.toString() }
}
