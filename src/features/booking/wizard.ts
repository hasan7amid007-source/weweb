import {
  BOOKING_DEPOSITS_EUR,
  BOOKING_STORAGE_KEY,
  formatEur,
  isBookingServiceKey,
  resolveCheckout,
  type BookingServiceKey,
} from './catalog'
import { type Locale, t } from '../../i18n'
import { SERVICE_IDS, SERVICE_ICONS } from '../../data/services'

export type BookingDraft = {
  service: BookingServiceKey
  name: string
  email: string
  phone: string
  message: string
}

type Step = 1 | 2 | 3

function serviceLabel(locale: Locale, key: BookingServiceKey): string {
  const m = t(locale)
  return key === 'general' ? m.contact.serviceGeneral : m.servicePages[key].title
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
  const service = String(data.get('service') || '').trim()
  return {
    service: isBookingServiceKey(service) ? service : 'general',
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

function renderSummary(root: HTMLElement, locale: Locale, draft: BookingDraft) {
  const m = t(locale)
  const box = root.querySelector('[data-booking-summary]')
  if (!box) return
  const amount = BOOKING_DEPOSITS_EUR[draft.service]
  const price = formatEur(amount, locale)
  box.innerHTML = `
    <h3 class="booking-summary-title">${m.contact.summaryTitle}</h3>
    <dl class="booking-summary-list">
      <div><dt>${m.contact.serviceLabel}</dt><dd>${serviceLabel(locale, draft.service)}</dd></div>
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

function showSuccess(root: HTMLElement, show: boolean) {
  const form = root.querySelector<HTMLElement>('[data-booking-flow]')
  const success = root.querySelector<HTMLElement>('[data-booking-success]')
  if (form) form.hidden = show
  if (success) success.hidden = !show
}

export function renderBookingFormMarkup(locale: Locale): string {
  const m = t(locale)
  const serviceCards = [
    {
      id: 'general' as const,
      title: m.contact.serviceGeneral,
      icon: '/page/icon-web.svg',
      price: BOOKING_DEPOSITS_EUR.general,
    },
    ...SERVICE_IDS.map((id) => ({
      id,
      title: m.servicePages[id].title,
      icon: SERVICE_ICONS[id],
      price: BOOKING_DEPOSITS_EUR[id],
    })),
  ]

  return `
    <div class="booking-wizard" data-booking-root>
      <ol class="booking-steps" aria-label="${m.contact.title}">
        <li class="booking-pill is-active" data-booking-pill="1">${m.contact.stepService}</li>
        <li class="booking-pill" data-booking-pill="2">${m.contact.stepDetails}</li>
        <li class="booking-pill" data-booking-pill="3">${m.contact.stepPay}</li>
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
                  <span class="booking-service-price">${formatEur(card.price, locale)}</span>
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

        <div data-booking-step="3" hidden>
          <div data-booking-summary class="booking-summary"></div>
          <p class="booking-secure">${m.contact.paySecure}</p>
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
    showSuccess(wizard, true)
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
    if (step === 3) {
      const draft = readForm(form)
      saveDraft(draft)
      renderSummary(wizard, locale, draft)
      const checkout = resolveCheckout(draft.service, draft.email)
      const demoNote = wizard.querySelector<HTMLElement>('[data-booking-demo-note]')
      if (demoNote) demoNote.hidden = checkout.mode !== 'demo'
    }
  }

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
        go(2)
        return
      }
      if (step === 2) {
        const name = form.querySelector<HTMLInputElement>('input[name="name"]')
        const email = form.querySelector<HTMLInputElement>('input[name="email"]')
        if (!name?.value.trim() || !email?.value.trim()) {
          form.reportValidity()
          return
        }
        go(3)
      }
    })
  })

  wizard.querySelectorAll('[data-booking-back]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (step === 3) go(2)
      else if (step === 2) go(1)
    })
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const draft = readForm(form)
    if (!draft.service || !draft.name || !draft.email) return

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

    const checkout = resolveCheckout(draft.service, draft.email)

    if (checkout.mode === 'stripe') {
      window.location.href = checkout.url
      return
    }

    if (checkout.mode === 'demo') {
      await new Promise((r) => setTimeout(r, 900))
      clearDraft()
      const url = new URL(location.href)
      url.searchParams.set('booking', 'success')
      history.replaceState(null, '', `${url.pathname}?${url.searchParams.toString()}#booking`)
      showSuccess(wizard, true)
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
