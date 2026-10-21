import type { BookingServiceKey } from './catalog'
import type { CartLine } from '../shop/cart'

export type CheckoutRequest = {
  service: BookingServiceKey
  packageId: string
  addonIds: string[]
  email: string
  name: string
  locale: string
  briefingRef?: string
  briefingToken?: string
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
 * Prefer server /api/create-checkout (validated totals + server-owned success URL).
 * Fall back to local demo only (Payment Links no longer used as live signal).
 */
export async function startCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
  const origin = window.location.origin
  const cancelUrl = `${origin}/?service=${encodeURIComponent(req.service)}&package=${encodeURIComponent(req.packageId)}#booking`

  const api = await postCheckout({
    service: req.service,
    packageId: req.packageId,
    addonIds: req.addonIds,
    email: req.email,
    name: req.name,
    locale: req.locale,
    cancelUrl,
    briefingRef: req.briefingRef,
    briefingToken: req.briefingToken,
  })
  if (api) return api

  // Without API (or when API rejects), do not invent a local demo that bypasses briefing auth.
  if (!req.briefingRef || !req.briefingToken) {
    return {
      mode: 'unavailable',
      error: 'Briefing authorization required before checkout',
    }
  }
  return {
    mode: 'unavailable',
    error: 'Checkout unavailable — complete a retained briefing or retry when the API is reachable',
  }
}

/** Multi-package cart checkout via server-validated items[]. */
export async function startCartCheckout(input: {
  items: CartLine[]
  email: string
  name: string
  locale: string
  briefingRef?: string
  briefingToken?: string
}): Promise<CheckoutResult> {
  if (!input.items.length) return { mode: 'unavailable', error: 'Cart is empty' }
  if (input.items.length > 1) {
    return {
      mode: 'unavailable',
      error:
        'Multi-item checkout unavailable — keep one package in the cart, complete its briefing, then pay',
    }
  }
  const origin = window.location.origin
  const primary = input.items[0]!
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
    cancelUrl,
    briefingRef: input.briefingRef,
    briefingToken: input.briefingToken,
  })
  if (api) return api

  return startCheckout({
    service: primary.service,
    packageId: primary.packageId,
    addonIds: primary.addonIds,
    email: input.email,
    name: input.name,
    locale: input.locale,
    briefingRef: input.briefingRef,
    briefingToken: input.briefingToken,
  })
}
