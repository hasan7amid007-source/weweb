import './styles/site.css'
import './styles/effects.css'
import { SITE_ORIGIN } from './data/services'
import { bindLangSwitch, renderFooter, renderHeader } from './features/shell'
import { detectLocale, setLocale, t, type Locale } from './i18n'

const rootEl = document.querySelector<HTMLDivElement>('#app')
if (!rootEl) throw new Error('#app not found')
const root = rootEl

const pageId = document.body.dataset.legal
if (pageId !== 'impressum' && pageId !== 'datenschutz') {
  throw new Error(`Unknown legal page: ${pageId}`)
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

function impressumHtml(locale: Locale): string {
  const m = t(locale)
  return `
    <article class="legal-doc wrap">
      <h1>${m.legal.impressumTitle}</h1>
      <p class="legal-note">${m.legal.counselNote}</p>
      <h2>${m.legal.providerHeading}</h2>
      <p>
        BDITEC<br />
        Alte Holsten Straße 72<br />
        21029 Hamburg<br />
        Deutschland
      </p>
      <h2>${m.legal.contactHeading}</h2>
      <p>
        E-Mail: <a href="mailto:info@bditec.com">info@bditec.com</a><br />
        Telefon: <a href="tel:+4915735804396">+49 1573 5804396</a>
      </p>
      <h2>${m.legal.responsibleHeading}</h2>
      <p>Hasan Hamid, Alte Holsten Straße 72, 21029 Hamburg</p>
    </article>`
}

function datenschutzHtml(locale: Locale): string {
  const m = t(locale)
  return `
    <article class="legal-doc wrap">
      <h1>${m.legal.privacyTitle}</h1>
      <p class="legal-note">${m.legal.counselNote}</p>
      <h2>${m.legal.privacyController}</h2>
      <p>
        BDITEC<br />
        Alte Holsten Straße 72<br />
        21029 Hamburg<br />
        E-Mail: <a href="mailto:info@bditec.com">info@bditec.com</a>
      </p>
      <h2>${m.legal.privacyData}</h2>
      <p>${m.legal.privacyDataBody}</p>
      <h2>${m.legal.privacyPurpose}</h2>
      <p>${m.legal.privacyPurposeBody}</p>
      <h2>${m.legal.privacyRights}</h2>
      <p>${m.legal.privacyRightsBody}</p>
      <h2>${m.legal.privacyHosting}</h2>
      <p>${m.legal.privacyHostingBody}</p>
    </article>`
}

function render(locale: Locale) {
  document.documentElement.lang = locale === 'ar' ? 'ar' : locale
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  const m = t(locale)
  const path = pageId === 'impressum' ? '/impressum.html' : '/datenschutz.html'
  const title = pageId === 'impressum' ? m.legal.impressumTitle : m.legal.privacyTitle
  const description =
    pageId === 'impressum' ? m.legal.impressumDescription : m.legal.privacyDescription
  const url = `${SITE_ORIGIN}${path}`
  document.title = `${title} — BDITEC`
  upsertMeta('name', 'description', description)
  upsertLink('canonical', url)
  upsertMeta('property', 'og:title', `${title} — BDITEC`)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:url', url)

  const body = pageId === 'impressum' ? impressumHtml(locale) : datenschutzHtml(locale)
  root.innerHTML = `
    ${renderHeader(locale, 'service')}
    <main class="legal-main">${body}</main>
    ${renderFooter(locale, 'service')}
  `
  bindLangSwitch(root, locale, (next) => {
    setLocale(next)
    render(next)
  })
}

render(detectLocale())
