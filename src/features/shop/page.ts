import {
  SHOP_CATEGORY_IDS,
  bookingHref,
  canAddToCart,
  findShopPackage,
  isShopCategoryId,
  listShopPackages,
  shopFor,
  type PurchaseMode,
  type ShopCategoryId,
  type ShopListingItem,
} from '../booking/shop-catalog'
import { startCartCheckout } from '../booking/checkout-client'
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

function renderPlanCard(locale: Locale, item: ShopListingItem): string {
  const shop = t(locale).shopPage
  const copy = packageCopy(locale, item.service, item.package.id)
  const href = `/shop.html?service=${encodeURIComponent(item.service)}&package=${encodeURIComponent(item.package.id)}`
  const featured = item.package.recommended ? ' is-featured' : ''
  const period = pricePeriod(locale, item.package.purchaseMode)
  const highlights = copy?.highlights?.length
    ? copy.highlights
    : [copy?.blurb ?? shop.modeBadge[item.package.purchaseMode]].filter(Boolean)
  const cartable = canAddToCart(item.package.purchaseMode)
  const primaryCta = cartable
    ? `<button type="button" class="shop-plan-cta ts-btn pink solid" data-shop-add-cart data-service="${item.service}" data-package="${item.package.id}">${shop.cartAdd}</button>`
    : `<a class="shop-plan-cta ts-btn pink solid" href="#quote" data-shop-quote-prefill="${item.service}:${item.package.id}">${shop.ctaQuote}</a>`
  return `
    <article class="shop-plan${featured}">
      ${item.package.recommended ? `<p class="shop-plan-ribbon">${shop.recommended}</p>` : ''}
      <p class="shop-plan-mode shop-mode-badge shop-mode-badge--${item.package.purchaseMode}">${shop.modeBadge[item.package.purchaseMode]}</p>
      <h3 class="shop-plan-title">${copy?.title ?? item.package.id}</h3>
      <p class="shop-plan-price">
        <span class="shop-plan-amount">${formatEur(item.package.priceEur, locale)}</span>
        ${period ? `<span class="shop-plan-period">${period}</span>` : ''}
      </p>
      <p class="shop-plan-blurb">${copy?.blurb ?? ''}</p>
      <ul class="shop-plan-features" aria-label="${shop.planIncludes}">
        ${highlights.map((line) => `<li>${line}</li>`).join('')}
      </ul>
      <div class="shop-plan-actions">
        ${primaryCta}
        <a class="shop-plan-details" href="${href}">${shop.viewDetails}</a>
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
            return `
              <a class="shop-related-card" href="${href}">
                <span class="shop-related-title">${copy?.title ?? other.package.id}</span>
                <span class="shop-related-price">${formatEur(other.package.priceEur, locale)}${period ? ` ${period}` : ''}</span>
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
  const cartable = canAddToCart(item.package.purchaseMode)
  const catTitle = shop.categories[item.package.shopCategory].title
  const highlights = copy?.highlights?.length ? copy.highlights : []
  const existingLine = readCart().find(
    (line) => line.service === item.service && line.packageId === item.package.id,
  )
  const selectedAddons = new Set(existingLine?.addonIds ?? [])
  const checkoutHref = bookingHref(item.service, item.package.id, [...selectedAddons])
  const buyPrimary = cartable
    ? `<button type="button" class="ts-btn pink solid" data-shop-add-cart data-shop-detail-cart data-service="${item.service}" data-package="${item.package.id}" data-base-price="${item.package.priceEur}">${shop.cartAdd}</button>`
    : `<a class="ts-btn pink solid" href="#quote" data-shop-quote-prefill="${item.service}:${item.package.id}">${shop.ctaQuote}</a>`
  const buySecondary = cartable
    ? `<a class="ts-btn pink" href="${checkoutHref}" data-shop-booking-cta data-service="${item.service}" data-package="${item.package.id}">${item.package.purchaseMode === 'subscription' ? shop.ctaSubscription : shop.ctaCheckout}</a>`
    : ''
  const quoteLink =
    item.package.purchaseMode === 'quote'
      ? ''
      : `<a class="shop-secondary-cta" href="#quote" data-shop-quote-prefill="${item.service}:${item.package.id}">${shop.ctaQuote}</a>`

  const period = pricePeriod(locale, item.package.purchaseMode)
  const addonPicker =
    cartable && addons.length
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
              ? `<ul class="shop-plan-features shop-detail-features" aria-label="${shop.planIncludes}">${highlights.map((line) => `<li>${line}</li>`).join('')}</ul>`
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
          </div>
        </div>
        <aside class="shop-buybox" data-shop-buybox data-base-price="${item.package.priceEur}">
          <p class="shop-detail-price">
            <span class="shop-plan-amount" data-shop-buybox-base>${formatEur(item.package.priceEur, locale)}</span>
            ${period ? `<span class="shop-plan-period">${period}</span>` : ''}
          </p>
          ${addonPicker}
          <p class="shop-buybox-total">
            <span>${shop.buyboxTotal}</span>
            <strong data-shop-buybox-total>${formatEur(item.package.priceEur, locale)}</strong>
          </p>
          <p class="shop-note">${shop.startAmountNote}</p>
          <div class="shop-detail-actions">
            <span class="glowborder">${buyPrimary}</span>
            ${buySecondary ? `<span class="glowborder">${buySecondary}</span>` : ''}
            ${quoteLink}
            <a class="shop-secondary-cta" href="${serviceHref}">${shop.viewService}</a>
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
  const total = cartTotalEur(lines)
  return `
    <section class="shop-cart" id="cart" data-shop-cart>
      <div class="shop-cart-head">
        <h2>${shop.cartTitle}</h2>
        <p class="shop-results">${shop.cartCount(lines.length)} · ${formatEur(total, locale)}</p>
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
              const lineTotal = cartTotalEur([line])
              const addonLabels = line.addonIds
                .map((id) => addonCopy(locale, line.service, id)?.title ?? id)
                .filter(Boolean)
              const editHref = `/shop.html?service=${encodeURIComponent(line.service)}&package=${encodeURIComponent(line.packageId)}`
              return `
              <li class="shop-cart-line">
                <div>
                  <strong>${copy?.title ?? line.packageId}</strong>
                  <span>${serviceTitle(locale, line.service)}</span>
                  ${addonLabels.length ? `<span class="shop-cart-addons">${addonLabels.join(' · ')}</span>` : ''}
                  <a class="shop-cart-edit" href="${editHref}">${shop.cartEdit}</a>
                </div>
                <div class="shop-cart-line-actions">
                  <span>${formatEur(lineTotal, locale)}</span>
                  <button type="button" class="shop-cart-remove" data-shop-remove="${line.service}:${line.packageId}">${shop.cartRemove}</button>
                </div>
              </li>`
            })
            .join('')}
        </ul>
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
          <p class="booking-hint">${shop.cartPayHint}</p>
          <p class="booking-error" data-shop-cart-error hidden></p>
          <span class="glowborder">
            <button type="submit" class="ts-btn pink solid" data-shop-cart-submit>${shop.cartCheckout}</button>
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

function renderQuoteForm(locale: Locale, prefillService = '', prefillPackage = ''): string {
  const m = t(locale)
  const shop = m.shopPage
  const options = [
    ['', m.contact.servicePlaceholder],
    ...SHOP_CATEGORY_IDS.map((id) => [id, shop.categories[id].title] as const),
  ]
  return `
    <section class="shop-quote" id="quote">
      <h2>${shop.quoteTitle}</h2>
      <p class="lead">${shop.quoteLead}</p>
      <form class="contact-form shop-quote-form" data-shop-quote novalidate>
        <input type="hidden" name="packageHint" value="${prefillPackage}" />
        <label class="contact-field">
          <span>${shop.quoteName} <em>*</em></span>
          <input type="text" name="name" required autocomplete="name" maxlength="120" />
        </label>
        <label class="contact-field">
          <span>${shop.quoteEmail} <em>*</em></span>
          <input type="email" name="email" required autocomplete="email" maxlength="254" />
        </label>
        <label class="contact-field">
          <span>${shop.quotePhone}</span>
          <input type="tel" name="phone" autocomplete="tel" />
        </label>
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
        <label class="contact-field">
          <span>${shop.quoteMessage} <em>*</em></span>
          <textarea name="message" rows="4" required></textarea>
        </label>
        <p class="booking-hint">${shop.quoteHint}</p>
        <p class="booking-error" data-shop-quote-error hidden></p>
        <p class="shop-quote-ok" data-shop-quote-ok hidden>${shop.quoteSuccess}</p>
        <span class="glowborder">
          <button type="submit" class="ts-btn pink solid">${shop.quoteSubmit}</button>
        </span>
      </form>
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
      <a class="shop-cart-bar-link" href="#cart">${shop.cartOpen} · ${shop.cartCount(cartLines.length)}</a>
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
        </div>
      </header>
      ${cartBar}

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

      <div class="wrap">
        ${renderCartPanel(locale, cartLines)}
        ${renderShopFaq(locale)}
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
    if (totalEl) totalEl.textContent = formatEur(base + extra, locale)
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
    if (submit) {
      submit.disabled = true
      submit.textContent = shop.cartProcessing
    }
    const result = await startCartCheckout({ items, email, name, locale })
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
      err.textContent = result.error || shop.cartError
    }
    if (submit) {
      submit.disabled = false
      submit.textContent = shop.cartCheckout
    }
  })

  const form = host.querySelector<HTMLFormElement>('[data-shop-quote]')
  form?.addEventListener('submit', (event) => {
    event.preventDefault()
    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    const email = String(data.get('email') || '').trim()
    const phone = String(data.get('phone') || '').trim()
    const area = String(data.get('area') || '').trim()
    const message = String(data.get('message') || '').trim()
    const packageHint = String(data.get('packageHint') || '').trim()
    const err = host.querySelector<HTMLElement>('[data-shop-quote-error]')
    const ok = host.querySelector<HTMLElement>('[data-shop-quote-ok]')
    if (!name || !email || !message) {
      form.reportValidity()
      return
    }
    const areaLabel =
      area && isShopCategoryId(area) ? t(locale).shopPage.categories[area].title : area || '—'
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : '',
      `Area: ${areaLabel}`,
      packageHint ? `Package: ${packageHint}` : '',
      '',
      message,
    ]
      .filter(Boolean)
      .join('\n')
    const subject = encodeURIComponent(`BDITEC quote request — ${areaLabel}`)
    const mailto = `mailto:info@bditec.com?subject=${subject}&body=${encodeURIComponent(body)}`
    trackEvent('shop_quote_mailto', { locale, area: area || 'none', package: packageHint || 'none' })
    window.location.href = mailto
    if (err) err.hidden = true
    if (ok) ok.hidden = false
  })

  if (!shopPopBound) {
    shopPopBound = true
    window.addEventListener('popstate', () => {
      onRerender(readFiltersFromUrl())
    })
  }
}
