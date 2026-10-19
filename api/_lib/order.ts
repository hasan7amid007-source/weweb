import {
  SERVICE_SHOP,
  calcOrderTotalEur,
  isAddonId,
  isPackageId,
  type BookingServiceKey,
  type PurchaseMode,
} from './shop-catalog'

export type CreateCheckoutBody = {
  service?: string
  packageId?: string
  addonIds?: string[]
  email?: string
  name?: string
  locale?: string
  successUrl?: string
  cancelUrl?: string
}

export type ValidatedOrder = {
  service: BookingServiceKey
  packageId: string
  addonIds: string[]
  purchaseMode: PurchaseMode
  totalEur: number
  email: string
  name: string
  locale: string
}

const SERVICE_KEYS = new Set<string>([
  'general',
  'web-hosting',
  'mobile-app',
  'web-development',
  'e-commerce',
  'digital-marketing',
  'offline-marketing',
])

export function isServiceKey(v: string): v is BookingServiceKey {
  return SERVICE_KEYS.has(v)
}

export function validateOrderBody(
  body: CreateCheckoutBody,
): { ok: true; order: ValidatedOrder } | { ok: false; error: string; status: number } {
  const serviceRaw = String(body.service || '').trim()
  if (!isServiceKey(serviceRaw)) {
    return { ok: false, error: 'Invalid service', status: 400 }
  }
  const packageId = String(body.packageId || '').trim()
  if (!isPackageId(serviceRaw, packageId)) {
    return { ok: false, error: 'Invalid package', status: 400 }
  }
  const pkg = SERVICE_SHOP[serviceRaw].packages.find((p) => p.id === packageId)!
  if (pkg.purchaseMode === 'quote') {
    return { ok: false, error: 'Package requires a quote, not checkout', status: 400 }
  }
  const addonIds = (Array.isArray(body.addonIds) ? body.addonIds : [])
    .map((id) => String(id))
    .filter((id) => isAddonId(serviceRaw, id))
  const email = String(body.email || '').trim()
  const name = String(body.name || '').trim()
  if (!email || !email.includes('@')) {
    return { ok: false, error: 'Valid email required', status: 400 }
  }
  if (!name) {
    return { ok: false, error: 'Name required', status: 400 }
  }
  const totalEur = calcOrderTotalEur(serviceRaw, packageId, addonIds)
  if (!Number.isFinite(totalEur) || totalEur <= 0) {
    return { ok: false, error: 'Invalid amount', status: 400 }
  }
  return {
    ok: true,
    order: {
      service: serviceRaw,
      packageId,
      addonIds,
      purchaseMode: pkg.purchaseMode,
      totalEur,
      email,
      name,
      locale: String(body.locale || 'de').slice(0, 5),
    },
  }
}

export function orderLabel(service: BookingServiceKey, packageId: string): string {
  return `BDITEC ${service} / ${packageId}`
}
