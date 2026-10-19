import type { BookingServiceKey } from './catalog'

export type ShopPackageDef = {
  id: string
  priceEur: number
  recommended?: boolean
}

export type ShopAddonDef = {
  id: string
  priceEur: number
}

export type ServiceShop = {
  packages: ShopPackageDef[]
  addons: ShopAddonDef[]
}

/**
 * Shop configurator per service — packages (required) + add-ons (optional).
 * Prices are online start amounts (EUR), credited toward the project.
 */
export const SERVICE_SHOP: Record<BookingServiceKey, ServiceShop> = {
  general: {
    packages: [
      { id: 'kickoff', priceEur: 49 },
      { id: 'briefing', priceEur: 89, recommended: true },
      { id: 'roadmap', priceEur: 149 },
    ],
    addons: [
      { id: 'priority', priceEur: 39 },
      { id: 'competitor', priceEur: 59 },
    ],
  },
  'web-hosting': {
    packages: [
      { id: 'shared', priceEur: 79 },
      { id: 'vps', priceEur: 129, recommended: true },
      { id: 'dedicated', priceEur: 249 },
    ],
    addons: [
      { id: 'migration', priceEur: 49 },
      { id: 'ssl-backup', priceEur: 29 },
      { id: 'monitoring', priceEur: 39 },
    ],
  },
  'mobile-app': {
    packages: [
      { id: 'mvp', priceEur: 149 },
      { id: 'launch', priceEur: 299, recommended: true },
      { id: 'scale', priceEur: 499 },
    ],
    addons: [
      { id: 'ui-kit', priceEur: 79 },
      { id: 'store-assets', priceEur: 59 },
      { id: 'api-extra', priceEur: 99 },
    ],
  },
  'web-development': {
    packages: [
      { id: 'landing', priceEur: 99 },
      { id: 'business', priceEur: 199, recommended: true },
      { id: 'custom', priceEur: 399 },
    ],
    addons: [
      { id: 'cms', priceEur: 69 },
      { id: 'seo-tech', priceEur: 49 },
      { id: 'forms', priceEur: 39 },
    ],
  },
  'e-commerce': {
    packages: [
      { id: 'starter', priceEur: 129 },
      { id: 'growth', priceEur: 249, recommended: true },
      { id: 'scale', priceEur: 449 },
    ],
    addons: [
      { id: 'payments', priceEur: 59 },
      { id: 'catalog', priceEur: 79 },
      { id: 'shipping', priceEur: 49 },
    ],
  },
  'digital-marketing': {
    packages: [
      { id: 'audit', priceEur: 99 },
      { id: 'campaign', priceEur: 199, recommended: true },
      { id: 'retainer', priceEur: 349 },
    ],
    addons: [
      { id: 'ads-setup', priceEur: 69 },
      { id: 'content-pack', priceEur: 89 },
      { id: 'reporting', priceEur: 39 },
    ],
  },
  'offline-marketing': {
    packages: [
      { id: 'print', priceEur: 89 },
      { id: 'campaign', priceEur: 179, recommended: true },
      { id: 'event', priceEur: 299 },
    ],
    addons: [
      { id: 'design', priceEur: 59 },
      { id: 'print-prod', priceEur: 79 },
      { id: 'install', priceEur: 69 },
    ],
  },
}

export function shopFor(service: BookingServiceKey): ServiceShop {
  return SERVICE_SHOP[service]
}

export function fromPriceEur(service: BookingServiceKey): number {
  return Math.min(...SERVICE_SHOP[service].packages.map((p) => p.priceEur))
}

export function isPackageId(service: BookingServiceKey, id: string): boolean {
  return SERVICE_SHOP[service].packages.some((p) => p.id === id)
}

export function isAddonId(service: BookingServiceKey, id: string): boolean {
  return SERVICE_SHOP[service].addons.some((a) => a.id === id)
}

export function defaultPackageId(service: BookingServiceKey): string {
  const shop = SERVICE_SHOP[service]
  return shop.packages.find((p) => p.recommended)?.id ?? shop.packages[0]!.id
}

export function calcOrderTotalEur(
  service: BookingServiceKey,
  packageId: string,
  addonIds: string[],
): number {
  const shop = SERVICE_SHOP[service]
  const pkg = shop.packages.find((p) => p.id === packageId) ?? shop.packages[0]!
  const addons = shop.addons.filter((a) => addonIds.includes(a.id))
  return pkg.priceEur + addons.reduce((sum, a) => sum + a.priceEur, 0)
}
