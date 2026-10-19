import './styles/site.css'
import './styles/effects.css'
import { SITE_ORIGIN } from './data/services'
import { initAccordions } from './features/accordion'
import { listShopPackages } from './features/booking/shop-catalog'
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

function injectShopJsonLd(locale: Locale) {
  const shop = t(locale).shopPage
  const booking = t(locale).bookingShop
  const items = listShopPackages().map((item, index) => {
    const copy = booking.packages[item.service]?.[item.package.id]
    const name = copy?.title || item.package.id
    const detailUrl = `${SITE_ORIGIN}/shop.html?service=${encodeURIComponent(item.service)}&package=${encodeURIComponent(item.package.id)}`
    return {
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Offer',
        name,
        url: detailUrl,
        price: item.package.priceEur,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'BDITEC', url: SITE_ORIGIN },
      },
    }
  })
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: shop.metaTitle,
        description: shop.metaDescription,
        url: `${SITE_ORIGIN}/shop.html`,
        numberOfItems: items.length,
        itemListElement: items,
      },
      {
        '@type': 'FAQPage',
        mainEntity: shop.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  }
  document.querySelectorAll('script[data-shop-jsonld]').forEach((n) => n.remove())
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.dataset.shopJsonld = '1'
  script.textContent = JSON.stringify(payload)
  document.head.appendChild(script)
}

function applyShopMeta(locale: Locale) {
  const shop = t(locale).shopPage
  const url = `${SITE_ORIGIN}/shop.html`
  document.title = shop.metaTitle
  upsertMeta('name', 'description', shop.metaDescription)
  upsertLink('canonical', url)
  injectShopJsonLd(locale)
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
  initAccordions(app)
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
