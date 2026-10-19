import { SERVICE_IDS, type ServiceId } from '../../data/services'

export type BookingServiceKey = ServiceId | 'general'

/** Kickoff / consultation deposit (EUR) — credited toward the project. */
export const BOOKING_DEPOSITS_EUR: Record<BookingServiceKey, number> = {
  general: 49,
  'web-hosting': 79,
  'mobile-app': 149,
  'web-development': 99,
  'e-commerce': 129,
  'digital-marketing': 99,
  'offline-marketing': 89,
}

const ENV_LINK_SERVICE: Record<BookingServiceKey, string | undefined> = {
  general: import.meta.env.VITE_STRIPE_LINK_GENERAL,
  'web-hosting': import.meta.env.VITE_STRIPE_LINK_WEB_HOSTING,
  'mobile-app': import.meta.env.VITE_STRIPE_LINK_MOBILE_APP,
  'web-development': import.meta.env.VITE_STRIPE_LINK_WEB_DEVELOPMENT,
  'e-commerce': import.meta.env.VITE_STRIPE_LINK_E_COMMERCE,
  'digital-marketing': import.meta.env.VITE_STRIPE_LINK_DIGITAL_MARKETING,
  'offline-marketing': import.meta.env.VITE_STRIPE_LINK_OFFLINE_MARKETING,
}

/** Env key fragment: web-development + landing → WEB_DEVELOPMENT_LANDING */
function packageEnvKey(service: BookingServiceKey, packageId: string): string {
  const s = service.replace(/-/g, '_').toUpperCase()
  const p = packageId.replace(/-/g, '_').toUpperCase()
  return `VITE_STRIPE_LINK_${s}_${p}`
}

function envLink(key: string): string {
  const bag = import.meta.env as Record<string, string | undefined>
  return (bag[key] || '').trim()
}

export function isBookingServiceKey(v: string): v is BookingServiceKey {
  return v === 'general' || (SERVICE_IDS as readonly string[]).includes(v)
}

export function formatEur(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar' : locale === 'en' ? 'en-GB' : 'de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Stripe Payment Link when configured (package-level preferred, then service-level).
 * Soft-launch default: demo checkout when links are missing.
 */
export function hasLiveStripeCheckout(): boolean {
  const bag = import.meta.env as Record<string, string | undefined>
  return Object.keys(bag).some(
    (key) => key.startsWith('VITE_STRIPE_LINK_') && (bag[key] || '').trim().startsWith('https://'),
  )
}

export function resolveCheckout(
  service: BookingServiceKey,
  email: string,
  packageId?: string,
): { mode: 'stripe'; url: string } | { mode: 'demo' } | { mode: 'unavailable' } {
  const packageRaw =
    packageId && packageId.length > 0 ? envLink(packageEnvKey(service, packageId)) : ''
  const serviceRaw = (ENV_LINK_SERVICE[service] || '').trim()
  const raw = packageRaw.startsWith('https://')
    ? packageRaw
    : serviceRaw.startsWith('https://')
      ? serviceRaw
      : ''

  if (raw.startsWith('https://')) {
    const url = new URL(raw)
    if (email) url.searchParams.set('prefilled_email', email)
    url.searchParams.set(
      'client_reference_id',
      `bditec-${service}-${packageId || 'pkg'}-${Date.now().toString(36)}`,
    )
    return { mode: 'stripe', url: url.toString() }
  }
  if (import.meta.env.VITE_BOOKING_DEMO_PAY === 'false') {
    return { mode: 'unavailable' }
  }
  return { mode: 'demo' }
}

export const BOOKING_STORAGE_KEY = 'bditec-booking-draft'
export const ORDER_BRIEFING_KEY = 'bditec-order-briefing'
