import {
  calcOrderTotalEur,
  canPurchaseDirect,
  findShopPackage,
  isAddonId,
  type PurchaseMode,
} from '../booking/shop-catalog'
import { isBookingServiceKey, type BookingServiceKey } from '../booking/catalog'

export type CartLine = {
  service: BookingServiceKey
  packageId: string
  addonIds: string[]
}

export type CartSplitTotals = {
  oneTimeEur: number
  monthlyEur: number
  modes: PurchaseMode[]
}

/** Drop obsolete lines and strip one-time add-ons from subscription packages. */
export function sanitizeCartLines(lines: CartLine[]): { lines: CartLine[]; changed: boolean } {
  let changed = false
  const next: CartLine[] = []
  for (const line of lines) {
    if (!isBookingServiceKey(line.service) || typeof line.packageId !== 'string') {
      changed = true
      continue
    }
    const item = findShopPackage(line.service, line.packageId)
    if (!item || !canPurchaseDirect(item.package)) {
      changed = true
      continue
    }
    const rawAddons = Array.isArray(line.addonIds) ? line.addonIds : []
    const addonIds =
      item.package.purchaseMode === 'subscription'
        ? []
        : rawAddons.filter((id) => isAddonId(line.service, id))
    if (addonIds.length !== rawAddons.length) changed = true
    next.push({
      service: line.service,
      packageId: line.packageId,
      addonIds,
    })
  }
  if (next.length !== lines.length) changed = true
  return { lines: next, changed }
}

export function linePurchaseMode(line: CartLine): PurchaseMode | null {
  const item = findShopPackage(line.service, line.packageId)
  return item?.package.purchaseMode ?? null
}

export function cartSplitTotals(lines: CartLine[]): CartSplitTotals {
  let oneTimeEur = 0
  let monthlyEur = 0
  const modes: PurchaseMode[] = []
  for (const line of lines) {
    const mode = linePurchaseMode(line)
    if (!mode || mode === 'quote') continue
    const amount = calcOrderTotalEur(line.service, line.packageId, line.addonIds)
    modes.push(mode)
    if (mode === 'subscription') monthlyEur += amount
    else oneTimeEur += amount
  }
  return { oneTimeEur, monthlyEur, modes }
}

/** Mixed one-time + subscription carts cannot share one Stripe Checkout session mode. */
export function cartHasMixedBilling(lines: CartLine[]): boolean {
  const { oneTimeEur, monthlyEur } = cartSplitTotals(lines)
  return oneTimeEur > 0 && monthlyEur > 0
}

export function formatCartMoneySummary(
  split: CartSplitTotals,
  formatEur: (n: number) => string,
  monthSuffix: string,
  sep: string,
): string {
  const parts: string[] = []
  if (split.oneTimeEur > 0) parts.push(formatEur(split.oneTimeEur))
  if (split.monthlyEur > 0) parts.push(`${formatEur(split.monthlyEur)} ${monthSuffix}`.trim())
  return parts.join(sep) || formatEur(0)
}

export function packageAllowsAddons(mode: PurchaseMode): boolean {
  return mode === 'checkout'
}

export function isPayableServicePackage(service: string, packageId: string): boolean {
  if (!isBookingServiceKey(service)) return false
  const item = findShopPackage(service, packageId)
  return !!item && canPurchaseDirect(item.package)
}

export type { BookingServiceKey }
