import {
  BOOKING_STORAGE_KEY,
  formatEur,
  isBookingServiceKey,
  type BookingServiceKey,
} from './catalog'
import { startCheckout } from './checkout-client'
import {
  calcOrderTotalEur,
  defaultPackageId,
  fromPriceEur,
  isAddonId,
  isPackageId,
  shopFor,
  type PurchaseMode,
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

function packageMode(service: BookingServiceKey, packageId: string): PurchaseMode {
  return shopFor(service).packages.find((p) => p.id === packageId)?.purchaseMode ?? 'checkout'
}

function renderOptionsPanel(root: HTMLElement, locale: Locale, service: BookingServiceKey) {
  const host = root.querySelector('[data-booking-options]')
  if (!host) return
  const m = t(locale)
  const shop = m.bookingShop
  const page = m.shopPage
  const catalog = shopFor(service)
  const payable = catalog.packages.filter((pkg) => pkg.purchaseMode !== 'quote')
  const quoteOnly = catalog.packages.filter((pkg) => pkg.purchaseMode === 'quote')
  const prevPkg = root.querySelector<HTMLInputElement>('input[name="package"]:checked')?.value
  const prevAddons = new Set(
    [...root.querySelectorAll<HTMLInputElement>('input[name="addon"]:checked')].map((el) => el.value),
  )
  const selectedPkg =
    (prevPkg && payable.some((p) => p.id === prevPkg) ? prevPkg : null) || defaultPackageId(service)
  const selectedMode = packageMode(service, selectedPkg)
  const allowAddons = selectedMode === 'checkout' && catalog.addons.length > 0

  host.innerHTML = `
    <p class="booking-step-label">${shop.packageHeading} <em>*</em></p>
    <div class="booking-option-grid" role="radiogroup" aria-label="${shop.packageHeading}">
      ${payable
        .map((pkg) => {
          const copy = shop.packages[service][pkg.id]
          const checked = pkg.id === selectedPkg
          const period = pkg.purchaseMode === 'subscription' ? page.monthSuffix : ''
          return `
          <label class="booking-option-card">
            <input type="radio" name="package" value="${pkg.id}" required ${checked ? 'checked' : ''} />
            <span class="booking-option-card-inner">
              <span class="booking-option-top">
                <span class="booking-option-name">${copy?.title ?? pkg.id}</span>
                <span class="booking-option-badge">${page.modeBadge[pkg.purchaseMode]}</span>
                ${pkg.recommended ? `<span class="booking-option-badge">${shop.recommended}</span>` : ''}
                <span class="booking-option-price">${formatEur(pkg.priceEur, locale)}${period ? ` ${period}` : ''}</span>
              </span>
              <span class="booking-option-blurb">${copy?.blurb ?? ''}</span>
            </span>
          </label>`
        })
        .join('')}
    </div>
    ${
      quoteOnly.length
        ? `
    <p class="booking-step-label booking-step-label--spaced">${m.contact.quotePackagesHeading}</p>
    <ul class="booking-quote-list">
      ${quoteOnly
        .map((pkg) => {
          const copy = shop.packages[service][pkg.id]
          const subject = encodeURIComponent(`BDITEC Angebot — ${service} / ${pkg.id}`)
          const body = encodeURIComponent(
            `Service: ${service}\nPaket: ${copy?.title ?? pkg.id}\nRichtwert: ${formatEur(pkg.priceEur, locale)}\n\nKurzbeschreibung:\n`,
          )
          return `<li>
            <span>${copy?.title ?? pkg.id} · ${page.priceKindQuote} ${formatEur(pkg.priceEur, locale)}</span>
            <a class="booking-quote-link" href="mailto:info@bditec.com?subject=${subject}&body=${body}">${m.contact.quotePackageCta}</a>
          </li>`
        })
        .join('')}
    </ul>`
        : ''
    }
    ${
      allowAddons
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
        : selectedMode === 'subscription'
          ? `<p class="booking-hint booking-step-label--spaced">${m.contact.monthlyHint}</p>`
          : ''
    }
    <p class="booking-running-total" data-booking-total aria-live="polite"></p>
  `

  const syncTotal = () => {
    const form = root.querySelector<HTMLFormElement>('#booking-form')
    if (!form) return
    const draft = readForm(form)
    const mode = packageMode(draft.service, draft.packageId)
    const pkg = shopFor(draft.service).packages.find((p) => p.id === draft.packageId)
    const packageEur = pkg?.priceEur ?? 0
    const addonEur = calcOrderTotalEur(draft.service, draft.packageId, draft.addonIds) - packageEur
    const el = root.querySelector('[data-booking-total]')
    if (!el) return
    if (mode === 'subscription') {
      el.textContent = `${page.priceKindSubscription}: ${formatEur(packageEur, locale)}${page.monthSuffix}`
      return
    }
    const total = packageEur + Math.max(0, addonEur)
    el.textContent = `${shop.runningTotal}: ${formatEur(total, locale)}`
  }

  const onPackageChange = () => {
    const form = root.querySelector<HTMLFormElement>('#booking-form')
    if (!form) return
    const draft = readForm(form)
    if (packageMode(draft.service, draft.packageId) !== 'checkout') {
      form.querySelectorAll<HTMLInputElement>('input[name="addon"]').forEach((input) => {
        input.checked = false
      })
    }
    renderOptionsPanel(root, locale, service)
  }

  host.querySelectorAll('input[name="package"]').forEach((input) => {
    input.addEventListener('change', onPackageChange)
  })
  host.querySelectorAll('input[name="addon"]').forEach((input) => {
    input.addEventListener('change', syncTotal)
  })
  syncTotal()
}

function renderSummary(root: HTMLElement, locale: Locale, draft: BookingDraft) {
  const m = t(locale)
  const shop = m.bookingShop
  const page = m.shopPage
  const box = root.querySelector('[data-booking-summary]')
  if (!box) return
  const mode = packageMode(draft.service, draft.packageId)
  const pkg = shopFor(draft.service).packages.find((p) => p.id === draft.packageId)
  const packageEur = pkg?.priceEur ?? 0
  const addonEur = Math.max(
    0,
    calcOrderTotalEur(draft.service, draft.packageId, draft.addonIds) - packageEur,
  )
  const addonNames = draft.addonIds.map((id) => addonLabel(locale, draft.service, id))
  const payLabel = mode === 'subscription' ? m.contact.monthlyLabel : m.contact.depositLabel
  const payHint = mode === 'subscription' ? m.contact.monthlyHint : m.contact.depositHint
  const payValue =
    mode === 'subscription'
      ? `${formatEur(packageEur, locale)}${page.monthSuffix}`
      : formatEur(packageEur + addonEur, locale)
  box.innerHTML = `
    <h3 class="booking-summary-title">${m.contact.summaryTitle}</h3>
    <dl class="booking-summary-list">
      <div><dt>${m.contact.serviceLabel}</dt><dd>${serviceLabel(locale, draft.service)}</dd></div>
      <div><dt>${shop.packageLabel}</dt><dd>${packageLabel(locale, draft.service, draft.packageId)} · ${page.modeBadge[mode]}</dd></div>
      ${
        addonNames.length && mode === 'checkout'
          ? `<div><dt>${m.contact.extrasOnceLabel}</dt><dd>${addonNames.join(', ')} (+${formatEur(addonEur, locale)})</dd></div>`
          : ''
      }
      <div><dt>${m.contact.nameLabel}</dt><dd>${draft.name}</dd></div>
      <div><dt>${m.contact.emailLabel}</dt><dd>${draft.email}</dd></div>
      ${draft.phone ? `<div><dt>${m.contact.phoneLabel}</dt><dd>${draft.phone}</dd></div>` : ''}
      <div class="booking-summary-pay">
        <dt>${payLabel}</dt>
        <dd><strong>${payValue}</strong></dd>
      </div>
    </dl>
    <p class="booking-hint">${payHint}</p>
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
            <input type="text" name="name" required autocomplete="name" maxlength="120" />
          </label>
          <label class="contact-field">
            <span>${m.contact.emailLabel} <em>*</em></span>
            <input type="email" name="email" required autocomplete="email" maxlength="254" />
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
    const wasDemo = params.get('demo') === '1' || (!params.get('session_id') && params.get('paid') === '1')
    showSuccess(wizard, true, wasDemo ? m.contact.successBodyDemo : undefined)
    trackEvent('booking_success_view', {
      locale,
      mode: wasDemo ? 'demo' : 'stripe',
    })
    clearDraft()
  }

  const wanted = params.get('service')
  const wantedPackage = params.get('package') || ''
  const wantedAddons = (params.get('addons') || '')
    .split(/[,+]/)
    .map((id) => id.trim())
    .filter(Boolean)
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
      // Mode is owned by /api/create-checkout (sk_test_/sk_live_ → Stripe, else demo).
      // Do not infer live from client Payment Links.
      const demoNote = wizard.querySelector<HTMLElement>('[data-booking-demo-note]')
      const secure = wizard.querySelector<HTMLElement>('[data-booking-secure]')
      if (demoNote) demoNote.hidden = false
      if (secure) secure.textContent = m.contact.paySecurePending
    }
  }

  if (!paid) trackEvent('booking_step_view', { step: 1, locale })

  // Deep-link from /shop: ?service=&package=&addons=#booking → options + extras preselected
  if (!paid && wanted && isBookingServiceKey(wanted)) {
    const serviceRadio = form.querySelector<HTMLInputElement>(
      `input[name="service"][value="${wanted}"]`,
    )
    if (serviceRadio?.checked) {
      go(2)
      if (wantedPackage && isPackageId(wanted, wantedPackage)) {
        const pkgRadio = form.querySelector<HTMLInputElement>(
          `input[name="package"][value="${wantedPackage}"]`,
        )
        if (pkgRadio) {
          pkgRadio.checked = true
          pkgRadio.dispatchEvent(new Event('change', { bubbles: true }))
        }
      }
      const addonIds = wantedAddons.filter((id) => isAddonId(wanted, id))
      for (const id of addonIds) {
        const addonInput = form.querySelector<HTMLInputElement>(
          `input[name="addon"][value="${id}"]`,
        )
        if (addonInput) {
          addonInput.checked = true
          addonInput.dispatchEvent(new Event('change', { bubbles: true }))
        }
      }
      trackEvent('booking_shop_deeplink', {
        service: wanted,
        package: wantedPackage || 'none',
        addons: addonIds.join('|') || 'none',
        locale,
      })
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
        if (packageMode(draft.service, draft.packageId) === 'quote') {
          form.reportValidity()
          return
        }
        const mode = packageMode(draft.service, draft.packageId)
        const addonIds = mode === 'checkout' ? draft.addonIds : []
        if (mode !== 'checkout') {
          form.querySelectorAll<HTMLInputElement>('input[name="addon"]').forEach((input) => {
            input.checked = false
          })
        }
        trackEvent('booking_options_selected', {
          service: draft.service,
          package: draft.packageId,
          addons: addonIds.join('|') || 'none',
          mode,
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

    const mode = packageMode(draft.service, draft.packageId)
    const payBtn = form.querySelector<HTMLButtonElement>('[data-booking-pay]')
    const err = wizard.querySelector<HTMLElement>('[data-booking-error]')
    const secure = wizard.querySelector<HTMLElement>('[data-booking-secure]')
    const demoNote = wizard.querySelector<HTMLElement>('[data-booking-demo-note]')

    if (mode === 'quote') {
      if (err) {
        err.hidden = false
        err.textContent = m.contact.payUnavailable
      }
      return
    }

    const addonIds = mode === 'checkout' ? draft.addonIds : []
    const payDraft = { ...draft, addonIds }
    saveDraft(payDraft)

    if (err) {
      err.hidden = true
      err.textContent = ''
    }
    if (payBtn) {
      payBtn.disabled = true
      payBtn.textContent = m.contact.payProcessing
    }

    const total = calcOrderTotalEur(payDraft.service, payDraft.packageId, payDraft.addonIds)
    const checkout = await startCheckout({
      service: payDraft.service,
      packageId: payDraft.packageId,
      addonIds: payDraft.addonIds,
      email: payDraft.email,
      name: payDraft.name,
      locale,
    })

    if (checkout.mode === 'stripe') {
      if (secure) secure.textContent = m.contact.paySecure
      if (demoNote) demoNote.hidden = true
      trackEvent('booking_checkout_stripe', {
        service: payDraft.service,
        package: payDraft.packageId,
        total: checkout.totalEur ?? total,
        locale,
      })
      clearDraft()
      window.location.href = checkout.url
      return
    }

    if (checkout.mode === 'demo') {
      if (secure) secure.textContent = m.contact.paySecureDemo
      if (demoNote) demoNote.hidden = false
      trackEvent('booking_checkout_demo', {
        service: payDraft.service,
        package: payDraft.packageId,
        addons: payDraft.addonIds.join('|') || 'none',
        total: checkout.totalEur ?? total,
        locale,
      })
      await new Promise((r) => setTimeout(r, 600))
      clearDraft()
      window.location.href = checkout.url
      return
    }

    if (err) {
      err.hidden = false
      err.textContent = checkout.error || m.contact.payUnavailable
    }
    if (payBtn) {
      payBtn.disabled = false
      payBtn.textContent = m.contact.payCta
    }
  })
}
