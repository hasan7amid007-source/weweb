import {
  BOOKING_STORAGE_KEY,
  formatEur,
  hasLiveStripeCheckout,
  isBookingServiceKey,
  resolveCheckout,
  type BookingServiceKey,
} from './catalog'
import {
  calcOrderTotalEur,
  defaultPackageId,
  fromPriceEur,
  isAddonId,
  isPackageId,
  shopFor,
} from './shop-catalog'
import { type Locale, t } from '../../i18n'
import { SERVICE_IDS, SERVICE_ICONS } from '../../data/services'
import { trackEvent } from '../../lib/telemetry'

export type BookingDraft = {
  service: BookingServiceKey
  packageId: string
  addonIds: string[]
  name: string
  email: string
  phone: string
  message: string
}

type Step = 1 | 2 | 3 | 4

function serviceLabel(locale: Locale, key: BookingServiceKey): string {
  const m = t(locale)
  return key === 'general' ? m.contact.serviceGeneral : m.servicePages[key].title
}

function packageLabel(locale: Locale, service: BookingServiceKey, packageId: string): string {
  return t(locale).bookingShop.packages[service][packageId]?.title ?? packageId
}

function addonLabel(locale: Locale, service: BookingServiceKey, addonId: string): string {
  return t(locale).bookingShop.addons[service][addonId]?.title ?? addonId
}

function saveDraft(draft: BookingDraft) {
  try {
    sessionStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(draft))
  } catch {
    /* ignore */
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(BOOKING_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

function readForm(form: HTMLFormElement): BookingDraft {
  const data = new FormData(form)
  const serviceRaw = String(data.get('service') || '').trim()
  const service: BookingServiceKey = isBookingServiceKey(serviceRaw) ? serviceRaw : 'general'
  const packageRaw = String(data.get('package') || '').trim()
  const packageId = isPackageId(service, packageRaw) ? packageRaw : defaultPackageId(service)
  const addonIds = data
    .getAll('addon')
    .map((v) => String(v))
    .filter((id) => isAddonId(service, id))
  return {
    service,
    packageId,
    addonIds,
    name: String(data.get('name') || '').trim(),
    email: String(data.get('email') || '').trim(),
    phone: String(data.get('phone') || '').trim(),
    message: String(data.get('message') || '').trim(),
  }
}

function setStep(root: HTMLElement, step: Step) {
  root.dataset.step = String(step)
  root.querySelectorAll<HTMLElement>('[data-booking-step]').forEach((panel) => {
    const n = Number(panel.dataset.bookingStep)
    panel.hidden = n !== step
  })
  root.querySelectorAll<HTMLElement>('[data-booking-pill]').forEach((pill) => {
    const n = Number(pill.dataset.bookingPill)
    pill.classList.toggle('is-active', n === step)
    pill.classList.toggle('is-done', n < step)
  })
}

function renderOptionsPanel(root: HTMLElement, locale: Locale, service: BookingServiceKey) {
  const host = root.querySelector('[data-booking-options]')
  if (!host) return
  const m = t(locale)
  const shop = m.bookingShop
  const catalog = shopFor(service)
  const prevPkg = root.querySelector<HTMLInputElement>('input[name="package"]:checked')?.value
  const prevAddons = new Set(
    [...root.querySelectorAll<HTMLInputElement>('input[name="addon"]:checked')].map((el) => el.value),
  )
  const selectedPkg =
    (prevPkg && isPackageId(service, prevPkg) ? prevPkg : null) || defaultPackageId(service)

  host.innerHTML = `
    <p class="booking-step-label">${shop.packageHeading} <em>*</em></p>
    <div class="booking-option-grid" role="radiogroup" aria-label="${shop.packageHeading}">
      ${catalog.packages
        .map((pkg) => {
          const copy = shop.packages[service][pkg.id]
          const checked = pkg.id === selectedPkg
          return `
          <label class="booking-option-card">
            <input type="radio" name="package" value="${pkg.id}" required ${checked ? 'checked' : ''} />
            <span class="booking-option-card-inner">
              <span class="booking-option-top">
                <span class="booking-option-name">${copy?.title ?? pkg.id}</span>
                ${pkg.recommended ? `<span class="booking-option-badge">${shop.recommended}</span>` : ''}
                <span class="booking-option-price">${formatEur(pkg.priceEur, locale)}</span>
              </span>
              <span class="booking-option-blurb">${copy?.blurb ?? ''}</span>
            </span>
          </label>`
        })
        .join('')}
    </div>
    ${
      catalog.addons.length
        ? `
    <p class="booking-step-label booking-step-label--spaced">${shop.addonsHeading}</p>
    <p class="booking-hint">${shop.addonsHint}</p>
    <div class="booking-addon-grid" role="group" aria-label="${shop.addonsHeading}">
      ${catalog.addons
        .map((addon) => {
          const copy = shop.addons[service][addon.id]
          const checked = prevAddons.has(addon.id)
          return `
          <label class="booking-addon-card">
            <input type="checkbox" name="addon" value="${addon.id}" ${checked ? 'checked' : ''} />
            <span class="booking-addon-card-inner">
              <span class="booking-option-top">
                <span class="booking-option-name">${copy?.title ?? addon.id}</span>
                <span class="booking-option-price">+${formatEur(addon.priceEur, locale)}</span>
              </span>
              <span class="booking-option-blurb">${copy?.blurb ?? ''}</span>
            </span>
          </label>`
        })
        .join('')}
    </div>`
        : ''
    }
    <p class="booking-running-total" data-booking-total aria-live="polite"></p>
  `

  const syncTotal = () => {
    const form = root.querySelector<HTMLFormElement>('#booking-form')
    if (!form) return
    const draft = readForm(form)
    const total = calcOrderTotalEur(draft.service, draft.packageId, draft.addonIds)
    const el = root.querySelector('[data-booking-total]')
    if (el) {
      el.textContent = `${shop.runningTotal}: ${formatEur(total, locale)}`
    }
  }

  host.querySelectorAll('input[name="package"], input[name="addon"]').forEach((input) => {
    input.addEventListener('change', syncTotal)
  })
  syncTotal()
}

function renderSummary(root: HTMLElement, locale: Locale, draft: BookingDraft) {
  const m = t(locale)
  const shop = m.bookingShop
  const box = root.querySelector('[data-booking-summary]')
  if (!box) return
  const total = calcOrderTotalEur(draft.service, draft.packageId, draft.addonIds)
  const price = formatEur(total, locale)
  const addonNames = draft.addonIds.map((id) => addonLabel(locale, draft.service, id))
  box.innerHTML = `
    <h3 class="booking-summary-title">${m.contact.summaryTitle}</h3>
    <dl class="booking-summary-list">
      <div><dt>${m.contact.serviceLabel}</dt><dd>${serviceLabel(locale, draft.service)}</dd></div>
      <div><dt>${shop.packageLabel}</dt><dd>${packageLabel(locale, draft.service, draft.packageId)}</dd></div>
      ${
        addonNames.length
          ? `<div><dt>${shop.addonsSummary}</dt><dd>${addonNames.join(', ')}</dd></div>`
          : ''
      }
      <div><dt>${m.contact.nameLabel}</dt><dd>${draft.name}</dd></div>
      <div><dt>${m.contact.emailLabel}</dt><dd>${draft.email}</dd></div>
      ${draft.phone ? `<div><dt>${m.contact.phoneLabel}</dt><dd>${draft.phone}</dd></div>` : ''}
      <div class="booking-summary-pay">
        <dt>${m.contact.depositLabel}</dt>
        <dd><strong>${price}</strong></dd>
      </div>
    </dl>
    <p class="booking-hint">${m.contact.depositHint}</p>
  `
}

function showSuccess(root: HTMLElement, show: boolean, bodyText?: string) {
  const form = root.querySelector<HTMLElement>('[data-booking-flow]')
  const success = root.querySelector<HTMLElement>('[data-booking-success]')
  if (form) form.hidden = show
  if (success) {
    success.hidden = !show
    if (show && bodyText) {
      const p = success.querySelector('p')
      if (p) p.textContent = bodyText
    }
  }
}

export function renderBookingFormMarkup(locale: Locale): string {
  const m = t(locale)
  const shop = m.bookingShop
  const serviceCards = [
    {
      id: 'general' as const,
      title: m.contact.serviceGeneral,
      icon: '/page/icon-web.svg',
      price: fromPriceEur('general'),
    },
    ...SERVICE_IDS.map((id) => ({
      id,
      title: m.servicePages[id].title,
      icon: SERVICE_ICONS[id],
      price: fromPriceEur(id),
    })),
  ]

  return `
    <div class="booking-wizard" data-booking-root>
      <ol class="booking-steps" aria-label="${m.contact.title}">
        <li class="booking-pill is-active" data-booking-pill="1">${m.contact.stepService}</li>
        <li class="booking-pill" data-booking-pill="2">${m.contact.stepOptions}</li>
        <li class="booking-pill" data-booking-pill="3">${m.contact.stepDetails}</li>
        <li class="booking-pill" data-booking-pill="4">${m.contact.stepPay}</li>
      </ol>

      <div data-booking-success hidden class="booking-success">
        <h3>${m.contact.successTitle}</h3>
        <p>${m.contact.successBody}</p>
        <span class="glowborder">
          <button type="button" class="ts-btn pink solid" data-booking-again>${m.contact.successAgain}</button>
        </span>
      </div>

      <form class="contact-form booking-form" id="booking-form" data-booking-flow novalidate>
        <div data-booking-step="1">
          <p class="booking-step-label">${m.contact.serviceLabel} <em>*</em></p>
          <div class="booking-service-grid" role="radiogroup" aria-label="${m.contact.serviceLabel}">
            ${serviceCards
              .map(
                (card) => `
              <label class="booking-service-card">
                <input type="radio" name="service" value="${card.id}" required />
                <span class="booking-service-card-inner">
                  <img src="${card.icon}" width="28" height="28" alt="" />
                  <span class="booking-service-name">${card.title}</span>
                  <span class="booking-service-price">${shop.fromLabel} ${formatEur(card.price, locale)}</span>
                </span>
              </label>`,
              )
              .join('')}
          </div>
          <div class="booking-nav">
            <span class="glowborder">
              <button type="button" class="ts-btn pink solid" data-booking-next>${m.contact.next}</button>
            </span>
          </div>
        </div>

        <div data-booking-step="2" hidden>
          <div data-booking-options></div>
          <div class="booking-nav">
            <button type="button" class="booking-back" data-booking-back>${m.contact.back}</button>
            <span class="glowborder">
              <button type="button" class="ts-btn pink solid" data-booking-next>${m.contact.next}</button>
            </span>
          </div>
        </div>

        <div data-booking-step="3" hidden>
          <label class="contact-field">
            <span>${m.contact.nameLabel} <em>*</em></span>
            <input type="text" name="name" required autocomplete="name" />
          </label>
          <label class="contact-field">
            <span>${m.contact.emailLabel} <em>*</em></span>
            <input type="email" name="email" required autocomplete="email" />
          </label>
          <label class="contact-field">
            <span>${m.contact.phoneLabel}</span>
            <input type="tel" name="phone" autocomplete="tel" />
          </label>
          <label class="contact-field">
            <span>${m.contact.messageLabel}</span>
            <textarea name="message" rows="3"></textarea>
          </label>
          <div class="booking-nav">
            <button type="button" class="booking-back" data-booking-back>${m.contact.back}</button>
            <span class="glowborder">
              <button type="button" class="ts-btn pink solid" data-booking-next>${m.contact.cta}</button>
            </span>
          </div>
        </div>

        <div data-booking-step="4" hidden>
          <div data-booking-summary class="booking-summary"></div>
          <p class="booking-secure" data-booking-secure>${m.contact.paySecure}</p>
          <p class="booking-hint" data-booking-demo-note hidden>${m.contact.demoPayNote}</p>
          <p class="booking-error" data-booking-error hidden></p>
          <div class="booking-nav">
            <button type="button" class="booking-back" data-booking-back>${m.contact.back}</button>
            <span class="glowborder">
              <button type="submit" class="ts-btn pink solid" data-booking-pay>${m.contact.payCta}</button>
            </span>
          </div>
        </div>
      </form>
    </div>
  `
}

export function initBookingWizard(root: ParentNode, locale: Locale) {
  const wizard = root.querySelector<HTMLElement>('[data-booking-root]')
  const form = root.querySelector<HTMLFormElement>('#booking-form')
  if (!wizard || !form) return

  const m = t(locale)

  const params = new URLSearchParams(location.search)
  const paid = params.get('booking') === 'success' || params.get('paid') === '1'
  if (paid) {
    showSuccess(
      wizard,
      true,
      hasLiveStripeCheckout() ? undefined : m.contact.successBodyDemo,
    )
    trackEvent('booking_success_view', {
      locale,
      mode: hasLiveStripeCheckout() ? 'stripe' : 'demo',
    })
    clearDraft()
  }

  const wanted = params.get('service')
  if (wanted && isBookingServiceKey(wanted)) {
    const radio = form.querySelector<HTMLInputElement>(`input[name="service"][value="${wanted}"]`)
    if (radio) radio.checked = true
  }

  let step: Step = 1
  setStep(wizard, step)

  const go = (next: Step) => {
    step = next
    setStep(wizard, step)
    const draft = readForm(form)
    trackEvent('booking_step_view', {
      step,
      locale,
      service: draft.service || undefined,
      package: draft.packageId || undefined,
    })
    if (step === 2) {
      renderOptionsPanel(wizard, locale, draft.service)
    }
    if (step === 4) {
      saveDraft(draft)
      renderSummary(wizard, locale, draft)
      const checkout = resolveCheckout(draft.service, draft.email)
      const demoNote = wizard.querySelector<HTMLElement>('[data-booking-demo-note]')
      const secure = wizard.querySelector<HTMLElement>('[data-booking-secure]')
      if (demoNote) demoNote.hidden = checkout.mode !== 'demo'
      if (secure) {
        secure.textContent =
          checkout.mode === 'demo' ? m.contact.paySecureDemo : m.contact.paySecure
      }
    }
  }

  if (!paid) trackEvent('booking_step_view', { step: 1, locale })

  wizard.querySelector('[data-booking-again]')?.addEventListener('click', () => {
    clearDraft()
    form.reset()
    showSuccess(wizard, false)
    go(1)
    const url = new URL(location.href)
    url.searchParams.delete('booking')
    url.searchParams.delete('paid')
    history.replaceState(null, '', `${url.pathname}${url.search}#booking`)
  })

  wizard.querySelectorAll('[data-booking-next]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (step === 1) {
        const service = form.querySelector<HTMLInputElement>('input[name="service"]:checked')
        if (!service) {
          form.reportValidity()
          return
        }
        trackEvent('booking_service_selected', { service: service.value, locale })
        go(2)
        return
      }
      if (step === 2) {
        const pkg = form.querySelector<HTMLInputElement>('input[name="package"]:checked')
        if (!pkg) {
          form.reportValidity()
          return
        }
        const draft = readForm(form)
        trackEvent('booking_options_selected', {
          service: draft.service,
          package: draft.packageId,
          addons: draft.addonIds.join('|') || 'none',
          locale,
        })
        go(3)
        return
      }
      if (step === 3) {
        const name = form.querySelector<HTMLInputElement>('input[name="name"]')
        const email = form.querySelector<HTMLInputElement>('input[name="email"]')
        if (!name?.value.trim() || !email?.value.trim()) {
          form.reportValidity()
          return
        }
        go(4)
      }
    })
  })

  wizard.querySelectorAll('[data-booking-back]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (step === 4) go(3)
      else if (step === 3) go(2)
      else if (step === 2) go(1)
    })
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const draft = readForm(form)
    if (!draft.service || !draft.name || !draft.email || !draft.packageId) return

    saveDraft(draft)
    const payBtn = form.querySelector<HTMLButtonElement>('[data-booking-pay]')
    const err = wizard.querySelector<HTMLElement>('[data-booking-error]')
    if (err) {
      err.hidden = true
      err.textContent = ''
    }
    if (payBtn) {
      payBtn.disabled = true
      payBtn.textContent = m.contact.payProcessing
    }

    const total = calcOrderTotalEur(draft.service, draft.packageId, draft.addonIds)
    const checkout = resolveCheckout(draft.service, draft.email)

    if (checkout.mode === 'stripe') {
      trackEvent('booking_checkout_stripe', {
        service: draft.service,
        package: draft.packageId,
        total,
        locale,
      })
      window.location.href = checkout.url
      return
    }

    if (checkout.mode === 'demo') {
      trackEvent('booking_checkout_demo', {
        service: draft.service,
        package: draft.packageId,
        addons: draft.addonIds.join('|') || 'none',
        total,
        locale,
      })
      await new Promise((r) => setTimeout(r, 900))
      clearDraft()
      const url = new URL(location.href)
      url.searchParams.set('booking', 'success')
      history.replaceState(null, '', `${url.pathname}?${url.searchParams.toString()}#booking`)
      showSuccess(wizard, true, m.contact.successBodyDemo)
      trackEvent('booking_success_view', {
        locale,
        mode: 'demo',
        service: draft.service,
        package: draft.packageId,
        total,
      })
      if (payBtn) {
        payBtn.disabled = false
        payBtn.textContent = m.contact.payCta
      }
      return
    }

    if (err) {
      err.hidden = false
      err.textContent = m.contact.payUnavailable
    }
    if (payBtn) {
      payBtn.disabled = false
      payBtn.textContent = m.contact.payCta
    }
  })
}
