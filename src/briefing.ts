import './styles/site.css'
import './styles/effects.css'
import { SITE_ORIGIN } from './data/services'
import { bindLangSwitch, bindNavToggle, renderFooter, renderHeader } from './features/shell'
import {
  createInitialBriefing,
  initBriefingWizard,
  renderBriefingMarkup,
} from './features/briefing/wizard'
import { writeBriefingDraft } from './features/briefing/draft'
import { initTelemetry } from './lib/telemetry'
import { applyHreflang, detectLocale, setLocale, t, type Locale } from './i18n'
import type { BriefingDocument } from './features/briefing/types'

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

function applyMeta(locale: Locale) {
  const copy = t(locale).briefingPage
  const url = `${SITE_ORIGIN}/briefing.html`
  document.title = copy.metaTitle
  upsertMeta('name', 'description', copy.metaDescription)
  upsertMeta('name', 'robots', 'noindex,nofollow')
  upsertMeta('property', 'og:title', copy.metaTitle)
  upsertMeta('property', 'og:description', copy.metaDescription)
  upsertMeta('property', 'og:url', url)
  applyHreflang('/briefing.html')
}

function render(locale: Locale, doc: BriefingDocument | null, step: number) {
  setLocale(locale)
  applyMeta(locale)
  document.documentElement.lang = locale === 'ar' ? 'ar' : locale
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  const copy = t(locale).briefingPage

  if (!doc) {
    app.innerHTML = `
      ${renderHeader(locale, 'shop')}
      <main id="main" class="wrap briefing-page">
        <h1>${copy.title}</h1>
        <p class="lead">${copy.invalidSelection}</p>
        <p><a class="ts-btn pink solid" href="/shop.html">${copy.pickPackage}</a></p>
      </main>
      ${renderFooter(locale, 'shop')}
    `
    bindLangSwitch(app, locale, (next) => render(next, null, 0))
    bindNavToggle(app, locale)
    initTelemetry()
    return
  }

  writeBriefingDraft(doc)
  app.innerHTML = `
    ${renderHeader(locale, 'shop')}
    <main id="main">
      ${renderBriefingMarkup(locale, doc, step)}
    </main>
    ${renderFooter(locale, 'shop')}
  `
  bindLangSwitch(app, locale, (next) => {
    doc.locale = next
    writeBriefingDraft(doc)
    render(next, doc, step)
  })
  bindNavToggle(app, locale)
  initBriefingWizard(app, locale, (nextDoc, nextStep) => render(locale, nextDoc, nextStep))
  initTelemetry()
}

const locale = detectLocale()
const doc = createInitialBriefing(locale)
render(locale, doc, 0)
