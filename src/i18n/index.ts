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

function upsertLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

export function applyMeta(locale: Locale) {
  const m = t(locale)
  const url = `${SITE_ORIGIN}/`
  const image = `${SITE_ORIGIN}/page/devices-showcase.jpg`
  document.title = m.meta.title
  upsertMeta('name', 'description', m.meta.description)
  upsertLink('canonical', url)
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
