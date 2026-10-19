/**
 * Server mirror of purchasable packages — keep in sync with
 * `src/features/booking/shop-catalog.ts` (prices validated only here on the server).
 */
export type BookingServiceKey =
  | 'general'
  | 'web-hosting'
  | 'mobile-app'
  | 'web-development'
  | 'e-commerce'
  | 'digital-marketing'
  | 'offline-marketing'

export type PurchaseMode = 'checkout' | 'subscription' | 'quote'

export type ShopPackageDef = {
  id: string
  priceEur: number
  recommended?: boolean
  purchaseMode: PurchaseMode
}

export type ShopAddonDef = { id: string; priceEur: number }

export type ServiceShop = {
  packages: ShopPackageDef[]
  addons: ShopAddonDef[]
}

export const SERVICE_SHOP: Record<BookingServiceKey, ServiceShop> = {
  general: {
    packages: [
      { id: 'kickoff', priceEur: 49, purchaseMode: 'checkout' },
      { id: 'briefing', priceEur: 89, recommended: true, purchaseMode: 'checkout' },
      { id: 'roadmap', priceEur: 149, purchaseMode: 'quote' },
    ],
    addons: [
      { id: 'priority', priceEur: 39 },
      { id: 'competitor', priceEur: 59 },
    ],
  },
  'web-hosting': {
    packages: [
      { id: 'shared', priceEur: 79, purchaseMode: 'checkout' },
      { id: 'vps', priceEur: 129, recommended: true, purchaseMode: 'subscription' },
      { id: 'dedicated', priceEur: 249, purchaseMode: 'quote' },
    ],
    addons: [
      { id: 'migration', priceEur: 49 },
      { id: 'ssl-backup', priceEur: 29 },
      { id: 'monitoring', priceEur: 39 },
    ],
  },
  'mobile-app': {
    packages: [
      { id: 'mvp', priceEur: 149, purchaseMode: 'checkout' },
      { id: 'launch', priceEur: 299, recommended: true, purchaseMode: 'quote' },
      { id: 'scale', priceEur: 499, purchaseMode: 'quote' },
    ],
    addons: [
      { id: 'ui-kit', priceEur: 79 },
      { id: 'store-assets', priceEur: 59 },
      { id: 'api-extra', priceEur: 99 },
    ],
  },
  'web-development': {
    packages: [
      { id: 'landing', priceEur: 99, purchaseMode: 'checkout' },
      { id: 'business', priceEur: 199, recommended: true, purchaseMode: 'checkout' },
      { id: 'custom', priceEur: 399, purchaseMode: 'quote' },
    ],
    addons: [
      { id: 'cms', priceEur: 69 },
      { id: 'seo-tech', priceEur: 49 },
      { id: 'forms', priceEur: 39 },
    ],
  },
  'e-commerce': {
    packages: [
      { id: 'starter', priceEur: 129, purchaseMode: 'checkout' },
      { id: 'growth', priceEur: 249, recommended: true, purchaseMode: 'checkout' },
      { id: 'scale', priceEur: 449, purchaseMode: 'quote' },
    ],
    addons: [
      { id: 'payments', priceEur: 59 },
      { id: 'catalog', priceEur: 79 },
      { id: 'shipping', priceEur: 49 },
    ],
  },
  'digital-marketing': {
    packages: [
      { id: 'audit', priceEur: 99, purchaseMode: 'checkout' },
      { id: 'campaign', priceEur: 199, recommended: true, purchaseMode: 'checkout' },
      { id: 'retainer', priceEur: 349, purchaseMode: 'subscription' },
    ],
    addons: [
      { id: 'ads-setup', priceEur: 69 },
      { id: 'content-pack', priceEur: 89 },
      { id: 'reporting', priceEur: 39 },
    ],
  },
  'offline-marketing': {
    packages: [
      { id: 'print', priceEur: 89, purchaseMode: 'checkout' },
      { id: 'campaign', priceEur: 179, recommended: true, purchaseMode: 'quote' },
      { id: 'event', priceEur: 299, purchaseMode: 'quote' },
    ],
    addons: [
      { id: 'design', priceEur: 59 },
      { id: 'print-prod', priceEur: 79 },
      { id: 'install', priceEur: 69 },
    ],
  },
}

export function isPackageId(service: BookingServiceKey, id: string): boolean {
  return SERVICE_SHOP[service].packages.some((p) => p.id === id)
}

export function isAddonId(service: BookingServiceKey, id: string): boolean {
  return SERVICE_SHOP[service].addons.some((a) => a.id === id)
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
