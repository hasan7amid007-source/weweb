import './styles/site.css'
import './styles/effects.css'
import { formatEur, isBookingServiceKey, ORDER_BRIEFING_KEY } from './features/booking/catalog'
import { initTelemetry, trackEvent } from './lib/telemetry'
import { bindLangSwitch, bindNavToggle, renderFooter, renderHeader } from './features/shell'
import { detectLocale, setLocale, t, type Locale } from './i18n'

const root = document.querySelector<HTMLDivElement>('#app')
if (!root) throw new Error('#app not found')
const app = root

type OrderView = {
  demo: boolean
  sessionId: string
  orderId: string
  service: string
  packageId: string
  addons: string[]
  total: string
  email: string
  name: string
}

function readOrder(): OrderView {
  const p = new URLSearchParams(location.search)
  return {
    demo: p.get('demo') === '1' || (!p.get('session_id') && !!p.get('order')),
    sessionId: (p.get('session_id') || '').trim(),
    orderId: (p.get('order') || p.get('session_id') || '').trim(),
    service: (p.get('service') || '').trim(),
    packageId: (p.get('package') || '').trim(),
    addons: (p.get('addons') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    total: (p.get('total') || '').trim(),
    email: (p.get('email') || '').trim(),
    name: (p.get('name') || '').trim(),
  }
}

function serviceLabel(locale: Locale, service: string): string {
  if (isBookingServiceKey(service)) {
    return service === 'general'
      ? t(locale).contact.serviceGeneral
      : t(locale).servicePages[service].title
  }
  return service || '—'
}

function packageLabel(locale: Locale, service: string, packageId: string): string {
  if (isBookingServiceKey(service) && packageId) {
    return t(locale).bookingShop.packages[service][packageId]?.title ?? packageId
  }
  return packageId || '—'
}

function render(locale: Locale) {
  setLocale(locale)
  const m = t(locale)
  const o = m.orderPage
  const order = readOrder()
  document.documentElement.lang = locale === 'ar' ? 'ar' : locale
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  document.title = o.metaTitle

  const hasMeta = !!(order.service || order.packageId || order.orderId || order.sessionId)
  const totalText =
    order.total && /^\d+$/.test(order.total)
      ? formatEur(Number(order.total), locale)
      : order.total || '—'

  app.innerHTML = `
    ${renderHeader(locale, 'shop')}
    <main id="main" class="order-page">
      <div class="wrap order-wrap">
        <p class="shop-eyebrow">${order.demo ? 'Demo' : 'BDITEC'}</p>
        <h1>${order.demo ? o.titleDemo : o.titlePaid}</h1>
        <p class="lead">${order.demo ? o.leadDemo : o.leadPaid}</p>
        ${!hasMeta ? `<p class="shop-note shop-note--warn">${o.missingStatus}</p>` : ''}

        <dl class="order-meta">
          ${
            order.orderId || order.sessionId
              ? `<div><dt>${o.orderLabel}</dt><dd>${order.orderId || order.sessionId}</dd></div>`
              : ''
          }
          <div><dt>${o.serviceLabel}</dt><dd>${serviceLabel(locale, order.service)}</dd></div>
          <div><dt>${o.packageLabel}</dt><dd>${packageLabel(locale, order.service, order.packageId)}</dd></div>
          ${
            order.total
              ? `<div><dt>${o.totalLabel}</dt><dd>${totalText}</dd></div>`
              : ''
          }
        </dl>

        <section class="order-next">
          <h2>${o.nextTitle}</h2>
          <p>${o.nextBody}</p>
        </section>

        <section class="shop-quote" id="briefing">
          <h2>${o.briefingTitle}</h2>
          <p class="lead">${o.briefingLead}</p>
          <form class="contact-form shop-quote-form" data-order-briefing novalidate>
            <label class="contact-field">
              <span>${o.goalsLabel} <em>*</em></span>
              <textarea name="goals" rows="3" required></textarea>
            </label>
            <label class="contact-field">
              <span>${o.assetsLabel}</span>
              <textarea name="assets" rows="2"></textarea>
            </label>
            <label class="contact-field">
              <span>${o.accessLabel}</span>
              <textarea name="access" rows="2"></textarea>
            </label>
            <label class="contact-field">
              <span>${o.notesLabel}</span>
              <textarea name="notes" rows="2"></textarea>
            </label>
            <p class="booking-hint">${o.submitHint}</p>
            <p class="shop-quote-ok" data-briefing-ok hidden>${o.submitOk}</p>
            <span class="glowborder">
              <button type="submit" class="ts-btn pink solid">${o.submit}</button>
            </span>
          </form>
        </section>

        <div class="order-actions">
          <a class="shop-secondary-cta" href="/shop.html">${o.shopCta}</a>
          <a class="shop-secondary-cta" href="/">${o.homeCta}</a>
        </div>
      </div>
    </main>
    ${renderFooter(locale, 'shop')}
  `

  bindLangSwitch(app, locale, (next) => render(next))
  bindNavToggle(app, locale)

  const form = app.querySelector<HTMLFormElement>('[data-order-briefing]')
  form?.addEventListener('submit', (event) => {
    event.preventDefault()
    const data = new FormData(form)
    const goals = String(data.get('goals') || '').trim()
    if (!goals) {
      form.reportValidity()
      return
    }
    const assets = String(data.get('assets') || '').trim()
    const access = String(data.get('access') || '').trim()
    const notes = String(data.get('notes') || '').trim()
    const payload = {
      orderId: order.orderId || order.sessionId,
      service: order.service,
      packageId: order.packageId,
      addons: order.addons,
      email: order.email,
      name: order.name,
      demo: order.demo,
      goals,
      assets,
      access,
      notes,
      at: new Date().toISOString(),
    }
    try {
      sessionStorage.setItem(ORDER_BRIEFING_KEY, JSON.stringify(payload))
    } catch {
      /* ignore */
    }
    const body = [
      `BDITEC order briefing`,
      `Reference: ${payload.orderId || '—'}`,
      `Demo: ${payload.demo ? 'yes' : 'no'}`,
      `Name: ${payload.name || '—'}`,
      `Email: ${payload.email || '—'}`,
      `Service: ${payload.service || '—'}`,
      `Package: ${payload.packageId || '—'}`,
      `Addons: ${payload.addons.join(', ') || 'none'}`,
      '',
      `Goals:`,
      goals,
      '',
      assets ? `Assets:\n${assets}\n` : '',
      access ? `Access:\n${access}\n` : '',
      notes ? `Notes:\n${notes}` : '',
    ]
      .filter(Boolean)
      .join('\n')
    const subject = encodeURIComponent(
      `BDITEC briefing — ${payload.service || 'order'} / ${payload.packageId || payload.orderId || 'n/a'}`,
    )
    trackEvent('order_briefing_mailto', {
      locale,
      demo: order.demo,
      service: order.service || 'none',
      package: order.packageId || 'none',
    })
    window.location.href = `mailto:info@bditec.com?subject=${subject}&body=${encodeURIComponent(body)}`
    const ok = app.querySelector<HTMLElement>('[data-briefing-ok]')
    if (ok) ok.hidden = false
  })

  trackEvent('order_page_view', {
    locale,
    demo: order.demo,
    service: order.service || 'none',
    package: order.packageId || 'none',
  })
  initTelemetry()
}

render(detectLocale())
