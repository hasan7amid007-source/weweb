import './styles/site.css'
import './styles/effects.css'
import { formatEur, isBookingServiceKey, ORDER_BRIEFING_KEY } from './features/booking/catalog'
import { initTelemetry, trackEvent } from './lib/telemetry'
import { bindLangSwitch, bindNavToggle, renderFooter, renderHeader } from './features/shell'
import { detectLocale, setLocale, t, type Locale } from './i18n'

const root = document.querySelector<HTMLDivElement>('#app')
if (!root) throw new Error('#app not found')
const app = root

type OrderLineView = {
  service: string
  packageId: string
  addonIds: string[]
}

type OrderView = {
  demo: boolean
  sessionId: string
  orderId: string
  service: string
  packageId: string
  addons: string[]
  items: OrderLineView[]
  total: string
  email: string
  name: string
}

function parseItemsParam(raw: string): OrderLineView[] {
  return raw
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [service = '', packageId = '', addonRaw = ''] = part.split(':')
      return {
        service: service.trim(),
        packageId: packageId.trim(),
        addonIds: addonRaw
          .split('+')
          .map((s) => s.trim())
          .filter(Boolean),
      }
    })
    .filter((line) => line.service && line.packageId)
}

function readOrder(): OrderView {
  const p = new URLSearchParams(location.search)
  const service = (p.get('service') || '').trim()
  const packageId = (p.get('package') || '').trim()
  const addons = (p.get('addons') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const items = parseItemsParam(p.get('items') || '')
  return {
    demo: p.get('demo') === '1' || (!p.get('session_id') && !!p.get('order')),
    sessionId: (p.get('session_id') || '').trim(),
    orderId: (p.get('order') || p.get('session_id') || '').trim(),
    service,
    packageId,
    addons,
    items:
      items.length > 0
        ? items
        : service && packageId
          ? [{ service, packageId, addonIds: addons }]
          : [],
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

function addonLabels(locale: Locale, service: string, addonIds: string[]): string {
  if (!addonIds.length) return ''
  if (!isBookingServiceKey(service)) return addonIds.join(', ')
  return addonIds
    .map((id) => t(locale).bookingShop.addons[service][id]?.title ?? id)
    .join(', ')
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
            order.addons.length
              ? `<div><dt>${o.addonsLabel}</dt><dd>${addonLabels(locale, order.service, order.addons) || order.addons.join(', ')}</dd></div>`
              : ''
          }
          ${
            order.items.length > 1
              ? `<div><dt>${o.itemsLabel}</dt><dd><ul class="order-items">${order.items
                  .map((line) => {
                    const extras = addonLabels(locale, line.service, line.addonIds)
                    return `<li>${serviceLabel(locale, line.service)} · ${packageLabel(locale, line.service, line.packageId)}${extras ? ` (+ ${extras})` : ''}</li>`
                  })
                  .join('')}</ul></dd></div>`
              : ''
          }
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

        <section class="shop-quote" id="portal">
          <h2>${o.portalTitle}</h2>
          <p class="lead">${o.portalLead}</p>
          <form class="contact-form shop-quote-form" data-order-portal novalidate>
            <label class="contact-field">
              <span>${o.portalEmail} <em>*</em></span>
              <input type="email" name="email" required autocomplete="email" value="${order.email.replace(/"/g, '&quot;')}" />
            </label>
            <p class="booking-error" data-portal-error hidden></p>
            <span class="glowborder">
              <button type="submit" class="ts-btn pink solid" data-portal-submit>${o.portalCta}</button>
            </span>
          </form>
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

  const portalForm = app.querySelector<HTMLFormElement>('[data-order-portal]')
  portalForm?.addEventListener('submit', async (event) => {
    event.preventDefault()
    const data = new FormData(portalForm)
    const email = String(data.get('email') || '').trim()
    const err = app.querySelector<HTMLElement>('[data-portal-error]')
    const submit = app.querySelector<HTMLButtonElement>('[data-portal-submit]')
    if (!email.includes('@')) {
      portalForm.reportValidity()
      return
    }
    if (err) {
      err.hidden = true
      err.textContent = ''
    }
    if (submit) {
      submit.disabled = true
      submit.textContent = o.portalProcessing
    }
    try {
      const res = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          returnUrl: `${window.location.origin}/order.html`,
        }),
      })
      const payload = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok || !payload.url) {
        if (err) {
          err.hidden = false
          err.textContent =
            res.status === 503
              ? o.portalUnavailable
              : payload.error || o.portalError
        }
        if (submit) {
          submit.disabled = false
          submit.textContent = o.portalCta
        }
        return
      }
      trackEvent('order_portal_open', { locale, demo: order.demo })
      window.location.href = payload.url
    } catch {
      if (err) {
        err.hidden = false
        err.textContent = o.portalError
      }
      if (submit) {
        submit.disabled = false
        submit.textContent = o.portalCta
      }
    }
  })

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
    const itemsSummary =
      order.items.length > 0
        ? order.items.map((line) => {
            const extras = line.addonIds.length ? ` (+${line.addonIds.join('+')})` : ''
            return `${line.service}:${line.packageId}${extras}`
          })
        : []
    const payload = {
      orderId: order.orderId || order.sessionId,
      service: order.service,
      packageId: order.packageId,
      addons: order.addons,
      items: order.items,
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
      itemsSummary.length
        ? `Items:\n${itemsSummary.map((line) => `- ${line}`).join('\n')}`
        : [
            `Service: ${payload.service || '—'}`,
            `Package: ${payload.packageId || '—'}`,
            `Addons: ${payload.addons.join(', ') || 'none'}`,
          ].join('\n'),
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
