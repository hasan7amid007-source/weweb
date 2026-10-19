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
  type CartLine,
} from './cart'
import { SERVICE_ICONS, servicePath, type ServiceId } from '../../data/services'
import { trackEvent } from '../../lib/telemetry'
import { type Locale, t } from '../../i18n'

export type ShopFilterState = {
  category: ShopCategoryId | 'all'
  mode: PurchaseMode | 'all'
  query: string
  service: string
  packageId: string
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

function readFiltersFromUrl(): ShopFilterState {
  const params = new URLSearchParams(location.search)
  const catRaw = params.get('cat') || 'all'
  const modeRaw = params.get('mode') || 'all'
  const category =
    catRaw === 'all' || isShopCategoryId(catRaw) ? (catRaw as ShopFilterState['category']) : 'all'
  const mode =
    modeRaw === 'all' ||
    modeRaw === 'checkout' ||
    modeRaw === 'subscription' ||
    modeRaw === 'quote'
      ? (modeRaw as ShopFilterState['mode'])
      : 'all'
  return {
    category,
    mode,
    query: (params.get('q') || '').trim(),
    service: (params.get('service') || '').trim(),
    packageId: (params.get('package') || '').trim(),
  }
}

function writeFiltersToUrl(state: ShopFilterState, replace = true) {
  const url = new URL(location.href)
  const setOrDel = (key: string, value: string) => {
    if (!value || value === 'all') url.searchParams.delete(key)
    else url.searchParams.set(key, value)
  }
  setOrDel('cat', state.category)
  setOrDel('mode', state.mode)
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

function renderCard(locale: Locale, item: ShopListingItem): string {
  const m = t(locale)
  const shop = m.shopPage
  const copy = packageCopy(locale, item.service, item.package.id)
  const href = `/shop.html?service=${encodeURIComponent(item.service)}&package=${encodeURIComponent(item.package.id)}`
  return `
    <article class="shop-card">
      <a class="shop-card-link" href="${href}">
        <div class="shop-card-top">
          <img src="${iconFor(item.service)}" width="28" height="28" alt="" />
          <span class="shop-mode-badge shop-mode-badge--${item.package.purchaseMode}">${shop.modeBadge[item.package.purchaseMode]}</span>
        </div>
        <p class="shop-card-service">${serviceTitle(locale, item.service)}</p>
        <h3 class="shop-card-title">${copy?.title ?? item.package.id}</h3>
        <p class="shop-card-blurb">${copy?.blurb ?? ''}</p>
        <div class="shop-card-foot">
          <span class="shop-card-price">${shop.fromLabel} ${formatEur(item.package.priceEur, locale)}</span>
          ${item.package.recommended ? `<span class="shop-card-rec">${shop.recommended}</span>` : ''}
        </div>
      </a>
    </article>`
}

function renderDetail(locale: Locale, item: ShopListingItem): string {
  const m = t(locale)
  const shop = m.shopPage
  const copy = packageCopy(locale, item.service, item.package.id)
  const addons = shopFor(item.service).addons
  const serviceHref =
    item.service === 'general' ? '/#services' : servicePath(item.service as ServiceId)
  const checkoutHref = bookingHref(item.service, item.package.id)
  const cartable = canAddToCart(item.package.purchaseMode)
  const primaryCta =
    item.package.purchaseMode === 'quote'
      ? `<a class="ts-btn pink solid" href="#quote" data-shop-quote-prefill="${item.service}:${item.package.id}">${shop.ctaQuote}</a>`
      : item.package.purchaseMode === 'subscription'
        ? `<a class="ts-btn pink solid" href="${checkoutHref}">${shop.ctaSubscription}</a>`
        : `<a class="ts-btn pink solid" href="${checkoutHref}">${shop.ctaCheckout}</a>`
  const addCartCta = cartable
    ? `<button type="button" class="ts-btn pink" data-shop-add-cart data-service="${item.service}" data-package="${item.package.id}">${shop.cartAdd}</button>`
    : ''
  const secondaryCta =
    item.package.purchaseMode === 'quote'
      ? ''
      : `<a class="shop-secondary-cta" href="#quote" data-shop-quote-prefill="${item.service}:${item.package.id}">${shop.ctaQuote}</a>`

  return `
    <a class="shop-back" href="/shop.html">${shop.detailBack}</a>
    <div class="shop-detail-head">
      <img src="${iconFor(item.service)}" width="40" height="40" alt="" />
      <div>
        <p class="shop-card-service">${serviceTitle(locale, item.service)} · ${shop.categories[item.package.shopCategory].title}</p>
        <h2 class="shop-detail-title">${copy?.title ?? item.package.id}</h2>
        <p class="shop-detail-blurb">${copy?.blurb ?? ''}</p>
      </div>
      <span class="shop-mode-badge shop-mode-badge--${item.package.purchaseMode}">${shop.modeBadge[item.package.purchaseMode]}</span>
    </div>
    <p class="shop-detail-price">${formatEur(item.package.priceEur, locale)}</p>
    <p class="shop-note">${shop.startAmountNote}</p>
    <p class="shop-note shop-note--warn">${shop.missingTerms}</p>
    <div class="shop-detail-grid">
      <section>
        <h3>${shop.scopeTitle}</h3>
        <p>${shop.scopeBody}</p>
        <p><strong>${copy?.title ?? item.package.id}</strong> — ${copy?.blurb ?? ''}</p>
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
        <h3>${shop.extrasTitle}</h3>
        <p>${shop.extrasBody}</p>
        <ul class="shop-extra-list">
          ${addons
            .map((addon) => {
              const a = addonCopy(locale, item.service, addon.id)
              return `<li><span>${a?.title ?? addon.id}</span><span>+${formatEur(addon.priceEur, locale)}</span></li>`
            })
            .join('')}
        </ul>
      </section>
    </div>
    <div class="shop-detail-actions">
      <span class="glowborder">${primaryCta}</span>
      ${addCartCta ? `<span class="glowborder">${addCartCta}</span>` : ''}
      ${secondaryCta}
      <a class="shop-secondary-cta" href="${serviceHref}">${shop.ctaService}</a>
      <p class="shop-cart-feedback" data-shop-cart-feedback role="status" aria-live="polite" hidden></p>
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
          ? `<p class="shop-empty">${shop.cartEmpty}</p>`
          : `
        <ul class="shop-cart-list">
          ${lines
            .map((line) => {
              const copy = packageCopy(locale, line.service, line.packageId)
              const lineTotal = cartTotalEur([line])
              return `
              <li class="shop-cart-line">
                <div>
                  <strong>${copy?.title ?? line.packageId}</strong>
                  <span>${serviceTitle(locale, line.service)}</span>
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
            <input type="text" name="name" required autocomplete="name" />
          </label>
          <label class="contact-field">
            <span>${shop.cartEmail} <em>*</em></span>
            <input type="email" name="email" required autocomplete="email" />
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
          <input type="text" name="name" required autocomplete="name" />
        </label>
        <label class="contact-field">
          <span>${shop.quoteEmail} <em>*</em></span>
          <input type="email" name="email" required autocomplete="email" />
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

export function renderShopMarkup(locale: Locale, state: ShopFilterState): string {
  const m = t(locale)
  const shop = m.shopPage
  const detail =
    state.service && state.packageId
      ? findShopPackage(state.service, state.packageId)
      : undefined
  const items = filterItems(locale, state)
  const modeFilters: { id: PurchaseMode | 'all'; label: string }[] = [
    { id: 'all', label: shop.filterAll },
    { id: 'checkout', label: shop.modeCheckout },
    { id: 'subscription', label: shop.modeSubscription },
    { id: 'quote', label: shop.modeQuote },
  ]

  const cartLines = readCart()
  const cartBar = `
    <div class="wrap shop-cart-bar">
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

  return `
    <div class="shop-page" data-shop-root>
      <div class="wrap shop-hero">
        <p class="shop-eyebrow">${shop.eyebrow}</p>
        <h1>${shop.title}</h1>
        <p class="lead">${shop.lead}</p>
        <p class="shop-note shop-note--warn">${shop.missingTerms}</p>
      </div>
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
        <p class="shop-results" data-shop-count>${shop.results(items.length)}</p>
      </div>

      <div class="wrap shop-grid" data-shop-grid>
        ${
          items.length
            ? items.map((item) => renderCard(locale, item)).join('')
            : `<p class="shop-empty">${shop.empty}</p>`
        }
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
  let state = readFiltersFromUrl()
  const host = root.querySelector<HTMLElement>('[data-shop-root]')
  if (!host) return

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
    const el = host.querySelector<HTMLElement>('[data-shop-cart-feedback]')
    if (!el) return
    el.hidden = false
    el.textContent = message
  }

  host.querySelectorAll<HTMLButtonElement>('[data-shop-add-cart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const service = btn.dataset.service || ''
      const packageId = btn.dataset.package || ''
      const result = addToCart(service, packageId)
      const shop = t(locale).shopPage
      if (result.ok) {
        feedback(shop.cartAdded)
        trackEvent('shop_cart_add', { service, package: packageId, locale })
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

export { readFiltersFromUrl }
