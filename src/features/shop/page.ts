import {
  SHOP_CATEGORY_IDS,
  bookingHref,
  canPurchaseDirect,
  findShopPackage,
  isShopCategoryId,
  listShopPackages,
  shopFor,
  type PurchaseMode,
  type ShopCategoryId,
  type ShopListingItem,
} from '../booking/shop-catalog'
import { startCartCheckout } from '../booking/checkout-client'
import { briefingHref } from '../briefing/href'
import { briefingMatchesCart, readSubmittedBriefing } from '../briefing/draft'
import { formatEur, isBookingServiceKey, type BookingServiceKey } from '../booking/catalog'
import {
  addToCart,
  cartTotalEur,
  clearCart,
  readCart,
  removeFromCart,
  setCartFlash,
  takeCartFlash,
  type CartLine,
} from './cart'
import {
  cartHasMixedBilling,
  cartSplitTotals,
  formatCartMoneySummary,
  linePurchaseMode,
} from './cart-rules'
import { SERVICE_ICONS, servicePath, type ServiceId } from '../../data/services'
import { trackEvent } from '../../lib/telemetry'
import { type Locale, t } from '../../i18n'

export type ShopSort = 'popular' | 'price-asc' | 'price-desc' | 'name'

export type ShopFilterState = {
  category: ShopCategoryId | 'all'
  mode: PurchaseMode | 'all'
  sort: ShopSort
  query: string
  service: string
  packageId: string
}

function isShopSort(v: string): v is ShopSort {
  return v === 'popular' || v === 'price-asc' || v === 'price-desc' || v === 'name'
}

function serviceTitle(locale: Locale, service: BookingServiceKey): string {
  const m = t(locale)
  return service === 'general' ? m.contact.serviceGeneral : m.servicePages[service].title
}

function packageCopy(locale: Locale, service: BookingServiceKey, packageId: string) {
  return t(locale).bookingShop.packages[service][packageId]
}

function addonCopy(locale: Locale, service: BookingServiceKey, addonId: string) {
  return t(locale).bookingShop.addons[service][addonId]
}

function iconFor(service: BookingServiceKey): string {
  if (service === 'general') return '/page/icon-web.svg'
  return SERVICE_ICONS[service]
}

export function readFiltersFromUrl(): ShopFilterState {
  const params = new URLSearchParams(location.search)
  const catRaw = params.get('cat') || 'all'
  const modeRaw = params.get('mode') || 'all'
  const sortRaw = params.get('sort') || 'popular'
  const category =
    catRaw === 'all' || isShopCategoryId(catRaw) ? (catRaw as ShopFilterState['category']) : 'all'
  const mode =
    modeRaw === 'all' ||
    modeRaw === 'checkout' ||
    modeRaw === 'subscription' ||
    modeRaw === 'quote'
      ? (modeRaw as ShopFilterState['mode'])
      : 'all'
  let service = (params.get('service') || '').trim()
  let packageId = (params.get('package') || '').trim()
  if (packageId) {
    const hit = service ? findShopPackage(service, packageId) : undefined
    if (!hit) {
      packageId = ''
      if (service && !isBookingServiceKey(service)) service = ''
    }
  } else if (service && !isBookingServiceKey(service)) {
    service = ''
  }
  return {
    category,
    mode,
    sort: isShopSort(sortRaw) ? sortRaw : 'popular',
    query: (params.get('q') || '').trim(),
    service,
    packageId,
  }
}

function writeFiltersToUrl(state: ShopFilterState, replace = true) {
  const url = new URL(location.href)
  const setOrDel = (key: string, value: string) => {
    if (!value || value === 'all' || (key === 'sort' && value === 'popular')) url.searchParams.delete(key)
    else url.searchParams.set(key, value)
  }
  setOrDel('cat', state.category)
  setOrDel('mode', state.mode)
  setOrDel('sort', state.sort)
  setOrDel('q', state.query)
  setOrDel('service', state.service)
  setOrDel('package', state.packageId)
  const next = `${url.pathname}${url.search}${url.hash || '#main'}`
  if (replace) history.replaceState(null, '', next)
  else history.pushState(null, '', next)
}

function filterItems(locale: Locale, state: ShopFilterState): ShopListingItem[] {
  const q = state.query.toLowerCase()
  return listShopPackages().filter((item) => {
    if (state.service && !state.packageId && item.service !== state.service) return false
    if (state.category !== 'all' && item.package.shopCategory !== state.category) return false
    if (state.mode !== 'all' && item.package.purchaseMode !== state.mode) return false
    if (!q) return true
    const copy = packageCopy(locale, item.service, item.package.id)
    const hay = [
      copy?.title,
      copy?.blurb,
      serviceTitle(locale, item.service),
      t(locale).shopPage.categories[item.package.shopCategory].title,
      item.package.id,
    ]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}

function sortItems(locale: Locale, items: ShopListingItem[], sort: ShopSort): ShopListingItem[] {
  const next = [...items]
  next.sort((a, b) => {
    if (sort === 'price-asc') return a.package.priceEur - b.package.priceEur
    if (sort === 'price-desc') return b.package.priceEur - a.package.priceEur
    if (sort === 'name') {
      const at = packageCopy(locale, a.service, a.package.id)?.title ?? a.package.id
      const bt = packageCopy(locale, b.service, b.package.id)?.title ?? b.package.id
      return at.localeCompare(bt, locale)
    }
    const ar = a.package.recommended ? 0 : 1
    const br = b.package.recommended ? 0 : 1
    if (ar !== br) return ar - br
    return a.package.priceEur - b.package.priceEur
  })
  return next
}

const SERVICE_ORDER: BookingServiceKey[] = [
  'web-development',
  'e-commerce',
  'digital-marketing',
  'web-hosting',
  'mobile-app',
  'offline-marketing',
]

function groupByService(items: ShopListingItem[]): { service: BookingServiceKey; items: ShopListingItem[] }[] {
  const map = new Map<BookingServiceKey, ShopListingItem[]>()
  for (const item of items) {
    const list = map.get(item.service) ?? []
    list.push(item)
    map.set(item.service, list)
  }
  const groups: { service: BookingServiceKey; items: ShopListingItem[] }[] = []
  for (const service of SERVICE_ORDER) {
    const list = map.get(service)
    if (list?.length) groups.push({ service, items: list })
  }
  for (const [service, list] of map) {
    if (!SERVICE_ORDER.includes(service) && list.length) groups.push({ service, items: list })
  }
  return groups
}

function pricePeriod(locale: Locale, mode: PurchaseMode): string {
  const shop = t(locale).shopPage
  if (mode === 'subscription') return shop.monthSuffix
  return ''
}

function priceKindLabel(locale: Locale, mode: PurchaseMode): string {
  const shop = t(locale).shopPage
  if (mode === 'subscription') return shop.priceKindSubscription
  if (mode === 'quote') return shop.priceKindQuote
  return shop.priceKindCheckout
}

function priceAmountNote(locale: Locale, mode: PurchaseMode): string {
  const shop = t(locale).shopPage
  if (mode === 'subscription') return shop.subscriptionAmountNote
  if (mode === 'quote') return shop.quoteAmountNote
  return shop.startAmountNote
}

function planIncludesLabel(locale: Locale, mode: PurchaseMode): string {
  const shop = t(locale).shopPage
  return mode === 'subscription' ? shop.planIncludesSubscription : shop.planIncludes
}

/** Six public shop services (excludes general consult-only). */
const SHOP_SERVICE_IDS: BookingServiceKey[] = [
  'web-development',
  'e-commerce',
  'mobile-app',
  'digital-marketing',
  'web-hosting',
  'offline-marketing',
]

function serviceFromPriceDisplay(locale: Locale, service: BookingServiceKey): string | null {
  const shop = t(locale).shopPage
  const pkgs = shopFor(service).packages
  const priced = pkgs.filter((p) => p.purchaseMode !== 'quote')
  if (!priced.length) return null
  const min = priced.reduce((a, b) => (a.priceEur <= b.priceEur ? a : b))
  const period =
    min.purchaseMode === 'subscription' ? ` ${shop.monthSuffix.trim()}` : ''
  return `${shop.servicesFrom} ${formatEur(min.priceEur, locale)}${period}`
}

function renderServiceDiscovery(locale: Locale): string {
  const shop = t(locale).shopPage
  const cards = SHOP_SERVICE_IDS.map((service) => {
    const page = t(locale).servicePages[service as ServiceId]
    const from = serviceFromPriceDisplay(locale, service)
    const highlights = (page.highlights || []).slice(0, 3)
    const href = `/shop.html?service=${encodeURIComponent(service)}#catalog`
    return `
      <article class="shop-service-card">
        <div class="shop-service-card-media">
          <img src="${iconFor(service)}" width="40" height="40" alt="" />
        </div>
        <h3 class="shop-service-card-title">${serviceTitle(locale, service)}</h3>
        <p class="shop-service-card-blurb">${page.lead}</p>
        ${
          highlights.length
            ? `<ul class="shop-service-card-outcomes">${highlights.map((h) => `<li>${h}</li>`).join('')}</ul>`
            : ''
        }
        ${from ? `<p class="shop-service-card-from">${from}</p>` : `<p class="shop-service-card-from">${shop.priceOnRequest}</p>`}
        <a class="shop-service-card-cta ts-btn pink" href="${href}">${shop.servicesExplore}</a>
      </article>`
  }).join('')
  return `
    <section class="shop-services wrap" id="services" aria-labelledby="shop-services-title">
      <header class="shop-section-head">
        <h2 id="shop-services-title">${shop.servicesTitle}</h2>
        <p class="lead">${shop.servicesLead}</p>
      </header>
      <div class="shop-services-grid">${cards}</div>
    </section>`
}

function renderProcess(locale: Locale): string {
  const shop = t(locale).shopPage
  return `
    <section class="shop-process wrap" id="process" aria-labelledby="shop-process-title">
      <header class="shop-section-head">
        <h2 id="shop-process-title">${shop.processTitle}</h2>
        <p class="lead">${shop.processLead}</p>
      </header>
      <ol class="shop-process-steps">
        ${shop.processSteps
          .map(
            (step, i) => `
          <li class="shop-process-step">
            <span class="shop-process-num" aria-hidden="true">${i + 1}</span>
            <div>
              <h3>${step.title}</h3>
              <p>${step.body}</p>
            </div>
          </li>`,
          )
          .join('')}
      </ol>
    </section>`
}

function renderFinalCta(locale: Locale): string {
  const shop = t(locale).shopPage
  return `
    <section class="shop-final-cta wrap" aria-labelledby="shop-final-cta-title">
      <h2 id="shop-final-cta-title">${shop.finalCtaTitle}</h2>
      <p class="lead">${shop.finalCtaLead}</p>
      <div class="shop-hero-actions">
        <a class="ts-btn pink solid" href="#catalog">${shop.finalCtaCatalog}</a>
        <a class="ts-btn pink" href="${briefingHref({ service: 'general', intent: 'quote', from: 'shop-final' })}">${shop.finalCtaBriefing}</a>
      </div>
    </section>`
}

function renderPlanCard(locale: Locale, item: ShopListingItem): string {
  const shop = t(locale).shopPage
  const copy = packageCopy(locale, item.service, item.package.id)
  const href = `/shop.html?service=${encodeURIComponent(item.service)}&package=${encodeURIComponent(item.package.id)}`
  const featured = item.package.recommended ? ' is-featured' : ''
  const period = pricePeriod(locale, item.package.purchaseMode)
  const kind = priceKindLabel(locale, item.package.purchaseMode)
  const includesLabel = planIncludesLabel(locale, item.package.purchaseMode)
  const highlights = copy?.highlights?.length
    ? copy.highlights
    : [copy?.blurb ?? shop.modeBadge[item.package.purchaseMode]].filter(Boolean)
  const cartable = canPurchaseDirect(item.package)
  // Quote-only: on request. Gated retainers: still show orientation monthly amount + quote CTA.
  const amountHtml =
    item.package.purchaseMode === 'quote'
      ? `<span class="shop-plan-amount shop-plan-amount--quote">${shop.priceOnRequest}</span>`
      : `<span class="shop-plan-amount">${formatEur(item.package.priceEur, locale)}</span>
        ${period ? `<span class="shop-plan-period">${period}</span>` : ''}`
  const briefingQuote = briefingHref({
    service: item.service,
    packageId: item.package.id,
    intent: cartable ? 'checkout' : 'quote',
    from: 'shop-card',
  })
  const primaryCta = cartable
    ? `<button type="button" class="shop-plan-cta ts-btn pink solid" data-shop-add-cart data-service="${item.service}" data-package="${item.package.id}">${shop.cartAdd}</button>`
    : `<a class="shop-plan-cta ts-btn pink solid" href="${briefingQuote}">${shop.ctaBriefing}</a>`
  const secondaryCta = cartable
    ? `<a class="shop-plan-details" href="${briefingQuote}">${shop.ctaBriefing}</a>`
    : `<a class="shop-plan-details" href="${href}">${shop.viewDetails}</a>`
  const compareId = `${item.service}:${item.package.id}`
  return `
    <article class="shop-plan${featured}" data-shop-plan="${compareId}">
      ${item.package.recommended ? `<p class="shop-plan-ribbon">${shop.recommended}</p>` : ''}
      <p class="shop-plan-mode shop-mode-badge shop-mode-badge--${item.package.purchaseMode}">${shop.modeBadge[item.package.purchaseMode]}</p>
      <h3 class="shop-plan-title">${copy?.title ?? item.package.id}</h3>
      <p class="shop-plan-price">${amountHtml}</p>
      <p class="shop-plan-price-kind">${kind}</p>
      ${
        item.package.directCheckout === false
          ? `<p class="shop-note shop-note--gate">${shop.termsGateNote}</p>`
          : ''
      }
      <p class="shop-plan-blurb">${copy?.blurb ?? ''}</p>
      <ul class="shop-plan-features" aria-label="${includesLabel}">
        ${highlights.map((line) => `<li>${line}</li>`).join('')}
      </ul>
      <label class="shop-compare-pick">
        <input type="checkbox" data-shop-compare value="${compareId}" />
        <span>${shop.compareAdd}</span>
      </label>
      <div class="shop-plan-actions">
        ${primaryCta}
        ${secondaryCta}
        ${cartable ? `<a class="shop-plan-details shop-plan-details--muted" href="${href}">${shop.viewDetails}</a>` : ''}
      </div>
    </article>`
}

function renderPlanGroup(locale: Locale, service: BookingServiceKey, items: ShopListingItem[]): string {
  const shop = t(locale).shopPage
  const serviceHref = service === 'general' ? '/#services' : servicePath(service as ServiceId)
  const cat = items[0]?.package.shopCategory
  const catBlurb = cat ? shop.categories[cat].blurb : ''
  return `
    <section class="shop-plan-group" data-shop-service="${service}">
      <header class="shop-plan-group-head">
        <div class="shop-plan-group-identity">
          <img src="${iconFor(service)}" width="36" height="36" alt="" />
          <div>
            <h2 class="shop-plan-group-title">${serviceTitle(locale, service)}</h2>
            <p class="shop-plan-group-blurb">${catBlurb}</p>
          </div>
        </div>
        <a class="shop-plan-group-link" href="${serviceHref}">${shop.viewService}</a>
      </header>
      <div class="shop-plan-row">
        ${items.map((item) => renderPlanCard(locale, item)).join('')}
      </div>
    </section>`
}

function renderRelated(locale: Locale, item: ShopListingItem): string {
  const shop = t(locale).shopPage
  const related = listShopPackages().filter(
    (other) => other.service === item.service && other.package.id !== item.package.id,
  )
  if (!related.length) return ''
  return `
    <section class="shop-related" aria-labelledby="shop-related-title">
      <h3 id="shop-related-title">${shop.relatedTitle}</h3>
      <div class="shop-related-row">
        ${related
          .map((other) => {
            const copy = packageCopy(locale, other.service, other.package.id)
            const href = `/shop.html?service=${encodeURIComponent(other.service)}&package=${encodeURIComponent(other.package.id)}`
            const period = pricePeriod(locale, other.package.purchaseMode)
            const relatedPrice =
              other.package.purchaseMode === 'quote'
                ? shop.priceOnRequest
                : `${formatEur(other.package.priceEur, locale)}${period ? ` ${period}` : ''}`
            return `
              <a class="shop-related-card" href="${href}">
                <span class="shop-related-title">${copy?.title ?? other.package.id}</span>
                <span class="shop-related-price">${relatedPrice}</span>
              </a>`
          })
          .join('')}
      </div>
    </section>`
}

function renderDetail(locale: Locale, item: ShopListingItem): string {
  const m = t(locale)
  const shop = m.shopPage
  const booking = m.bookingShop
  const copy = packageCopy(locale, item.service, item.package.id)
  const addons = shopFor(item.service).addons
  const serviceHref =
    item.service === 'general' ? '/#services' : servicePath(item.service as ServiceId)
  const cartable = canPurchaseDirect(item.package)
  const catTitle = shop.categories[item.package.shopCategory].title
  const highlights = copy?.highlights?.length ? copy.highlights : []
  const existingLine = readCart().find(
    (line) => line.service === item.service && line.packageId === item.package.id,
  )
  const selectedAddons = new Set(existingLine?.addonIds ?? [])
  const checkoutHref = bookingHref(
    item.service,
    item.package.id,
    item.package.purchaseMode === 'checkout' ? [...selectedAddons] : [],
  )
  const briefingCheckout = briefingHref({
    service: item.service,
    packageId: item.package.id,
    addonIds: item.package.purchaseMode === 'checkout' ? [...selectedAddons] : [],
    intent: cartable ? 'checkout' : 'quote',
    from: 'shop-detail',
  })
  const buyPrimary = cartable
    ? `<button type="button" class="ts-btn pink solid" data-shop-add-cart data-shop-detail-cart data-service="${item.service}" data-package="${item.package.id}" data-base-price="${item.package.priceEur}">${shop.cartAdd}</button>`
    : `<a class="ts-btn pink solid" href="${briefingCheckout}">${shop.ctaBriefing}</a>`
  const buySecondary = cartable
    ? `<a class="ts-btn pink" href="${briefingCheckout}" data-shop-briefing-cta data-service="${item.service}" data-package="${item.package.id}">${shop.ctaBriefing}</a>`
    : ''
  const quoteLink = cartable
    ? `<a class="shop-secondary-cta" href="${checkoutHref}" data-shop-booking-cta>${item.package.purchaseMode === 'subscription' ? shop.ctaSubscription : shop.ctaCheckout}</a>`
    : ''

  const period = pricePeriod(locale, item.package.purchaseMode)
  // One-time packages only: subscription + add-ons would break Billing Checkout.
  const addonPicker =
    item.package.purchaseMode === 'checkout' && addons.length
      ? `
        <fieldset class="shop-buybox-extras" data-shop-addon-picker>
          <legend>${booking.addonsHeading}</legend>
          <p class="shop-note">${shop.extrasSelectHint}</p>
          ${addons
            .map((addon) => {
              const a = addonCopy(locale, item.service, addon.id)
              const checked = selectedAddons.has(addon.id) ? ' checked' : ''
              return `
                <label class="shop-addon-option">
                  <input type="checkbox" name="addon" value="${addon.id}" data-addon-price="${addon.priceEur}"${checked} />
                  <span class="shop-addon-copy">
                    <strong>${a?.title ?? addon.id}</strong>
                    <em>${a?.blurb ?? ''}</em>
                  </span>
                  <span class="shop-addon-price">+${formatEur(addon.priceEur, locale)}</span>
                </label>`
            })
            .join('')}
        </fieldset>`
      : item.package.purchaseMode === 'subscription'
        ? `<p class="shop-note">${shop.subscriptionNoExtras}</p>`
        : addons.length
          ? `
        <section class="shop-buybox-extras">
          <h3>${shop.extrasTitle}</h3>
          <p class="shop-note">${shop.extrasBody}</p>
          <ul class="shop-extra-list">
            ${addons
              .map((addon) => {
                const a = addonCopy(locale, item.service, addon.id)
                return `<li><span>${a?.title ?? addon.id}</span><span>+${formatEur(addon.priceEur, locale)}</span></li>`
              })
              .join('')}
          </ul>
        </section>`
          : ''

  return `
    <nav class="shop-breadcrumb" aria-label="${shop.breadcrumbNav}">
      <a href="/shop.html">${shop.breadcrumbShop}</a>
      <span aria-hidden="true">/</span>
      <a href="/shop.html?cat=${encodeURIComponent(item.package.shopCategory)}">${catTitle}</a>
      <span aria-hidden="true">/</span>
      <span aria-current="page">${copy?.title ?? item.package.id}</span>
    </nav>
    <div class="shop-detail-sheet">
      <div class="shop-detail-layout">
        <div class="shop-detail-main">
          <p class="shop-card-service">${serviceTitle(locale, item.service)}</p>
          <div class="shop-detail-title-row">
            <h2 class="shop-detail-title">${copy?.title ?? item.package.id}</h2>
            <span class="shop-mode-badge shop-mode-badge--${item.package.purchaseMode}">${shop.modeBadge[item.package.purchaseMode]}</span>
          </div>
          <p class="shop-detail-blurb">${copy?.blurb ?? ''}</p>
          ${
            highlights.length
              ? `<ul class="shop-plan-features shop-detail-features" aria-label="${planIncludesLabel(locale, item.package.purchaseMode)}">${highlights.map((line) => `<li>${line}</li>`).join('')}</ul>`
              : ''
          }
          <div class="shop-detail-grid">
            <section>
              <h3>${shop.scopeTitle}</h3>
              <p>${shop.scopeBody}</p>
            </section>
            <section>
              <h3>${shop.exclusionsTitle}</h3>
              <p>${shop.exclusionsBody}</p>
            </section>
            <section>
              <h3>${shop.deliveryTitle}</h3>
              <p>${shop.deliveryBody}</p>
            </section>
            <section>
              <h3>${shop.afterOrderTitle}</h3>
              <ol class="shop-after-order">
                ${shop.afterOrderSteps.map((step) => `<li>${step}</li>`).join('')}
              </ol>
            </section>
          </div>
          ${
            item.package.directCheckout === false
              ? `<p class="shop-note shop-note--warn">${shop.termsGateNote}</p>`
              : ''
          }
        </div>
        <aside class="shop-buybox" data-shop-buybox data-base-price="${item.package.priceEur}" data-period="${period}">
          <p class="shop-detail-price">
            ${
              item.package.purchaseMode === 'quote'
                ? `<span class="shop-plan-amount shop-plan-amount--quote">${shop.priceOnRequest}</span>`
                : `<span class="shop-plan-amount" data-shop-buybox-base>${formatEur(item.package.priceEur, locale)}</span>
            ${period ? `<span class="shop-plan-period">${period}</span>` : ''}`
            }
          </p>
          ${addonPicker}
          ${
            item.package.purchaseMode === 'quote'
              ? ''
              : cartable
                ? `<p class="shop-buybox-total">
            <span>${shop.buyboxTotal}</span>
            <strong data-shop-buybox-total>${formatEur(item.package.priceEur, locale)}${period ? ` ${period}` : ''}</strong>
          </p>
          <p class="shop-note shop-note--vat">${shop.vatNote}</p>`
                : `<p class="shop-note shop-note--vat">${shop.vatNote}</p>
          <p class="shop-note">${shop.orientationAmountNote}</p>`
          }
          <p class="shop-note">${priceAmountNote(locale, item.package.purchaseMode)}</p>
          <div class="shop-detail-actions">
            <span class="glowborder">${buyPrimary}</span>
            ${buySecondary ? `<span class="glowborder">${buySecondary}</span>` : ''}
            ${quoteLink}
            <a class="shop-secondary-cta" href="${serviceHref}">${shop.viewService}</a>
            <button type="button" class="shop-secondary-cta" data-shop-print>${shop.printSummary}</button>
            <p class="shop-cart-feedback" data-shop-cart-feedback role="status" aria-live="polite" hidden></p>
          </div>
        </aside>
      </div>
      ${renderRelated(locale, item)}
      <p class="shop-note shop-note--soft">${shop.vatNote} ${shop.missingTerms}</p>
    </div>`
}

function renderCartPanel(locale: Locale, lines: CartLine[]): string {
  const shop = t(locale).shopPage
  const split = cartSplitTotals(lines)
  const summary = formatCartMoneySummary(
    split,
    (n) => formatEur(n, locale),
    shop.monthSuffix,
    ' · ',
  )
  const mixed = cartHasMixedBilling(lines)
  return `
    <section class="shop-cart" id="cart" data-shop-cart>
      <div class="shop-cart-head">
        <h2>${shop.cartTitle}</h2>
        <p class="shop-results">${shop.cartCount(lines.length)} · ${summary}</p>
      </div>
      ${
        lines.length === 0
          ? `<p class="shop-empty">${shop.cartEmpty}</p>
             <p class="shop-cart-continue"><a href="/shop.html">${shop.detailBack}</a></p>`
          : `
        <ul class="shop-cart-list">
          ${lines
            .map((line) => {
              const copy = packageCopy(locale, line.service, line.packageId)
              const mode = linePurchaseMode(line)
              const lineTotal = cartTotalEur([line])
              const period = mode === 'subscription' ? ` ${shop.monthSuffix}` : ''
              const addonLabels = line.addonIds
                .map((id) => addonCopy(locale, line.service, id)?.title ?? id)
                .filter(Boolean)
              const editHref = `/shop.html?service=${encodeURIComponent(line.service)}&package=${encodeURIComponent(line.packageId)}`
              const editLabel =
                mode === 'checkout' && shopFor(line.service).addons.length
                  ? shop.cartEdit
                  : shop.cartViewPackage
              return `
              <li class="shop-cart-line">
                <div>
                  <strong>${copy?.title ?? line.packageId}</strong>
                  <span>${serviceTitle(locale, line.service)}${mode ? ` · ${shop.modeBadge[mode]}` : ''}</span>
                  ${addonLabels.length ? `<span class="shop-cart-addons">${addonLabels.join(' · ')}</span>` : ''}
                  <a class="shop-cart-edit" href="${editHref}">${editLabel}</a>
                </div>
                <div class="shop-cart-line-actions">
                  <span>${formatEur(lineTotal, locale)}${period}</span>
                  <button type="button" class="shop-cart-remove" data-shop-remove="${line.service}:${line.packageId}">${shop.cartRemove}</button>
                </div>
              </li>`
            })
            .join('')}
        </ul>
        ${
          split.oneTimeEur > 0 || split.monthlyEur > 0
            ? `<dl class="shop-cart-split">
                ${split.oneTimeEur > 0 ? `<div><dt>${shop.cartOnceLabel}</dt><dd>${formatEur(split.oneTimeEur, locale)}</dd></div>` : ''}
                ${split.monthlyEur > 0 ? `<div><dt>${shop.cartMonthlyLabel}</dt><dd>${formatEur(split.monthlyEur, locale)} ${shop.monthSuffix}</dd></div>` : ''}
              </dl>`
            : ''
        }
        ${mixed ? `<p class="shop-note shop-note--warn">${shop.cartMixedBilling}</p>` : ''}
        ${lines.length > 1 ? `<p class="shop-note shop-note--warn">${shop.cartSingleItemOnly}</p>` : ''}
        <div class="shop-cart-toolbar">
          <button type="button" class="booking-back" data-shop-clear-cart>${shop.cartClear}</button>
        </div>
        <form class="contact-form shop-quote-form" data-shop-cart-pay novalidate>
          <label class="contact-field">
            <span>${shop.cartName} <em>*</em></span>
            <input type="text" name="name" required autocomplete="name" maxlength="120" />
          </label>
          <label class="contact-field">
            <span>${shop.cartEmail} <em>*</em></span>
            <input type="email" name="email" required autocomplete="email" maxlength="254" />
          </label>
          <p class="shop-note shop-note--vat">${shop.vatNote}</p>
          <p class="booking-hint">${shop.cartPayHint}</p>
          <p class="booking-error" data-shop-cart-error hidden></p>
          <span class="glowborder">
            <button type="submit" class="ts-btn pink solid" data-shop-cart-submit ${mixed || lines.length > 1 ? 'disabled' : ''}>${shop.cartCheckout}</button>
          </span>
        </form>`
      }
    </section>`
}

function renderShopFaq(locale: Locale): string {
  const shop = t(locale).shopPage
  return `
    <section class="shop-faq" id="shop-faq" aria-labelledby="shop-faq-title">
      <h2 id="shop-faq-title">${shop.faqTitle}</h2>
      <div class="service-faq" data-accordion data-track-open="shop_faq_open">
        ${shop.faq
          .map(
            (item) => `
          <details>
            <summary>${item.q}</summary>
            <p>${item.a}</p>
          </details>`,
          )
          .join('')}
      </div>
    </section>`
}

function resolveQuotePackageLabel(locale: Locale, packageHint: string): string {
  if (!packageHint) return ''
  const [service, packageId] = packageHint.split(':')
  if (!service || !packageId || !isBookingServiceKey(service)) return packageHint
  const item = findShopPackage(service, packageId)
  if (!item) return packageHint
  const copy = packageCopy(locale, service, packageId)
  return copy?.title ? `${copy.title} (${serviceTitle(locale, service)})` : packageHint
}

function renderQuoteForm(locale: Locale, prefillService = '', prefillPackage = ''): string {
  const m = t(locale)
  const shop = m.shopPage
  const options = [
    ['', m.contact.servicePlaceholder],
    ...SHOP_CATEGORY_IDS.map((id) => [id, shop.categories[id].title] as const),
  ]
  const packageLabel = resolveQuotePackageLabel(locale, prefillPackage)
  const packageChip = packageLabel
    ? `<p class="shop-quote-selected" data-shop-quote-package>
        <span class="shop-quote-selected-label">${shop.quoteSelectedPackage}</span>
        <strong>${packageLabel}</strong>
      </p>`
    : ''
  return `
    <section class="shop-quote" id="quote">
      <div class="shop-quote-panel">
        <aside class="shop-quote-aside">
          <p class="shop-quote-eyebrow">${shop.quoteEyebrow}</p>
          <h2>${shop.quoteTitle}</h2>
          <p class="shop-quote-lead">${shop.quoteLead}</p>
          <h3 class="shop-quote-aside-title">${shop.quoteAsideTitle}</h3>
          <ol class="shop-quote-steps">
            ${shop.quoteSteps.map((step) => `<li>${step}</li>`).join('')}
          </ol>
          <p class="shop-quote-note">${shop.quoteResponseNote}</p>
          <p class="shop-quote-email">${shop.quoteEmailVisible} <a href="mailto:info@bditec.com">info@bditec.com</a></p>
        </aside>
        <form class="contact-form shop-quote-form" data-shop-quote novalidate>
          <input type="hidden" name="packageHint" value="${prefillPackage}" />
          ${packageChip}
          <div class="booking-row">
            <label class="contact-field">
              <span>${shop.quoteName} <em>*</em></span>
              <input type="text" name="name" required autocomplete="name" maxlength="120" />
            </label>
            <label class="contact-field">
              <span>${shop.quoteEmail} <em>*</em></span>
              <input type="email" name="email" required autocomplete="email" maxlength="254" />
            </label>
          </div>
          <div class="booking-row">
            <label class="contact-field">
              <span>${shop.quoteCompany}</span>
              <input type="text" name="company" autocomplete="organization" maxlength="160" />
            </label>
            <label class="contact-field">
              <span>${shop.quotePhone}</span>
              <input type="tel" name="phone" autocomplete="tel" maxlength="40" />
            </label>
          </div>
          <label class="contact-field">
            <span>${shop.quoteService}</span>
            <select name="area">
              ${options
                .map(([value, label]) => {
                  const selected =
                    value === prefillService || (!prefillService && value === '') ? ' selected' : ''
                  return `<option value="${value}"${selected}>${label}</option>`
                })
                .join('')}
            </select>
          </label>
          <div class="booking-row">
            <label class="contact-field">
              <span>${shop.quoteBudget}</span>
              <select name="budget">
                ${shop.quoteBudgetOptions
                  .map(({ value, label }) => `<option value="${value}">${label}</option>`)
                  .join('')}
              </select>
            </label>
            <label class="contact-field">
              <span>${shop.quoteTiming}</span>
              <select name="timing">
                ${shop.quoteTimingOptions
                  .map(({ value, label }) => `<option value="${value}">${label}</option>`)
                  .join('')}
              </select>
            </label>
          </div>
          <label class="contact-field">
            <span>${shop.quoteMessage} <em>*</em></span>
            <textarea name="message" rows="5" required maxlength="4000"></textarea>
            <span class="shop-quote-field-hint">${shop.quoteMessageHint}</span>
          </label>
          <p class="booking-hint">${shop.quoteHint}</p>
          <p class="booking-error" data-shop-quote-error hidden></p>
          <p class="shop-quote-ok" data-shop-quote-ok hidden>${shop.quoteSuccess}</p>
          <pre class="shop-quote-summary" data-shop-quote-summary hidden></pre>
          <div class="shop-quote-actions">
            <span class="glowborder">
              <button type="submit" class="ts-btn pink solid">${shop.quoteSubmit}</button>
            </span>
            <button type="button" class="booking-back" data-shop-quote-copy hidden>${shop.quoteCopySummary}</button>
          </div>
        </form>
      </div>
    </section>`
}

function renderActiveFilters(locale: Locale, state: ShopFilterState): string {
  const shop = t(locale).shopPage
  const chips: { key: string; label: string }[] = []
  if (state.category !== 'all') {
    chips.push({ key: 'cat', label: shop.categories[state.category].title })
  }
  if (state.mode !== 'all') {
    chips.push({ key: 'mode', label: shop.modeBadge[state.mode] })
  }
  if (state.query) {
    chips.push({ key: 'q', label: `“${state.query}”` })
  }
  if (state.service && !state.packageId && isBookingServiceKey(state.service)) {
    chips.push({ key: 'service', label: serviceTitle(locale, state.service) })
  }
  if (!chips.length) return ''
  return `
    <div class="shop-active-filters" role="group" aria-label="${shop.filterActiveLabel}">
      ${chips
        .map(
          (chip) => `
        <button type="button" class="shop-active-chip" data-shop-clear-chip="${chip.key}">
          <span>${chip.label}</span>
          <span aria-hidden="true">×</span>
        </button>`,
        )
        .join('')}
      <button type="button" class="shop-filter-clear" data-shop-clear-filters>${shop.filterClear}</button>
    </div>`
}

export function renderShopMarkup(locale: Locale, state: ShopFilterState): string {
  const m = t(locale)
  const shop = m.shopPage
  const detail =
    state.service && state.packageId
      ? findShopPackage(state.service, state.packageId)
      : undefined
  const items = sortItems(locale, filterItems(locale, state), state.sort)
  const modeFilters: { id: PurchaseMode | 'all'; label: string }[] = [
    { id: 'all', label: shop.filterModeAll },
    { id: 'checkout', label: shop.modeCheckout },
    { id: 'subscription', label: shop.modeSubscription },
    { id: 'quote', label: shop.modeQuote },
  ]
  const sortOptions: { id: ShopSort; label: string }[] = [
    { id: 'popular', label: shop.sortPopular },
    { id: 'price-asc', label: shop.sortPriceAsc },
    { id: 'price-desc', label: shop.sortPriceDesc },
    { id: 'name', label: shop.sortName },
  ]

  const cartLines = readCart()
  const cartBar = `
    <div class="wrap shop-cart-bar" data-shop-cart-bar>
      <p class="shop-cart-bar-status" data-shop-cart-bar-status role="status" aria-live="polite" hidden></p>
      <a class="shop-cart-bar-link" href="#cart">${shop.cartOpen} · ${shop.cartCount(cartLines.length)}${cartLines.length ? ` · ${formatCartMoneySummary(cartSplitTotals(cartLines), (n) => formatEur(n, locale), shop.monthSuffix, ' · ')}` : ''}</a>
    </div>`

  if (detail) {
    return `
      <div class="shop-page" data-shop-root>
        ${cartBar}
        <div class="shop-detail wrap" data-shop-detail>
          ${renderDetail(locale, detail)}
        </div>
        <div class="wrap">
          ${renderCartPanel(locale, cartLines)}
          ${renderShopFaq(locale)}
          ${renderQuoteForm(locale, detail.package.shopCategory, `${detail.service}:${detail.package.id}`)}
        </div>
      </div>`
  }

  const groups = groupByService(items)
  const flattenCatalog = state.sort === 'price-asc' || state.sort === 'price-desc' || state.sort === 'name'
  const catalogBody = !items.length
    ? `<div class="shop-empty-block">
        <p class="shop-empty">${shop.empty}</p>
        <button type="button" class="shop-filter-clear" data-shop-clear-filters>${shop.filterClear}</button>
      </div>`
    : flattenCatalog
      ? `<div class="shop-plan-row shop-plan-row--flat">${items.map((item) => renderPlanCard(locale, item)).join('')}</div>`
      : groups.map((g) => renderPlanGroup(locale, g.service, g.items)).join('')
  return `
    <div class="shop-page" data-shop-root>
      <header class="shop-hero-band">
        <div class="wrap shop-hero">
          <p class="shop-eyebrow">${shop.eyebrow}</p>
          <h1>${shop.title}</h1>
          <p class="lead">${shop.lead}</p>
          <div class="shop-hero-actions">
            <a class="ts-btn pink solid" href="#catalog">${shop.heroPrimaryCta}</a>
            <a class="ts-btn pink" href="${briefingHref({ service: 'general', intent: 'quote', from: 'shop-hero' })}">${shop.heroSecondaryCta}</a>
          </div>
          <p class="shop-note shop-taxonomy-note">${shop.taxonomyNote}</p>
        </div>
      </header>
      ${cartBar}
      ${renderServiceDiscovery(locale)}
      ${renderProcess(locale)}

      <section class="shop-catalog-section" id="catalog" aria-labelledby="shop-catalog-title">
        <div class="wrap">
          <header class="shop-section-head">
            <h2 id="shop-catalog-title">${shop.catalogTitle}</h2>
            <p class="lead">${shop.catalogLead}</p>
          </header>
        </div>
        <div class="wrap shop-toolbar">
          <label class="shop-search">
            <span class="visually-hidden">${shop.searchLabel}</span>
            <input type="search" name="q" value="${state.query.replace(/"/g, '&quot;')}" placeholder="${shop.searchPlaceholder}" data-shop-search />
          </label>
          <div class="shop-cat-filters" role="group" aria-label="${shop.filterAll}">
            <button type="button" class="shop-chip${state.category === 'all' ? ' is-active' : ''}" data-shop-cat="all" aria-pressed="${state.category === 'all'}">${shop.filterAll}</button>
            ${SHOP_CATEGORY_IDS.map(
              (id) => `
              <button type="button" class="shop-chip${state.category === id ? ' is-active' : ''}" data-shop-cat="${id}" aria-pressed="${state.category === id}">${shop.categories[id].title}</button>`,
            ).join('')}
          </div>
          <div class="shop-mode-filters" role="group" aria-label="${shop.filterModeLabel}">
            ${modeFilters
              .map(
                (f) => `
              <button type="button" class="shop-chip shop-chip--mode${state.mode === f.id ? ' is-active' : ''}" data-shop-mode="${f.id}" aria-pressed="${state.mode === f.id}">${f.label}</button>`,
              )
              .join('')}
          </div>
          ${renderActiveFilters(locale, state)}
          <div class="shop-toolbar-meta">
            <p class="shop-results" data-shop-count>${shop.results(items.length)}</p>
            <label class="shop-sort">
              <span>${shop.sortLabel}</span>
              <select data-shop-sort>
                ${sortOptions
                  .map(
                    (opt) =>
                      `<option value="${opt.id}"${state.sort === opt.id ? ' selected' : ''}>${opt.label}</option>`,
                  )
                  .join('')}
              </select>
            </label>
          </div>
        </div>

        <div class="wrap shop-catalog" data-shop-grid>
          ${catalogBody}
          <p class="shop-note shop-note--soft">${shop.vatNote} ${shop.missingTerms}</p>
        </div>
      </section>

      <div class="wrap shop-compare-dock" data-shop-compare-dock hidden>
        <p data-shop-compare-status></p>
        <button type="button" class="ts-btn pink solid" data-shop-compare-open>${shop.compareOpen}</button>
        <button type="button" class="booking-back" data-shop-compare-clear>${shop.compareClear}</button>
      </div>
      <div class="shop-compare-panel wrap" data-shop-compare-panel hidden tabindex="-1" role="dialog" aria-labelledby="shop-compare-title">
        <div class="shop-compare-panel-head">
          <h2 id="shop-compare-title">${shop.compareTitle}</h2>
          <button type="button" class="booking-back" data-shop-compare-close>${shop.compareClose}</button>
        </div>
        <div class="shop-compare-table-wrap" data-shop-compare-body></div>
      </div>

      <div class="wrap">
        <section class="shop-after" aria-labelledby="shop-after-title">
          <h2 id="shop-after-title">${shop.afterOrderTitle}</h2>
          <ol class="shop-after-order">${shop.afterOrderSteps.map((step) => `<li>${step}</li>`).join('')}</ol>
          <p class="shop-note">${shop.afterOrderNote}</p>
        </section>
        ${renderCartPanel(locale, cartLines)}
        ${renderShopFaq(locale)}
        ${renderFinalCta(locale)}
        ${renderQuoteForm(locale)}
      </div>
    </div>`
}

let shopPopBound = false

export function initShopPage(
  root: ParentNode,
  locale: Locale,
  onRerender: (state: ShopFilterState) => void,
) {
  const shop = t(locale).shopPage
  const rawPackage = (new URLSearchParams(location.search).get('package') || '').trim()
  let state = readFiltersFromUrl()
  const host = root.querySelector<HTMLElement>('[data-shop-root]')
  if (!host) return

  if (rawPackage && !state.packageId) {
    trackEvent('shop_deeplink_invalid', {
      locale,
      service: state.service || 'none',
      package: rawPackage,
    })
    writeFiltersToUrl(state)
  }
  if (state.packageId && state.service) {
    trackEvent('shop_detail_view', {
      locale,
      service: state.service,
      package: state.packageId,
    })
  } else {
    trackEvent('shop_page_view', {
      locale,
      category: state.category,
      mode: state.mode,
      service: state.service || 'none',
      q: state.query ? '1' : '0',
    })
  }

  let searchTimer = 0
  host.querySelector<HTMLInputElement>('[data-shop-search]')?.addEventListener('input', (event) => {
    const value = (event.target as HTMLInputElement).value
    window.clearTimeout(searchTimer)
    searchTimer = window.setTimeout(() => {
      state = { ...state, query: value, service: '', packageId: '' }
      writeFiltersToUrl(state)
      onRerender(state)
    }, 180)
  })

  host.querySelectorAll<HTMLButtonElement>('[data-shop-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.shopCat || 'all'
      state = {
        ...state,
        category: cat === 'all' || isShopCategoryId(cat) ? cat : 'all',
        service: '',
        packageId: '',
      }
      writeFiltersToUrl(state)
      trackEvent('shop_filter_category', { category: state.category, locale })
      onRerender(state)
    })
  })

  host.querySelectorAll<HTMLButtonElement>('[data-shop-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = (btn.dataset.shopMode || 'all') as ShopFilterState['mode']
      state = { ...state, mode, service: '', packageId: '' }
      writeFiltersToUrl(state)
      trackEvent('shop_filter_mode', { mode: state.mode, locale })
      onRerender(state)
    })
  })

  host.querySelector<HTMLSelectElement>('[data-shop-sort]')?.addEventListener('change', (event) => {
    const value = (event.target as HTMLSelectElement).value
    state = { ...state, sort: isShopSort(value) ? value : 'popular', packageId: '' }
    writeFiltersToUrl(state)
    trackEvent('shop_sort', { sort: state.sort, locale })
    onRerender(state)
  })

  host.querySelectorAll<HTMLButtonElement>('[data-shop-clear-chip]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.shopClearChip || ''
      if (key === 'cat') state = { ...state, category: 'all' }
      else if (key === 'mode') state = { ...state, mode: 'all' }
      else if (key === 'q') state = { ...state, query: '' }
      else if (key === 'service') state = { ...state, service: '' }
      state = { ...state, packageId: '' }
      writeFiltersToUrl(state)
      onRerender(state)
    })
  })

  host.querySelector<HTMLButtonElement>('[data-shop-clear-filters]')?.addEventListener('click', () => {
    state = {
      ...state,
      category: 'all',
      mode: 'all',
      query: '',
      service: '',
      packageId: '',
    }
    writeFiltersToUrl(state)
    trackEvent('shop_filter_clear', { locale })
    onRerender(state)
  })

  host.querySelectorAll<HTMLAnchorElement>('[data-shop-quote-prefill]').forEach((link) => {
    link.addEventListener('click', () => {
      const shop = t(locale).shopPage
      const raw = link.dataset.shopQuotePrefill || ''
      const [service, packageId] = raw.split(':')
      const form = host.querySelector<HTMLFormElement>('[data-shop-quote]')
      if (!form) return
      const hint = form.querySelector<HTMLInputElement>('input[name="packageHint"]')
      if (hint) hint.value = raw
      const area = form.querySelector<HTMLSelectElement>('select[name="area"]')
      if (area && service && isBookingServiceKey(service)) {
        const item = findShopPackage(service, packageId || '')
        if (item) area.value = item.package.shopCategory
      }
      const packageLabel = resolveQuotePackageLabel(locale, raw)
      let chip = form.querySelector<HTMLElement>('[data-shop-quote-package]')
      if (packageLabel) {
        if (!chip) {
          chip = document.createElement('p')
          chip.className = 'shop-quote-selected'
          chip.dataset.shopQuotePackage = ''
          form.prepend(chip)
        }
        chip.innerHTML = `<span class="shop-quote-selected-label">${shop.quoteSelectedPackage}</span><strong>${packageLabel}</strong>`
      }
      const msg = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]')
      if (msg && !msg.value.trim() && service && packageId) {
        const copy = packageCopy(locale, service as BookingServiceKey, packageId)
        msg.value = `${serviceTitle(locale, service as BookingServiceKey)} / ${copy?.title ?? packageId}`
      }
    })
  })

  const feedback = (message: string) => {
    const el =
      host.querySelector<HTMLElement>('[data-shop-cart-feedback]') ||
      host.querySelector<HTMLElement>('[data-shop-cart-bar-status]')
    if (!el) return
    el.hidden = false
    el.textContent = message
  }

  const flash = takeCartFlash()
  if (flash) {
    feedback(flash)
    const cartEl = host.querySelector('#cart')
    if (cartEl) {
      requestAnimationFrame(() => {
        cartEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      })
    }
  }

  const buybox = host.querySelector<HTMLElement>('[data-shop-buybox]')
  const bookingCta = host.querySelector<HTMLAnchorElement>('[data-shop-booking-cta]')
  const updateBuyboxTotal = () => {
    if (!buybox) return
    const base = Number(buybox.dataset.basePrice || 0)
    const checked = buybox.querySelectorAll<HTMLInputElement>('input[name="addon"]:checked')
    let extra = 0
    const addonIds: string[] = []
    checked.forEach((input) => {
      extra += Number(input.dataset.addonPrice || 0)
      addonIds.push(input.value)
    })
    const totalEl = buybox.querySelector<HTMLElement>('[data-shop-buybox-total]')
    const period = (buybox.dataset.period || '').trim()
    if (totalEl) {
      totalEl.textContent = `${formatEur(base + extra, locale)}${period ? ` ${period}` : ''}`
    }
    if (bookingCta) {
      const service = bookingCta.dataset.service || ''
      const packageId = bookingCta.dataset.package || ''
      if (isBookingServiceKey(service) && packageId) {
        bookingCta.href = bookingHref(service, packageId, addonIds)
      }
    }
  }
  buybox?.querySelectorAll<HTMLInputElement>('input[name="addon"]').forEach((input) => {
    input.addEventListener('change', updateBuyboxTotal)
  })
  updateBuyboxTotal()

  host.querySelectorAll<HTMLButtonElement>('[data-shop-add-cart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const service = btn.dataset.service || ''
      const packageId = btn.dataset.package || ''
      const fromDetail = btn.hasAttribute('data-shop-detail-cart')
      const addonIds = fromDetail
        ? Array.from(
            host.querySelectorAll<HTMLInputElement>('input[name="addon"]:checked'),
          ).map((input) => input.value)
        : []
      const result = addToCart(service, packageId, addonIds, { replaceAddons: fromDetail })
      const shop = t(locale).shopPage
      if (result.ok) {
        setCartFlash(result.updated ? shop.cartUpdated : shop.cartAdded)
        trackEvent('shop_cart_add', {
          service,
          package: packageId,
          locale,
          addons: addonIds.join('|') || 'none',
          updated: result.updated ? '1' : '0',
        })
        if (location.hash !== '#cart') history.replaceState(null, '', `${location.pathname}${location.search}#cart`)
        onRerender(state)
        return
      }
      if (result.reason === 'duplicate') feedback(shop.cartDuplicate)
      else if (result.reason === 'full') feedback(shop.cartFull)
      else feedback(shop.cartError)
    })
  })

  host.querySelectorAll<HTMLButtonElement>('[data-shop-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const raw = btn.dataset.shopRemove || ''
      const [service, packageId] = raw.split(':')
      if (service && packageId) {
        removeFromCart(service, packageId)
        trackEvent('shop_cart_remove', { service, package: packageId, locale })
        onRerender(state)
      }
    })
  })

  host.querySelector<HTMLButtonElement>('[data-shop-clear-cart]')?.addEventListener('click', () => {
    clearCart()
    trackEvent('shop_cart_clear', { locale })
    onRerender(state)
  })

  const cartPay = host.querySelector<HTMLFormElement>('[data-shop-cart-pay]')
  cartPay?.addEventListener('submit', async (event) => {
    event.preventDefault()
    const shop = t(locale).shopPage
    const data = new FormData(cartPay)
    const name = String(data.get('name') || '').trim()
    const email = String(data.get('email') || '').trim()
    const err = host.querySelector<HTMLElement>('[data-shop-cart-error]')
    const submit = host.querySelector<HTMLButtonElement>('[data-shop-cart-submit]')
    if (!name || !email) {
      cartPay.reportValidity()
      return
    }
    const items = readCart()
    if (!items.length) return
    if (err) {
      err.hidden = true
      err.textContent = ''
    }
    if (cartHasMixedBilling(items)) {
      if (err) {
        err.hidden = false
        err.textContent = shop.cartMixedBilling
      }
      return
    }
    if (items.length > 1) {
      if (err) {
        err.hidden = false
        err.textContent = shop.cartSingleItemOnly
      }
      return
    }
    const primary = items[0]!
    const submitted = readSubmittedBriefing()
    if (!briefingMatchesCart(submitted, primary.service, primary.packageId, primary.addonIds)) {
      const href = briefingHref({
        service: primary.service,
        packageId: primary.packageId,
        addonIds: primary.addonIds,
        intent: 'checkout',
        from: 'cart',
        lang: locale === 'de' ? undefined : locale,
      })
      try {
        sessionStorage.setItem(
          'bditec-briefing-cart-handoff',
          JSON.stringify({ email, name, items }),
        )
      } catch {
        /* ignore */
      }
      trackEvent('shop_cart_briefing_redirect', { locale, service: primary.service })
      window.location.href = href
      return
    }
    if (submit) {
      submit.disabled = true
      submit.textContent = shop.cartProcessing
    }
    const result = await startCartCheckout({
      items,
      email,
      name,
      locale,
      briefingRef: submitted!.referenceId,
      briefingToken: submitted!.accessToken,
    })
    if (result.mode === 'stripe' || result.mode === 'demo') {
      trackEvent('shop_cart_checkout', {
        locale,
        mode: result.mode,
        items: items.length,
        total: result.totalEur ?? cartTotalEur(items),
      })
      clearCart()
      window.location.href = result.url
      return
    }
    if (err) {
      err.hidden = false
      const unavailable =
        !result.error || /unavailable|not reachable|Price ID|subscription/i.test(result.error)
      err.textContent = unavailable ? shop.checkoutUnavailable : result.error || shop.cartError
    }
    if (submit) {
      submit.disabled = false
      submit.textContent = shop.cartCheckout
    }
  })

  const form = host.querySelector<HTMLFormElement>('[data-shop-quote]')
  form?.addEventListener('submit', (event) => {
    event.preventDefault()
    const shop = t(locale).shopPage
    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    const email = String(data.get('email') || '').trim()
    const phone = String(data.get('phone') || '').trim()
    const company = String(data.get('company') || '').trim()
    const area = String(data.get('area') || '').trim()
    const budget = String(data.get('budget') || '').trim()
    const timing = String(data.get('timing') || '').trim()
    const message = String(data.get('message') || '').trim()
    const packageHint = String(data.get('packageHint') || '').trim()
    const err = host.querySelector<HTMLElement>('[data-shop-quote-error]')
    const ok = host.querySelector<HTMLElement>('[data-shop-quote-ok]')
    if (!name || !email || !message) {
      form.reportValidity()
      return
    }
    const areaLabel =
      area && isShopCategoryId(area) ? shop.categories[area].title : area || '—'
    const packageLabel = resolveQuotePackageLabel(locale, packageHint)
    const budgetLabel =
      shop.quoteBudgetOptions.find((o) => o.value === budget)?.label || budget
    const timingLabel =
      shop.quoteTimingOptions.find((o) => o.value === timing)?.label || timing
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      company ? `Company: ${company}` : '',
      phone ? `Phone: ${phone}` : '',
      `Area: ${areaLabel}`,
      packageLabel ? `Package: ${packageLabel}` : packageHint ? `Package: ${packageHint}` : '',
      budget ? `Budget (orientation): ${budgetLabel}` : '',
      timing ? `Timeline: ${timingLabel}` : '',
      '',
      message,
    ]
      .filter(Boolean)
      .join('\n')
    const subject = encodeURIComponent(
      packageLabel
        ? `BDITEC quote — ${packageLabel}`
        : `BDITEC quote request — ${areaLabel}`,
    )
    const mailto = `mailto:info@bditec.com?subject=${subject}&body=${encodeURIComponent(body)}`
    trackEvent('shop_quote_mailto', {
      locale,
      area: area || 'none',
      package: packageHint || 'none',
      budget: budget || 'none',
      timing: timing || 'none',
    })
    const summary = host.querySelector<HTMLElement>('[data-shop-quote-summary]')
    const copyBtn = host.querySelector<HTMLButtonElement>('[data-shop-quote-copy]')
    if (summary) {
      summary.hidden = false
      summary.textContent = body
    }
    if (copyBtn) {
      copyBtn.hidden = false
      copyBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(body)
          copyBtn.textContent = shop.quoteCopied
        } catch {
          copyBtn.textContent = shop.quoteCopyFailed
        }
      }
    }
    window.location.href = mailto
    if (err) err.hidden = true
    if (ok) {
      ok.hidden = false
      ok.textContent = shop.quoteSuccess
    }
  })

  host.querySelector<HTMLButtonElement>('[data-shop-print]')?.addEventListener('click', () => {
    trackEvent('shop_print_summary', { locale })
    window.print()
  })

  const compareDock = host.querySelector<HTMLElement>('[data-shop-compare-dock]')
  const compareStatus = host.querySelector<HTMLElement>('[data-shop-compare-status]')
  const comparePanel = host.querySelector<HTMLElement>('[data-shop-compare-panel]')
  const compareBody = host.querySelector<HTMLElement>('[data-shop-compare-body]')
  const maxCompare = 3

  const selectedCompare = (): string[] =>
    [...host.querySelectorAll<HTMLInputElement>('[data-shop-compare]:checked')].map((el) => el.value)

  const syncCompareDock = () => {
    const ids = selectedCompare()
    if (compareDock) compareDock.hidden = ids.length < 2
    if (compareStatus) {
      compareStatus.textContent = shop.compareCount(ids.length)
    }
  }

  host.querySelectorAll<HTMLInputElement>('[data-shop-compare]').forEach((input) => {
    input.addEventListener('change', () => {
      const ids = selectedCompare()
      if (ids.length > maxCompare) {
        input.checked = false
        return
      }
      trackEvent('shop_compare_toggle', {
        locale,
        package: input.value,
        selected: ids.length,
      })
      syncCompareDock()
    })
  })
  syncCompareDock()

  host.querySelector('[data-shop-compare-clear]')?.addEventListener('click', () => {
    host.querySelectorAll<HTMLInputElement>('[data-shop-compare]').forEach((el) => {
      el.checked = false
    })
    if (comparePanel) comparePanel.hidden = true
    syncCompareDock()
  })

  host.querySelector('[data-shop-compare-close]')?.addEventListener('click', () => {
    if (comparePanel) comparePanel.hidden = true
  })

  host.querySelector('[data-shop-compare-open]')?.addEventListener('click', () => {
    const ids = selectedCompare()
    if (ids.length < 2 || !compareBody || !comparePanel) return
    const rows = ids
      .map((raw) => {
        const [service, packageId] = raw.split(':')
        if (!service || !packageId || !isBookingServiceKey(service)) return null
        return findShopPackage(service, packageId)
      })
      .filter(Boolean) as ShopListingItem[]
    if (rows.length < 2) return
    trackEvent('shop_compare_open', { locale, count: rows.length })
    const head = rows
      .map((item) => {
        const copy = packageCopy(locale, item.service, item.package.id)
        const period = pricePeriod(locale, item.package.purchaseMode)
        const price =
          item.package.purchaseMode === 'quote'
            ? shop.priceOnRequest
            : `${formatEur(item.package.priceEur, locale)}${period ? ` ${period}` : ''}`
        return `<th scope="col">${copy?.title ?? item.package.id}<br /><span class="shop-compare-price">${price}</span></th>`
      })
      .join('')
    const featureRows = [0, 1, 2, 3, 4]
      .map((i) => {
        const cells = rows
          .map((item) => {
            const copy = packageCopy(locale, item.service, item.package.id)
            const line = copy?.highlights?.[i] || '—'
            return `<td>${line}</td>`
          })
          .join('')
        return `<tr><th scope="row">${shop.compareFeature} ${i + 1}</th>${cells}</tr>`
      })
      .join('')
    const modeRow = `<tr><th scope="row">${shop.filterModeLabel}</th>${rows
      .map((item) => `<td>${shop.modeBadge[item.package.purchaseMode]}</td>`)
      .join('')}</tr>`
    const ctaRow = `<tr><th scope="row"></th>${rows
      .map((item) => {
        const href = `/shop.html?service=${encodeURIComponent(item.service)}&package=${encodeURIComponent(item.package.id)}`
        return `<td><a href="${href}">${shop.viewDetails}</a></td>`
      })
      .join('')}</tr>`
    compareBody.innerHTML = `
      <table class="shop-compare-table">
        <thead><tr><th scope="col">${shop.compareFeature}</th>${head}</tr></thead>
        <tbody>${modeRow}${featureRows}${ctaRow}</tbody>
      </table>`
    comparePanel.hidden = false
    comparePanel.focus()
  })

  if (!shopPopBound) {
    shopPopBound = true
    window.addEventListener('popstate', () => {
      onRerender(readFiltersFromUrl())
    })
  }
}
