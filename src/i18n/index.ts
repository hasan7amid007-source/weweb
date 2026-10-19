import { SITE_ORIGIN } from '../data/services'
import type { Locale, Messages } from './types'
import { de } from './de'
import { en } from './en'
import { ar } from './ar'

export type { Locale, Messages }

const catalog: Record<Locale, Messages> = { de, en, ar }

export const LOCALES: { id: Locale; label: string }[] = [
  { id: 'de', label: 'DE' },
  { id: 'en', label: 'EN' },
  { id: 'ar', label: 'AR' },
]

const STORAGE_KEY = 'bditec-locale'

export function isLocale(v: string | null | undefined): v is Locale {
  return v === 'de' || v === 'en' || v === 'ar'
}

export function detectLocale(): Locale {
  try {
    const param = new URLSearchParams(location.search).get('lang')
    if (isLocale(param)) return param
  } catch {
    /* ignore */
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLocale(saved)) return saved
  } catch {
    /* ignore */
  }
  const nav = (navigator.language || 'de').toLowerCase()
  if (nav.startsWith('ar')) return 'ar'
  if (nav.startsWith('en')) return 'en'
  return 'de'
}

export function setLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    /* ignore */
  }
  document.documentElement.lang = locale
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.dataset.locale = locale
  syncLangQuery(locale)
}

/** Keep `?lang=` in the URL so EN/AR are shareable and crawl-visible. */
function syncLangQuery(locale: Locale) {
  try {
    const url = new URL(location.href)
    if (locale === 'de') url.searchParams.delete('lang')
    else url.searchParams.set('lang', locale)
    const next = `${url.pathname}${url.search}${url.hash}`
    if (next !== `${location.pathname}${location.search}${location.hash}`) {
      history.replaceState(null, '', next)
    }
  } catch {
    /* ignore */
  }
}

export function t(locale: Locale): Messages {
  return catalog[locale] ?? de
}

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

function upsertLink(rel: string, href: string, hreflang?: string) {
  const sel = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`
  let el = document.querySelector<HTMLLinkElement>(sel)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    if (hreflang) el.hreflang = hreflang
    document.head.appendChild(el)
  }
  el.href = href
}

function applyHreflang(path: string) {
  const base = path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`
  upsertLink('alternate', base, 'de')
  upsertLink('alternate', `${base}${base.includes('?') ? '&' : '?'}lang=en`, 'en')
  upsertLink('alternate', `${base}${base.includes('?') ? '&' : '?'}lang=ar`, 'ar')
  upsertLink('alternate', base, 'x-default')
}

function injectHomeJsonLd(locale: Locale) {
  const faq = t(locale).faq
  const strip = (html: string) => html.replace(/<[^>]+>/g, '')
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'BDITEC',
        url: SITE_ORIGIN,
        email: 'info@bditec.com',
        telephone: '+49-1573-5804396',
        logo: `${SITE_ORIGIN}/favicon.svg`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Alte Holsten Straße 72',
          addressLocality: 'Hamburg',
          postalCode: '21029',
          addressCountry: 'DE',
        },
        sameAs: [],
      },
      {
        '@type': 'WebSite',
        name: 'BDITEC',
        url: SITE_ORIGIN,
        inLanguage: ['de', 'en', 'ar'],
        publisher: { '@type': 'Organization', name: 'BDITEC', url: SITE_ORIGIN },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: faq.q1, acceptedAnswer: { '@type': 'Answer', text: strip(faq.a1) } },
          { '@type': 'Question', name: faq.q2, acceptedAnswer: { '@type': 'Answer', text: strip(faq.a2) } },
          { '@type': 'Question', name: faq.q3, acceptedAnswer: { '@type': 'Answer', text: strip(faq.a3) } },
          { '@type': 'Question', name: faq.q4, acceptedAnswer: { '@type': 'Answer', text: strip(faq.a4) } },
        ],
      },
    ],
  }
  document.querySelectorAll('script[data-home-jsonld]').forEach((n) => n.remove())
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.dataset.homeJsonld = '1'
  script.textContent = JSON.stringify(payload)
  document.head.appendChild(script)
}

export function applyMeta(locale: Locale) {
  const m = t(locale)
  const url = `${SITE_ORIGIN}/`
  const image = `${SITE_ORIGIN}/page/devices-showcase.jpg`
  document.title = m.meta.title
  upsertMeta('name', 'description', m.meta.description)
  upsertLink('canonical', url)
  applyHreflang('/')
  injectHomeJsonLd(locale)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:site_name', 'BDITEC')
  upsertMeta('property', 'og:title', m.meta.title)
  upsertMeta('property', 'og:description', m.meta.description)
  upsertMeta('property', 'og:url', url)
  upsertMeta('property', 'og:image', image)
  upsertMeta(
    'property',
    'og:locale',
    locale === 'de' ? 'de_DE' : locale === 'en' ? 'en_US' : 'ar_AR',
  )
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', m.meta.title)
  upsertMeta('name', 'twitter:description', m.meta.description)
  upsertMeta('name', 'twitter:image', image)
}

export { applyHreflang }
