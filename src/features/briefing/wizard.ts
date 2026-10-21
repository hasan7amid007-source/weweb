import { formatEur, isBookingServiceKey, type BookingServiceKey } from '../booking/catalog'
import {
  canPurchaseDirect,
  findShopPackage,
  listShopPackages,
  shopFor,
  type PurchaseMode,
} from '../booking/shop-catalog'
import type { ShopPageCopy } from '../../i18n/shop-page'
import { startCheckout } from '../booking/checkout-client'
import { trackEvent } from '../../lib/telemetry'
import { t, type Locale } from '../../i18n'
import {
  clearBriefingDraft,
  ensureDraft,
  readBriefingDraft,
  writeBriefingDraft,
  writeSubmittedBriefing,
} from './draft'
import { briefingPlainSummary, displayValue, escapeAttr } from './format'
import { briefingHref } from './href'
import {
  fieldVisible,
  materialKeysForProfile,
  profileForService,
  requirementFields,
  sharedBusinessFields,
  stepsForDocument,
  visualFields,
} from './questions'
import { changeServicePreservingBusiness, evaluateScope } from './scope'
import type { BriefingDocument, BriefingFieldDef, BriefingIntent, BriefingStepId } from './types'
import { validateFields } from './validate'

function packageTitle(locale: Locale, service: BookingServiceKey, packageId: string): string {
  if (!packageId) return t(locale).briefingPage.noPackage
  return t(locale).bookingShop.packages[service]?.[packageId]?.title || packageId
}

function serviceTitle(locale: Locale, service: BookingServiceKey): string {
  const m = t(locale)
  return service === 'general' ? m.contact.serviceGeneral : m.servicePages[service].title
}

function labelFor(copy: ReturnType<typeof t>['briefingPage'], field: BriefingFieldDef): string {
  return copy.fields[field.id] || field.id
}

function resolveHint(copy: ReturnType<typeof t>['briefingPage'], hintKey?: string): string {
  if (!hintKey) return ''
  const key = hintKey.startsWith('hints.') ? hintKey.slice(6) : hintKey
  return copy.hints[key] || ''
}

function priceAmountNoteForMode(mode: PurchaseMode, shop: ShopPageCopy): string {
  if (mode === 'subscription') return shop.subscriptionAmountNote
  if (mode === 'quote') return shop.quoteAmountNote
  return shop.startAmountNote
}

function fieldValue(
  doc: BriefingDocument,
  field: BriefingFieldDef,
): string | string[] {
  if (field.shared) return doc.business[field.id] || ''
  if (field.id.startsWith('primary') || field.id.startsWith('secondary') || field.id.startsWith('identity') || field.id.startsWith('visual') || field.id.startsWith('reference') || field.id === 'suggestPalette' || field.id === 'colorsAvoid') {
    return doc.visual[field.id] || ''
  }
  // visual fields list
  const visualIds = new Set(visualFields().map((f) => f.id))
  if (visualIds.has(field.id)) return doc.visual[field.id] || ''
  return doc.answers[field.id] ?? (field.type === 'checkbox' ? [] : '')
}

function renderField(
  locale: Locale,
  field: BriefingFieldDef,
  doc: BriefingDocument,
  error?: string,
): string {
  const copy = t(locale).briefingPage
  const values = { ...doc.business, ...doc.answers, ...doc.visual }
  if (!fieldVisible(field, values)) return ''
  const raw = fieldValue(doc, field)
  const req = field.required ? `<em title="${copy.required}">*</em>` : `<span class="briefing-optional">(${copy.optional})</span>`
  const err = error
    ? `<p class="booking-error" id="err-${field.id}" role="alert">${errorMessage(copy, error)}</p>`
    : ''
  const hint = resolveHint(copy, field.hintKey)
  const hintHtml = hint ? `<span class="shop-quote-field-hint">${hint}</span>` : ''
  const invalid = error ? ' aria-invalid="true" aria-describedby="err-' + field.id + '"' : ''
  const name = field.id
  const label = labelFor(copy, field)

  if (field.type === 'textarea') {
    return `<label class="contact-field" data-field="${name}">
      <span>${label} ${req}</span>
      <textarea name="${name}" rows="4" maxlength="${field.maxLength || 2000}"${invalid}>${escapeAttr(String(raw || ''))}</textarea>
      ${hintHtml}${err}
    </label>`
  }

  if (field.type === 'select') {
    const opts = (field.options || [])
      .map((o) => {
        const selected = String(raw) === o.value ? ' selected' : ''
        return `<option value="${o.value}"${selected}>${copy.opt[o.value] || o.value}</option>`
      })
      .join('')
    return `<label class="contact-field" data-field="${name}">
      <span>${label} ${req}</span>
      <select name="${name}"${invalid}><option value="">—</option>${opts}</select>
      ${hintHtml}${err}
    </label>`
  }

  if (field.type === 'radio') {
    const opts = (field.options || [])
      .map((o) => {
        const checked = String(raw) === o.value ? ' checked' : ''
        return `<label class="briefing-choice">
          <input type="radio" name="${name}" value="${o.value}"${checked}${invalid} />
          <span>${copy.opt[o.value] || o.value}</span>
        </label>`
      })
      .join('')
    return `<fieldset class="contact-field briefing-fieldset" data-field="${name}">
      <legend>${label} ${req}</legend>
      <div class="briefing-choice-grid">${opts}</div>
      ${hintHtml}${err}
    </fieldset>`
  }

  if (field.type === 'checkbox') {
    const selected = Array.isArray(raw) ? raw : []
    const opts = (field.options || [])
      .map((o) => {
        const checked = selected.includes(o.value) ? ' checked' : ''
        return `<label class="briefing-choice">
          <input type="checkbox" name="${name}" value="${o.value}"${checked} />
          <span>${copy.opt[o.value] || o.value}</span>
        </label>`
      })
      .join('')
    return `<fieldset class="contact-field briefing-fieldset" data-field="${name}">
      <legend>${label} ${req}</legend>
      <div class="briefing-choice-grid">${opts}</div>
      ${hintHtml}${err}
    </fieldset>`
  }

  if (field.type === 'color') {
    const hex = String(raw || '')
    return `<label class="contact-field briefing-color" data-field="${name}">
      <span>${label} ${req}</span>
      <div class="briefing-color-row">
        <input type="color" name="${name}-picker" value="${HEX_SAFE(hex)}" data-color-for="${name}" aria-label="${label}" />
        <input type="text" name="${name}" value="${escapeAttr(hex)}" maxlength="7" placeholder="#112233" pattern="#?[0-9A-Fa-f]{3,6}"${invalid} />
      </div>
      ${hintHtml}${err}
    </label>`
  }

  const inputType =
    field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : field.type === 'url' ? 'url' : 'text'
  return `<label class="contact-field" data-field="${name}">
    <span>${label} ${req}</span>
    <input type="${inputType}" name="${name}" value="${escapeAttr(String(raw || ''))}" maxlength="${field.maxLength || 500}"${invalid} />
    ${hintHtml}${err}
  </label>`
}

function HEX_SAFE(v: string): string {
  return /^#[0-9a-f]{6}$/i.test(v) ? v : '#5b2ef5'
}

function errorMessage(copy: ReturnType<typeof t>['briefingPage'], code: string): string {
  if (code === 'required') return copy.errorRequired
  if (code === 'email') return copy.errorEmail
  if (code === 'url') return copy.errorUrl
  if (code === 'color') return copy.errorColor
  if (code === 'option') return copy.errorOption
  if (code === 'maxLength') return copy.errorMaxLength
  return copy.errorRequired
}

function collectFromForm(
  form: HTMLFormElement,
  fields: BriefingFieldDef[],
): Record<string, string | string[]> {
  const data = new FormData(form)
  const out: Record<string, string | string[]> = {}
  for (const field of fields) {
    if (field.type === 'checkbox') {
      out[field.id] = data.getAll(field.id).map(String)
    } else {
      out[field.id] = String(data.get(field.id) || '').trim()
    }
  }
  return out
}

function applySlice(
  doc: BriefingDocument,
  step: BriefingStepId,
  values: Record<string, string | string[]>,
  fields: BriefingFieldDef[],
): BriefingDocument {
  const next = { ...doc, business: { ...doc.business }, answers: { ...doc.answers }, visual: { ...doc.visual }, materials: { ...doc.materials } }
  for (const field of fields) {
    const v = values[field.id]
    if (v == null) continue
    if (field.shared) next.business[field.id] = String(Array.isArray(v) ? v.join(',') : v)
    else if (step === 'visual') next.visual[field.id] = String(Array.isArray(v) ? v.join(',') : v)
    else if (step === 'requirements') {
      next.answers[field.id] = v
    }
  }
  return next
}

export function readBriefingParams(): {
  service: BookingServiceKey | null
  packageId: string
  addonIds: string[]
  intent: BriefingIntent
  from: string
} {
  const params = new URLSearchParams(location.search)
  const serviceRaw = params.get('service') || ''
  const service = isBookingServiceKey(serviceRaw) ? serviceRaw : null
  const packageId = params.get('package') || ''
  const addonIds = (params.get('addons') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const intentRaw = params.get('intent') || ''
  const intent: BriefingIntent =
    intentRaw === 'checkout' || intentRaw === 'quote' || intentRaw === 'review'
      ? intentRaw
      : packageId && service
        ? (() => {
            const item = findShopPackage(service, packageId)
            return item && canPurchaseDirect(item.package) ? 'checkout' : 'quote'
          })()
        : 'quote'
  return { service, packageId, addonIds, intent, from: params.get('from') || '' }
}

export function renderBriefingMarkup(locale: Locale, doc: BriefingDocument, stepIndex: number): string {
  const copy = t(locale).briefingPage
  const steps = stepsForDocument({ service: doc.service, packageId: doc.packageId })
  const step = steps[Math.min(stepIndex, steps.length - 1)]!
  const item = doc.packageId ? findShopPackage(doc.service, doc.packageId) : undefined
  const profile = profileForService(doc.service, doc.packageId)
  const pkgLabel = packageTitle(locale, doc.service, doc.packageId)
  const svcLabel = serviceTitle(locale, doc.service)
  const shop = t(locale).shopPage
  const amount =
    item && item.package.purchaseMode !== 'quote'
      ? formatEur(item.package.priceEur, locale)
      : item
        ? shop.priceOnRequest
        : copy.noPackage
  const billingLabel = item
    ? item.package.purchaseMode === 'subscription'
      ? `${amount} ${shop.monthSuffix.trim()}`
      : item.package.purchaseMode === 'quote'
        ? shop.priceOnRequest
        : amount
    : ''
  const pkgCopy = doc.packageId
    ? t(locale).bookingShop.packages[doc.service]?.[doc.packageId]
    : undefined
  const asideHighlights = (pkgCopy?.highlights || []).slice(0, 4)
  const asideIncludes =
    asideHighlights.length > 0
      ? `<ul class="briefing-aside-includes" aria-label="${shop.planIncludes}">
          ${asideHighlights.map((line) => `<li>${line}</li>`).join('')}
        </ul>`
      : ''

  const stepNav = steps
    .map((id, i) => {
      const current = i === stepIndex ? ' aria-current="step"' : ''
      const done = i < stepIndex ? ' is-done' : ''
      return `<li class="briefing-step${done}"${current}><span class="briefing-step-num">${i + 1}</span><span>${copy.steps[id]}</span></li>`
    })
    .join('')

  let body = ''
  if (step === 'business') {
    body = sharedBusinessFields()
      .map((f) => renderField(locale, f, doc))
      .join('')
  } else if (step === 'requirements') {
    body = requirementFields(profile)
      .map((f) => renderField(locale, f, doc))
      .join('')
  } else if (step === 'visual') {
    body = visualFields()
      .map((f) => renderField(locale, f, doc))
      .join('')
  } else if (step === 'materials') {
    const keys = materialKeysForProfile(profile)
    body = `<p class="booking-hint">${copy.uploadFallback}</p>
      <p class="shop-note">${copy.uploadNone}</p>
      <div class="briefing-materials">
        ${keys
          .map((key) => {
            const status = doc.materials[key] || ''
            return `<fieldset class="contact-field briefing-fieldset">
              <legend>${copy.materialLabels[key] || key}</legend>
              <div class="briefing-choice-grid">
                ${(['ready', 'later', 'need-help'] as const)
                  .map(
                    (s) => `<label class="briefing-choice">
                  <input type="radio" name="mat-${key}" value="${s}"${status === s ? ' checked' : ''} />
                  <span>${copy.materialStatus[s]}</span>
                </label>`,
                  )
                  .join('')}
              </div>
            </fieldset>`
          })
          .join('')}
      </div>`
  } else {
    const scope = evaluateScope(doc)
    const once =
      item && item.package.purchaseMode === 'checkout'
        ? `<p><strong>${copy.reviewAmountDue}:</strong> ${amount}</p>`
        : ''
    const monthly =
      item && item.package.purchaseMode === 'subscription'
        ? `<p><strong>${copy.reviewAmountMonthly}:</strong> ${amount}</p>`
        : ''
    const reviewItems = scope.notes
      .map((n) => `<li>${copy.scopeNotes[n] || n}</li>`)
      .join('')
    const goals = Object.entries(doc.answers)
      .filter(([, v]) => v && !(Array.isArray(v) && !v.length))
      .slice(0, 12)
      .map(
        ([k, v]) =>
          `<li><strong>${copy.fields[k] || k}:</strong> ${escapeAttr(displayValue(copy, k, v))}</li>`,
      )
      .join('')
    const visual = Object.entries(doc.visual)
      .filter(([, v]) => v)
      .map(
        ([k, v]) =>
          `<li><strong>${copy.fields[k] || k}:</strong> ${escapeAttr(displayValue(copy, k, v))}</li>`,
      )
      .join('')
    const mats = Object.entries(doc.materials)
      .filter(([, v]) => v)
      .map(
        ([k, v]) =>
          `<li><strong>${copy.materialLabels[k] || k}:</strong> ${copy.materialStatus[v as keyof typeof copy.materialStatus] || v}</li>`,
      )
      .join('')
    const cta =
      scope.nextAction === 'checkout'
        ? copy.ctaCheckout
        : scope.nextAction === 'quote'
          ? copy.ctaQuote
          : copy.ctaReview
    body = `
      <div class="briefing-review" data-briefing-review>
        <section>
          <h3>${copy.reviewService} <button type="button" class="briefing-edit" data-goto-step="0">${copy.reviewEdit}</button></h3>
          <p>${svcLabel} — ${pkgLabel}</p>
          ${once}${monthly}
          <p class="booking-hint">${copy.notIncludedNote}</p>
        </section>
        <section>
          <h3>${copy.reviewGoals} <button type="button" class="briefing-edit" data-goto-step="1">${copy.reviewEdit}</button></h3>
          <ul>${goals || `<li>${doc.business.mainGoal || '—'}</li>`}</ul>
        </section>
        ${
          visual
            ? `<section>
          <h3>${copy.reviewVisual} <button type="button" class="briefing-edit" data-goto-step="${steps.indexOf('visual')}">${copy.reviewEdit}</button></h3>
          <ul>${visual}</ul>
        </section>`
            : ''
        }
        <section>
          <h3>${copy.reviewMaterials} <button type="button" class="briefing-edit" data-goto-step="${steps.indexOf('materials')}">${copy.reviewEdit}</button></h3>
          <ul>${mats || '<li>—</li>'}</ul>
        </section>
        ${
          reviewItems
            ? `<section>
          <h3>${copy.reviewNeedsReview}</h3>
          <ul>${reviewItems}</ul>
        </section>`
            : ''
        }
        ${
          doc.business.desiredDate
            ? `<p class="booking-hint">${copy.reviewDateUnconfirmed}: ${escapeAttr(doc.business.desiredDate)}</p>`
            : ''
        }
        ${
          doc.business.budget && doc.business.budget !== 'open'
            ? `<p class="booking-hint">${copy.reviewBudgetDisclaimer}</p>`
            : ''
        }
        <p class="booking-hint">${copy.draftNote}</p>
        <div class="shop-quote-actions">
          <span class="glowborder">
            <button type="submit" class="ts-btn pink solid" data-briefing-submit data-next-action="${scope.nextAction}">${cta}</button>
          </span>
          <button type="button" class="booking-back" data-briefing-print>${copy.reviewPrint}</button>
        </div>
        <p class="shop-quote-ok" data-briefing-ok hidden></p>
        <p class="booking-error" data-briefing-error hidden></p>
        <pre class="shop-quote-summary" data-briefing-summary hidden></pre>
      </div>`
  }

  const orphan =
    doc.orphanedService && Object.keys(doc.orphanedAnswers).length
      ? `<div class="briefing-orphan" role="status">
          <p>${copy.orphanNotice}</p>
          <details><summary>${copy.orphanView}</summary>
            <pre class="shop-quote-summary">${escapeAttr(JSON.stringify(doc.orphanedAnswers, null, 2))}</pre>
          </details>
        </div>`
      : ''

  const packages = listShopPackages().filter((p) => p.service === doc.service)
  const changePanel = `
    <details class="briefing-change">
      <summary>${copy.changeSelection}</summary>
      <form class="briefing-change-form" data-briefing-change>
        <label class="contact-field">
          <span>${copy.serviceLabel}</span>
          <select name="service">
            ${(['web-development', 'e-commerce', 'mobile-app', 'digital-marketing', 'web-hosting', 'offline-marketing', 'general'] as BookingServiceKey[])
              .map(
                (s) =>
                  `<option value="${s}"${s === doc.service ? ' selected' : ''}>${serviceTitle(locale, s)}</option>`,
              )
              .join('')}
          </select>
        </label>
        <label class="contact-field">
          <span>${copy.packageLabel}</span>
          <select name="package">
            <option value="">${copy.noPackage}</option>
            ${packages
              .map(
                (p) =>
                  `<option value="${p.package.id}"${p.package.id === doc.packageId ? ' selected' : ''}>${packageTitle(locale, p.service, p.package.id)}</option>`,
              )
              .join('')}
          </select>
        </label>
        <button type="submit" class="ts-btn pink">${copy.changeSelection}</button>
      </form>
    </details>`

  const isReview = step === 'review'
  return `
    <section class="briefing-page wrap" data-briefing-root data-step="${stepIndex}">
      <header class="briefing-hero">
        <p class="shop-eyebrow">${copy.eyebrow}</p>
        <h1>${copy.title}</h1>
        <p class="lead">${copy.lead}</p>
      </header>
      <div class="briefing-layout">
        <aside class="briefing-aside">
          <h2 class="shop-quote-aside-title">${copy.summaryAsideTitle}</h2>
          <p><strong>${copy.serviceLabel}:</strong> ${svcLabel}</p>
          <p><strong>${copy.packageLabel}:</strong> ${pkgLabel}</p>
          ${
            item
              ? `<p class="briefing-aside-price"><strong>${billingLabel}</strong>
                  <span class="shop-mode-badge shop-mode-badge--${item.package.purchaseMode}">${shop.modeBadge[item.package.purchaseMode]}</span>
                </p>
                ${
                  item.package.directCheckout === false
                    ? `<p class="shop-note shop-note--gate">${shop.termsGateNote}</p>`
                    : `<p class="booking-hint">${priceAmountNoteForMode(item.package.purchaseMode, shop)}</p>`
                }
                ${asideIncludes}`
              : `<p class="booking-hint">${copy.pickPackage}</p>`
          }
          ${changePanel}
          <ol class="briefing-steps" aria-label="${copy.progress(stepIndex + 1, steps.length)}">${stepNav}</ol>
          <p class="briefing-progress" aria-live="polite">${copy.progress(stepIndex + 1, steps.length)}</p>
          <button type="button" class="booking-back" data-briefing-clear>${copy.clearDraft}</button>
        </aside>
        <div class="briefing-main">
          ${orphan}
          <form class="contact-form briefing-form" data-briefing-form novalidate>
            <h2 class="briefing-step-title">${copy.steps[step]}</h2>
            <div class="booking-error briefing-error-summary" data-briefing-error-summary hidden role="alert"></div>
            ${body}
            ${
              !isReview
                ? `<div class="shop-quote-actions">
              ${stepIndex > 0 ? `<button type="button" class="booking-back" data-briefing-back>${copy.back}</button>` : ''}
              <span class="glowborder">
                <button type="submit" class="ts-btn pink solid">${copy.next}</button>
              </span>
            </div>`
                : ''
            }
          </form>
        </div>
      </div>
    </section>`
}

export function initBriefingWizard(
  host: HTMLElement,
  locale: Locale,
  onRerender: (doc: BriefingDocument, step: number) => void,
): void {
  const copy = t(locale).briefingPage
  let stepIndex = Number(host.querySelector('[data-briefing-root]')?.getAttribute('data-step') || 0)
  const params = readBriefingParams()
  let doc =
    readBriefingDraft() ||
    (params.service
      ? ensureDraft({
          service: params.service,
          packageId: params.packageId,
          addonIds: params.addonIds,
          intent: params.intent,
          locale,
        })
      : ensureDraft({ service: 'web-development', packageId: 'landing', intent: 'checkout', locale }))

  const sync = () => {
    writeBriefingDraft(doc)
    onRerender(doc, stepIndex)
  }

  host.querySelector<HTMLFormElement>('[data-briefing-change]')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const data = new FormData(form)
    const service = String(data.get('service') || '')
    const packageId = String(data.get('package') || '')
    if (!isBookingServiceKey(service)) return
    if (packageId && !findShopPackage(service, packageId) && packageId !== '') {
      // allow empty package for pure quote
      if (packageId) return
    }
    if (packageId && !shopFor(service).packages.some((p) => p.id === packageId)) return
    doc = changeServicePreservingBusiness(doc, service, packageId)
    doc.durable = false
    doc.accessToken = undefined
    doc.referenceId = undefined
    try {
      sessionStorage.removeItem('bditec-briefing-submitted')
    } catch {
      /* ignore */
    }
    const item = packageId ? findShopPackage(service, packageId) : undefined
    doc.intent = item && canPurchaseDirect(item.package) ? 'checkout' : 'quote'
    stepIndex = 0
    const url = briefingHref({
      service,
      packageId,
      intent: doc.intent,
      from: 'change',
      lang: locale === 'de' ? undefined : locale,
    })
    history.replaceState(null, '', url)
    sync()
  })

  host.querySelector('[data-briefing-clear]')?.addEventListener('click', () => {
    clearBriefingDraft()
    const p = readBriefingParams()
    if (!p.service) return
    doc = ensureDraft({
      service: p.service,
      packageId: p.packageId,
      addonIds: p.addonIds,
      intent: p.intent,
      locale,
    })
    stepIndex = 0
    sync()
  })

  host.querySelectorAll<HTMLInputElement>('[data-color-for]').forEach((picker) => {
    picker.addEventListener('input', () => {
      const name = picker.dataset.colorFor
      if (!name) return
      const text = host.querySelector<HTMLInputElement>(`input[name="${name}"]`)
      if (text) text.value = picker.value
    })
  })

  host.querySelectorAll<HTMLButtonElement>('[data-goto-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      stepIndex = Number(btn.dataset.gotoStep || 0)
      sync()
    })
  })

  host.querySelector('[data-briefing-back]')?.addEventListener('click', () => {
    stepIndex = Math.max(0, stepIndex - 1)
    sync()
  })

  host.querySelector('[data-briefing-print]')?.addEventListener('click', () => {
    trackEvent('briefing_print', { locale, service: doc.service })
    window.print()
  })

  const form = host.querySelector<HTMLFormElement>('[data-briefing-form]')
  form?.addEventListener('submit', async (event) => {
    event.preventDefault()
    const steps = stepsForDocument({ service: doc.service, packageId: doc.packageId })
    const step = steps[stepIndex]!
    const summary = host.querySelector<HTMLElement>('[data-briefing-error-summary]')

    if (step === 'review') {
      await submitBriefing(host, locale, doc)
      return
    }

    const profile = profileForService(doc.service, doc.packageId)
    let fields: BriefingFieldDef[] = []
    if (step === 'business') fields = sharedBusinessFields()
    else if (step === 'requirements') fields = requirementFields(profile)
    else if (step === 'visual') fields = visualFields()

    if (step === 'materials') {
      const keys = materialKeysForProfile(profile)
      const data = new FormData(form)
      for (const key of keys) {
        const v = String(data.get(`mat-${key}`) || '') as BriefingDocument['materials'][string]
        if (v === 'ready' || v === 'later' || v === 'need-help') doc.materials[key] = v
      }
      writeBriefingDraft(doc)
      stepIndex = Math.min(stepIndex + 1, steps.length - 1)
      sync()
      return
    }

    const values = collectFromForm(form, fields)
    const mergedValues = { ...doc.business, ...doc.answers, ...doc.visual, ...values }
    const errors = validateFields(fields, mergedValues)
    if (errors.length) {
      if (summary) {
        summary.hidden = false
        summary.textContent = copy.errorSummary
      }
      // re-render with errors by patching doc then showing — simplest: alert fields via sync with temp
      doc = applySlice(doc, step, values, fields)
      writeBriefingDraft(doc)
      onRerender(doc, stepIndex)
      // after rerender, show errors — parent re-inits; store errors on session
      try {
        sessionStorage.setItem('bditec-briefing-errors', JSON.stringify(errors))
      } catch {
        /* ignore */
      }
      return
    }
    if (summary) summary.hidden = true
    doc = applySlice(doc, step, values, fields)
    writeBriefingDraft(doc)
    stepIndex = Math.min(stepIndex + 1, steps.length - 1)
    sync()
  })
}

function showSummaryActions(
  host: HTMLElement,
  copy: ReturnType<typeof t>['briefingPage'],
  plain: string,
) {
  const summary = host.querySelector<HTMLElement>('[data-briefing-summary]')
  if (summary) {
    summary.hidden = false
    summary.textContent = plain
  }
  let actions = host.querySelector<HTMLElement>('[data-briefing-summary-actions]')
  if (!actions) {
    actions = document.createElement('div')
    actions.className = 'shop-quote-actions'
    actions.dataset.briefingSummaryActions = ''
    summary?.after(actions)
  }
  actions.innerHTML = `
    <button type="button" class="booking-back" data-briefing-copy>${copy.copySummary}</button>
    <button type="button" class="booking-back" data-briefing-download>${copy.downloadSummary}</button>
  `
  actions.querySelector('[data-briefing-copy]')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(plain)
      ;(actions!.querySelector('[data-briefing-copy]') as HTMLButtonElement).textContent =
        copy.copied
    } catch {
      /* ignore */
    }
  })
  actions.querySelector('[data-briefing-download]')?.addEventListener('click', () => {
    const blob = new Blob([plain], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bditec-briefing-${Date.now().toString(36)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  })
}

async function submitBriefing(host: HTMLElement, locale: Locale, doc: BriefingDocument) {
  const copy = t(locale).briefingPage
  const btn = host.querySelector<HTMLButtonElement>('[data-briefing-submit]')
  const ok = host.querySelector<HTMLElement>('[data-briefing-ok]')
  const err = host.querySelector<HTMLElement>('[data-briefing-error]')
  const scope = evaluateScope(doc)
  doc = {
    ...doc,
    scopeFlags: scope.flags,
    reviewNotes: scope.notes,
    intent:
      scope.nextAction === 'checkout'
        ? 'checkout'
        : scope.nextAction === 'quote'
          ? 'quote'
          : 'review',
    durable: false,
    referenceId: undefined,
    accessToken: undefined,
  }
  if (btn) {
    btn.disabled = true
    btn.textContent = copy.ctaSubmitting
  }
  trackEvent('briefing_submit_attempt', {
    locale,
    service: doc.service,
    package: doc.packageId || 'none',
    action: scope.nextAction,
  })

  writeBriefingDraft(doc)
  const plain = briefingPlainSummary(doc, copy)

  type SubmitResponse = {
    ok?: boolean
    durable?: boolean
    referenceId?: string
    accessToken?: string
    nextAction?: 'checkout' | 'quote' | 'review'
    status?: string
    error?: string
    detail?: string
    nextActionHint?: string
    selectionFingerprint?: string
    duplicate?: boolean
  }

  let data: SubmitResponse = {}
  let httpOk = false
  try {
    const res = await fetch('/api/submit-briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: doc.schemaVersion,
        service: doc.service,
        packageId: doc.packageId,
        addonIds: doc.addonIds,
        intent: doc.intent,
        locale,
        business: doc.business,
        answers: doc.answers,
        visual: doc.visual,
        materials: doc.materials,
        scopeFlags: doc.scopeFlags,
        reviewNotes: doc.reviewNotes,
      }),
    })
    data = (await res.json().catch(() => ({}))) as SubmitResponse
    httpOk = res.ok
  } catch {
    data = { ok: false, durable: false, error: 'network' }
  }

  const retained =
    httpOk && data.ok === true && data.durable === true && !!data.referenceId && !!data.accessToken

  if (!retained) {
    showSummaryActions(host, copy, plain)
    if (ok) ok.hidden = true
    if (err) {
      err.hidden = false
      err.textContent =
        data.detail || data.error || copy.notRetained || copy.submitError
    }
    // Quote path without durable store: allow customer-email delivery only (not "submitted to us")
    if (scope.nextAction !== 'checkout') {
      const mailBtn = document.createElement('button')
      mailBtn.type = 'button'
      mailBtn.className = 'ts-btn pink solid'
      mailBtn.textContent = copy.ctaQuoteEmailFallback
      mailBtn.addEventListener('click', () => {
        const subject = encodeURIComponent(
          `BDITEC briefing (not yet retained) — ${doc.service}/${doc.packageId || 'custom'}`,
        )
        location.href = `mailto:info@bditec.com?subject=${subject}&body=${encodeURIComponent(plain)}`
        trackEvent('briefing_quote_mailto_fallback', { locale })
      })
      err?.after(mailBtn)
    }
    if (btn) {
      btn.disabled = false
      btn.textContent =
        scope.nextAction === 'checkout'
          ? copy.ctaCheckout
          : scope.nextAction === 'quote'
            ? copy.ctaQuote
            : copy.ctaReview
    }
    trackEvent('briefing_submit_not_retained', { locale, service: doc.service })
    return
  }

  doc = {
    ...doc,
    referenceId: data.referenceId,
    accessToken: data.accessToken,
    selectionFingerprint: data.selectionFingerprint,
    durable: true,
    submittedAt: new Date().toISOString(),
    intent: data.nextAction || doc.intent,
  }
  writeSubmittedBriefing(doc)
  writeBriefingDraft(doc)
  showSummaryActions(host, copy, briefingPlainSummary(doc, copy))

  const next = data.nextAction || scope.nextAction
  if (next === 'checkout') {
    if (ok) {
      ok.hidden = false
      ok.textContent = copy.successCheckout
    }
    if (err) err.hidden = true
    const result = await startCheckout({
      service: doc.service,
      packageId: doc.packageId,
      addonIds: doc.addonIds,
      email: doc.business.contactEmail || '',
      name: doc.business.contactName || '',
      locale,
      briefingRef: doc.referenceId,
      briefingToken: doc.accessToken,
    })
    if (result.mode === 'demo' || result.mode === 'stripe') {
      trackEvent('briefing_to_checkout', { locale, durable: true })
      location.href = result.url
      return
    }
    if (err) {
      err.hidden = false
      err.textContent = result.error || copy.submitError
    }
  } else {
    if (ok) {
      ok.hidden = false
      ok.textContent = next === 'quote' ? copy.successQuote : copy.successReview
    }
    const subject = encodeURIComponent(
      `BDITEC briefing ${doc.referenceId} — ${doc.service}/${doc.packageId || 'custom'}`,
    )
    trackEvent('briefing_quote_mailto', { locale, durable: true })
    location.href = `mailto:info@bditec.com?subject=${subject}&body=${encodeURIComponent(briefingPlainSummary(doc, copy))}`
  }

  if (btn) {
    btn.disabled = false
    btn.textContent =
      next === 'checkout' ? copy.ctaCheckout : next === 'quote' ? copy.ctaQuote : copy.ctaReview
  }
}

export function createInitialBriefing(locale: Locale): BriefingDocument | null {
  const params = readBriefingParams()
  if (!params.service) return null
  if (params.packageId && !findShopPackage(params.service, params.packageId)) {
    // Allow general service packages not in public listing
    if (!shopFor(params.service).packages.some((p) => p.id === params.packageId)) return null
  }
  return ensureDraft({
    service: params.service,
    packageId: params.packageId,
    addonIds: params.addonIds,
    intent: params.intent,
    locale,
  })
}
