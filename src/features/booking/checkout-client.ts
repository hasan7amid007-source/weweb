import type { BookingServiceKey } from './catalog'
import { resolveCheckout } from './catalog'
import { calcOrderTotalEur } from './shop-catalog'
import type { CartLine } from '../shop/cart'

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

async function postCheckout(payload: Record<string, unknown>): Promise<CheckoutResult | null> {
  try {
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string }
      return { mode: 'unavailable', error: err.error }
    }
    const data = (await res.json()) as {
      mode?: string
      url?: string
      totalEur?: number
      orderId?: string
    }
    if (data.url && (data.mode === 'stripe' || data.mode === 'demo')) {
      return {
        mode: data.mode,
        url: data.url,
        totalEur: data.totalEur,
        orderId: data.orderId,
      }
    }
  } catch {
    /* API missing locally */
  }
  return null
}

/**
 * Prefer server /api/create-checkout (validated totals).
 * Fall back to Payment Links, then demo.
 */
export async function startCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
  const origin = window.location.origin
  const successUrl = `${origin}/order.html?session_id={CHECKOUT_SESSION_ID}&service=${encodeURIComponent(req.service)}&package=${encodeURIComponent(req.packageId)}`
  const cancelUrl = `${origin}/?service=${encodeURIComponent(req.service)}&package=${encodeURIComponent(req.packageId)}#booking`

  const api = await postCheckout({
    service: req.service,
    packageId: req.packageId,
    addonIds: req.addonIds,
    email: req.email,
    name: req.name,
    locale: req.locale,
    successUrl,
    cancelUrl,
  })
  if (api) return api

  const link = resolveCheckout(req.service, req.email, req.packageId)
  if (link.mode === 'stripe') return { mode: 'stripe', url: link.url }
  if (link.mode === 'unavailable') return { mode: 'unavailable' }

  const totalEur = calcOrderTotalEur(req.service, req.packageId, req.addonIds)
  const demoId = `demo_${Date.now().toString(36)}`
  const demoUrl = new URL(`${origin}/order.html`)
  demoUrl.searchParams.set('demo', '1')
  demoUrl.searchParams.set('order', demoId)
  demoUrl.searchParams.set('service', req.service)
  demoUrl.searchParams.set('package', req.packageId)
  demoUrl.searchParams.set('total', String(totalEur))
  demoUrl.searchParams.set('email', req.email)
  demoUrl.searchParams.set('name', req.name)
  const itemsBase = `${req.service}:${req.packageId}`
  demoUrl.searchParams.set(
    'items',
    req.addonIds.length ? `${itemsBase}:${req.addonIds.join('+')}` : itemsBase,
  )
  if (req.addonIds.length) demoUrl.searchParams.set('addons', req.addonIds.join(','))
  return { mode: 'demo', url: demoUrl.toString(), totalEur, orderId: demoId }
}

/** Multi-package cart checkout via server-validated items[]. */
export async function startCartCheckout(input: {
  items: CartLine[]
  email: string
  name: string
  locale: string
}): Promise<CheckoutResult> {
  if (!input.items.length) return { mode: 'unavailable', error: 'Cart is empty' }
  const origin = window.location.origin
  const primary = input.items[0]!
  const successUrl = `${origin}/order.html?session_id={CHECKOUT_SESSION_ID}&service=${encodeURIComponent(primary.service)}&package=${encodeURIComponent(primary.packageId)}`
  const cancelUrl = `${origin}/shop.html#cart`

  const api = await postCheckout({
    items: input.items.map((line) => ({
      service: line.service,
      packageId: line.packageId,
      addonIds: line.addonIds,
    })),
    email: input.email,
    name: input.name,
    locale: input.locale,
    successUrl,
    cancelUrl,
  })
  if (api) return api

  // Multi-item carts require server validation — do not silently charge only the first line.
  if (input.items.length > 1) {
    return { mode: 'unavailable', error: 'Cart checkout unavailable' }
  }
  return startCheckout({
    service: primary.service,
    packageId: primary.packageId,
    addonIds: primary.addonIds,
    email: input.email,
    name: input.name,
    locale: input.locale,
  })
}
