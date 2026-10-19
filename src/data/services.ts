/**
 * Public site origin for canonical / Open Graph (marketing pages only).
 * Temporary: live until custom domain `bditec.com` is registered + attached on Vercel.
 */
export const SITE_ORIGIN = 'https://weweb-weld.vercel.app'

export const SERVICE_IDS = [
  'web-hosting',
  'mobile-app',
  'web-development',
  'e-commerce',
  'digital-marketing',
  'offline-marketing',
] as const

export type ServiceId = (typeof SERVICE_IDS)[number]

export function isServiceId(v: string | null | undefined): v is ServiceId {
  return !!v && (SERVICE_IDS as readonly string[]).includes(v)
}

export function servicePath(id: ServiceId): string {
  return `/services/${id}.html`
}

export const SERVICE_ICONS: Record<ServiceId, string> = {
  'web-hosting': '/page/icon-hosting.svg',
  'mobile-app': '/page/icon-mobile.svg',
  'web-development': '/page/icon-web.svg',
  'e-commerce': '/page/icon-shop.svg',
  'digital-marketing': '/page/icon-marketing.svg',
  'offline-marketing': '/page/icon-offline.svg',
}

export const SERVICE_IMAGES: Record<ServiceId, string> = {
  'web-hosting': '/page/services/web-hosting.jpg',
  'mobile-app': '/page/services/mobile-app.jpg',
  'web-development': '/page/services/web-development.jpg',
  'e-commerce': '/page/services/e-commerce.jpg',
  'digital-marketing': '/page/services/digital-marketing.jpg',
  'offline-marketing': '/page/services/offline-marketing.jpg',
}
