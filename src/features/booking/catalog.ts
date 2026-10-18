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

const ENV_LINK: Record<BookingServiceKey, string | undefined> = {
  general: import.meta.env.VITE_STRIPE_LINK_GENERAL,
  'web-hosting': import.meta.env.VITE_STRIPE_LINK_WEB_HOSTING,
  'mobile-app': import.meta.env.VITE_STRIPE_LINK_MOBILE_APP,
  'web-development': import.meta.env.VITE_STRIPE_LINK_WEB_DEVELOPMENT,
  'e-commerce': import.meta.env.VITE_STRIPE_LINK_E_COMMERCE,
  'digital-marketing': import.meta.env.VITE_STRIPE_LINK_DIGITAL_MARKETING,
  'offline-marketing': import.meta.env.VITE_STRIPE_LINK_OFFLINE_MARKETING,
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

/** Stripe Payment Link when configured; otherwise demo checkout in DEV / VITE_BOOKING_DEMO_PAY. */
export function resolveCheckout(
  service: BookingServiceKey,
  email: string,
): { mode: 'stripe'; url: string } | { mode: 'demo' } | { mode: 'unavailable' } {
  const raw = (ENV_LINK[service] || '').trim()
  if (raw.startsWith('https://')) {
    const url = new URL(raw)
    if (email) url.searchParams.set('prefilled_email', email)
    url.searchParams.set(
      'client_reference_id',
      `bditec-${service}-${Date.now().toString(36)}`,
    )
    return { mode: 'stripe', url: url.toString() }
  }
  const demo =
    import.meta.env.VITE_BOOKING_DEMO_PAY === 'true' ||
    import.meta.env.DEV === true ||
    import.meta.env.MODE === 'development'
  return demo ? { mode: 'demo' } : { mode: 'unavailable' }
}

export const BOOKING_STORAGE_KEY = 'bditec-booking-draft'
