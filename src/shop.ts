import './styles/site.css'
import './styles/effects.css'
import { SITE_ORIGIN } from './data/services'
import { initTelemetry } from './lib/telemetry'
import { bindLangSwitch, bindNavToggle, renderFooter, renderHeader } from './features/shell'
import {
  initShopPage,
  readFiltersFromUrl,
  renderShopMarkup,
  type ShopFilterState,
} from './features/shop/page'
import { applyHreflang, detectLocale, setLocale, t, type Locale } from './i18n'

const root = document.querySelector<HTMLDivElement>('#app')
if (!root) throw new Error('#app not found')
const app = root

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const sel = attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`
  let el = document.querySelector<HTMLMetaElement>(sel)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

function applyShopMeta(locale: Locale) {
  const shop = t(locale).shopPage
  const url = `${SITE_ORIGIN}/shop.html`
  document.title = shop.metaTitle
  upsertMeta('name', 'description', shop.metaDescription)
  upsertLink('canonical', url)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:title', shop.metaTitle)
  upsertMeta('property', 'og:description', shop.metaDescription)
  upsertMeta('property', 'og:url', url)
  upsertMeta('property', 'og:image', `${SITE_ORIGIN}/page/devices-showcase.jpg`)
  upsertMeta(
    'property',
    'og:locale',
    locale === 'de' ? 'de_DE' : locale === 'en' ? 'en_US' : 'ar_AR',
  )
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', shop.metaTitle)
  upsertMeta('name', 'twitter:description', shop.metaDescription)
  upsertMeta('name', 'twitter:image', `${SITE_ORIGIN}/page/devices-showcase.jpg`)
  applyHreflang('/shop.html')
}

function render(locale: Locale, state: ShopFilterState, restoreSearch = false) {
  setLocale(locale)
  applyShopMeta(locale)
  document.documentElement.lang = locale === 'ar' ? 'ar' : locale
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'

  const prevSearch = restoreSearch
    ? app.querySelector<HTMLInputElement>('[data-shop-search]')
    : null
  const caret = prevSearch?.selectionStart ?? null

  app.innerHTML = `
    ${renderHeader(locale, 'shop')}
    <main id="main">
      ${renderShopMarkup(locale, state)}
    </main>
    ${renderFooter(locale, 'shop')}
  `

  bindLangSwitch(app, locale, (next) => render(next, readFiltersFromUrl()))
  bindNavToggle(app, locale)
  initShopPage(app, locale, (next) => render(locale, next, true))
  initTelemetry()

  if (restoreSearch) {
    const search = app.querySelector<HTMLInputElement>('[data-shop-search]')
    if (search) {
      search.focus()
      if (caret != null) search.setSelectionRange(caret, caret)
    }
  }
}

render(detectLocale(), readFiltersFromUrl())
