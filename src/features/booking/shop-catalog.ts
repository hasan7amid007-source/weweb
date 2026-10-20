import type { BookingServiceKey } from './catalog'
import catalogJson from '../../../api/shop-catalog.json'

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
 * Single source of truth: `api/shop-catalog.json` (also loaded by /api/create-checkout).
 * Prices are online start amounts (EUR), credited toward the project.
 */
export const SERVICE_SHOP = catalogJson as Record<BookingServiceKey, ServiceShop>

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
  const pkg = shop.packages.find((p) => p.id === packageId)
  if (!pkg) return 0
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

export function bookingHref(
  service: BookingServiceKey,
  packageId: string,
  addonIds: string[] = [],
): string {
  const q = new URLSearchParams({ service, package: packageId })
  const validAddons = addonIds.filter((id) => isAddonId(service, id))
  if (validAddons.length) q.set('addons', validAddons.join(','))
  return `/?${q.toString()}#booking`
}

export function canAddToCart(purchaseMode: PurchaseMode): boolean {
  return purchaseMode === 'checkout' || purchaseMode === 'subscription'
}
