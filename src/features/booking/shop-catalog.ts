import type { BookingServiceKey } from './catalog'

/** Public shop taxonomy (agency categories). Maps onto booking services. */
export const SHOP_CATEGORY_IDS = [
  'web-design',
  'digital-marketing',
  'seo-analytics',
  'hosting-support',
  'mobile-app',
  'offline-marketing',
] as const

export type ShopCategoryId = (typeof SHOP_CATEGORY_IDS)[number]

export type PurchaseMode = 'checkout' | 'subscription' | 'quote'

export type ShopPackageDef = {
  id: string
  priceEur: number
  recommended?: boolean
  purchaseMode: PurchaseMode
  shopCategory: ShopCategoryId
}

export type ShopAddonDef = {
  id: string
  priceEur: number
}

export type ServiceShop = {
  packages: ShopPackageDef[]
  addons: ShopAddonDef[]
}

export type ShopListingItem = {
  service: BookingServiceKey
  package: ShopPackageDef
}

/**
 * Shop configurator per service — packages (required) + add-ons (optional).
 * Prices are online start amounts (EUR), credited toward the project.
 * purchaseMode / shopCategory drive the public /shop surface.
 */
export const SERVICE_SHOP: Record<BookingServiceKey, ServiceShop> = {
  general: {
    packages: [
      {
        id: 'kickoff',
        priceEur: 49,
        purchaseMode: 'checkout',
        shopCategory: 'web-design',
      },
      {
        id: 'briefing',
        priceEur: 89,
        recommended: true,
        purchaseMode: 'checkout',
        shopCategory: 'web-design',
      },
      {
        id: 'roadmap',
        priceEur: 149,
        purchaseMode: 'quote',
        shopCategory: 'web-design',
      },
    ],
    addons: [
      { id: 'priority', priceEur: 39 },
      { id: 'competitor', priceEur: 59 },
    ],
  },
  'web-hosting': {
    packages: [
      {
        id: 'shared',
        priceEur: 79,
        purchaseMode: 'checkout',
        shopCategory: 'hosting-support',
      },
      {
        id: 'vps',
        priceEur: 129,
        recommended: true,
        purchaseMode: 'subscription',
        shopCategory: 'hosting-support',
      },
      {
        id: 'dedicated',
        priceEur: 249,
        purchaseMode: 'quote',
        shopCategory: 'hosting-support',
      },
    ],
    addons: [
      { id: 'migration', priceEur: 49 },
      { id: 'ssl-backup', priceEur: 29 },
      { id: 'monitoring', priceEur: 39 },
    ],
  },
  'mobile-app': {
    packages: [
      {
        id: 'mvp',
        priceEur: 149,
        purchaseMode: 'checkout',
        shopCategory: 'mobile-app',
      },
      {
        id: 'launch',
        priceEur: 299,
        recommended: true,
        purchaseMode: 'quote',
        shopCategory: 'mobile-app',
      },
      {
        id: 'scale',
        priceEur: 499,
        purchaseMode: 'quote',
        shopCategory: 'mobile-app',
      },
    ],
    addons: [
      { id: 'ui-kit', priceEur: 79 },
      { id: 'store-assets', priceEur: 59 },
      { id: 'api-extra', priceEur: 99 },
    ],
  },
  'web-development': {
    packages: [
      {
        id: 'landing',
        priceEur: 99,
        purchaseMode: 'checkout',
        shopCategory: 'web-design',
      },
      {
        id: 'business',
        priceEur: 199,
        recommended: true,
        purchaseMode: 'checkout',
        shopCategory: 'web-design',
      },
      {
        id: 'custom',
        priceEur: 399,
        purchaseMode: 'quote',
        shopCategory: 'web-design',
      },
    ],
    addons: [
      { id: 'cms', priceEur: 69 },
      { id: 'seo-tech', priceEur: 49 },
      { id: 'forms', priceEur: 39 },
    ],
  },
  'e-commerce': {
    packages: [
      {
        id: 'starter',
        priceEur: 129,
        purchaseMode: 'checkout',
        shopCategory: 'web-design',
      },
      {
        id: 'growth',
        priceEur: 249,
        recommended: true,
        purchaseMode: 'checkout',
        shopCategory: 'web-design',
      },
      {
        id: 'scale',
        priceEur: 449,
        purchaseMode: 'quote',
        shopCategory: 'web-design',
      },
    ],
    addons: [
      { id: 'payments', priceEur: 59 },
      { id: 'catalog', priceEur: 79 },
      { id: 'shipping', priceEur: 49 },
    ],
  },
  'digital-marketing': {
    packages: [
      {
        id: 'audit',
        priceEur: 99,
        purchaseMode: 'checkout',
        shopCategory: 'seo-analytics',
      },
      {
        id: 'campaign',
        priceEur: 199,
        recommended: true,
        purchaseMode: 'checkout',
        shopCategory: 'digital-marketing',
      },
      {
        id: 'retainer',
        priceEur: 349,
        purchaseMode: 'subscription',
        shopCategory: 'digital-marketing',
      },
    ],
    addons: [
      { id: 'ads-setup', priceEur: 69 },
      { id: 'content-pack', priceEur: 89 },
      { id: 'reporting', priceEur: 39 },
    ],
  },
  'offline-marketing': {
    packages: [
      {
        id: 'print',
        priceEur: 89,
        purchaseMode: 'checkout',
        shopCategory: 'offline-marketing',
      },
      {
        id: 'campaign',
        priceEur: 179,
        recommended: true,
        purchaseMode: 'quote',
        shopCategory: 'offline-marketing',
      },
      {
        id: 'event',
        priceEur: 299,
        purchaseMode: 'quote',
        shopCategory: 'offline-marketing',
      },
    ],
    addons: [
      { id: 'design', priceEur: 59 },
      { id: 'print-prod', priceEur: 79 },
      { id: 'install', priceEur: 69 },
    ],
  },
}

/** Services listed on the public shop (excludes general consult-only). */
const SHOP_LISTING_SERVICES: BookingServiceKey[] = [
  'web-development',
  'e-commerce',
  'digital-marketing',
  'web-hosting',
  'mobile-app',
  'offline-marketing',
]

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

export function listShopPackages(): ShopListingItem[] {
  const items: ShopListingItem[] = []
  for (const service of SHOP_LISTING_SERVICES) {
    for (const pkg of SERVICE_SHOP[service].packages) {
      items.push({ service, package: pkg })
    }
  }
  return items
}

export function findShopPackage(
  service: string,
  packageId: string,
): ShopListingItem | undefined {
  return listShopPackages().find((item) => item.service === service && item.package.id === packageId)
}

export function isShopCategoryId(v: string): v is ShopCategoryId {
  return (SHOP_CATEGORY_IDS as readonly string[]).includes(v)
}

export function bookingHref(service: BookingServiceKey, packageId: string): string {
  const q = new URLSearchParams({ service, package: packageId })
  return `/?${q.toString()}#booking`
}
