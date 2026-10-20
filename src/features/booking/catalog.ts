import { SERVICE_IDS, type ServiceId } from '../../data/services'

export type BookingServiceKey = ServiceId | 'general'

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

export const BOOKING_STORAGE_KEY = 'bditec-booking-draft'
export const ORDER_BRIEFING_KEY = 'bditec-order-briefing'
