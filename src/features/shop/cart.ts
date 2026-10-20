import {
  calcOrderTotalEur,
  canAddToCart,
  findShopPackage,
} from '../booking/shop-catalog'
import { isBookingServiceKey, type BookingServiceKey } from '../booking/catalog'

export const SHOP_CART_KEY = 'bditec-shop-cart'
export const SHOP_CART_FLASH_KEY = 'bditec-shop-cart-flash'
export const CART_MAX_ITEMS = 8

export type CartLine = {
  service: BookingServiceKey
  packageId: string
  addonIds: string[]
}

function lineKey(line: CartLine): string {
  return `${line.service}:${line.packageId}`
}

export function readCart(): CartLine[] {
  try {
    const raw = sessionStorage.getItem(SHOP_CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartLine[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (line) =>
          line &&
          isBookingServiceKey(line.service) &&
          typeof line.packageId === 'string' &&
          Array.isArray(line.addonIds),
      )
      .slice(0, CART_MAX_ITEMS)
  } catch {
    return []
  }
}

export function writeCart(lines: CartLine[]) {
  try {
    sessionStorage.setItem(SHOP_CART_KEY, JSON.stringify(lines.slice(0, CART_MAX_ITEMS)))
  } catch {
    /* ignore */
  }
}

export function clearCart() {
  try {
    sessionStorage.removeItem(SHOP_CART_KEY)
  } catch {
    /* ignore */
  }
}

export function setCartFlash(message: string) {
  try {
    sessionStorage.setItem(SHOP_CART_FLASH_KEY, message)
  } catch {
    /* ignore */
  }
}

export function takeCartFlash(): string | null {
  try {
    const msg = sessionStorage.getItem(SHOP_CART_FLASH_KEY)
    if (msg) sessionStorage.removeItem(SHOP_CART_FLASH_KEY)
    return msg
  } catch {
    return null
  }
}

export function addToCart(
  service: string,
  packageId: string,
  addonIds: string[] = [],
  opts: { replaceAddons?: boolean } = {},
): {
  ok: boolean
  reason?: 'not-found' | 'quote-only' | 'full' | 'duplicate'
  updated?: boolean
  cart: CartLine[]
} {
  const item = findShopPackage(service, packageId)
  if (!item || !isBookingServiceKey(service)) {
    return { ok: false, reason: 'not-found', cart: readCart() }
  }
  if (!canAddToCart(item.package.purchaseMode)) {
    return { ok: false, reason: 'quote-only', cart: readCart() }
  }
  const cart = readCart()
  // Monthly plans cannot mix one-time add-ons (Stripe subscription Checkout constraint).
  const cleanAddons =
    item.package.purchaseMode === 'subscription' ? [] : addonIds.filter(Boolean)
  const nextLine: CartLine = {
    service,
    packageId,
    addonIds: cleanAddons,
  }
  const existing = cart.findIndex((line) => lineKey(line) === lineKey(nextLine))
  if (existing >= 0) {
    if (!opts.replaceAddons) {
      return { ok: false, reason: 'duplicate', cart }
    }
    const next = cart.map((line, i) => (i === existing ? nextLine : line))
    writeCart(next)
    return { ok: true, updated: true, cart: next }
  }
  if (cart.length >= CART_MAX_ITEMS) {
    return { ok: false, reason: 'full', cart }
  }
  const next = [...cart, nextLine]
  writeCart(next)
  return { ok: true, cart: next }
}

export function removeFromCart(service: string, packageId: string): CartLine[] {
  const next = readCart().filter((line) => !(line.service === service && line.packageId === packageId))
  writeCart(next)
  return next
}

export function cartTotalEur(lines: CartLine[] = readCart()): number {
  return lines.reduce(
    (sum, line) => sum + calcOrderTotalEur(line.service, line.packageId, line.addonIds),
    0,
  )
}
