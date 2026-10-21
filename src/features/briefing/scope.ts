import { canPurchaseDirect, findShopPackage, shopFor } from '../booking/shop-catalog'
import type { BookingServiceKey } from '../booking/catalog'
import { profileForService } from './questions'
import type { BriefingDocument, ScopeFlag } from './types'

/**
 * Conservative scope flags from catalog + answers.
 * Does not invent pricing — only flags review / addon candidates already in catalog.
 */
export function evaluateScope(doc: BriefingDocument): {
  flags: ScopeFlag[]
  notes: string[]
  nextAction: 'checkout' | 'quote' | 'review'
} {
  const flags: ScopeFlag[] = []
  const notes: string[] = []
  const item = doc.packageId ? findShopPackage(doc.service, doc.packageId) : undefined
  const profile = profileForService(doc.service, doc.packageId)

  if (!item) {
    flags.push('needs-review')
    notes.push('no-package')
    return { flags, notes, nextAction: 'quote' }
  }

  if (!canPurchaseDirect(item.package) || item.package.purchaseMode === 'quote') {
    flags.push('needs-review')
    notes.push('quote-package')
    return { flags, notes, nextAction: 'quote' }
  }

  // Catalog-backed addon candidates (feature mentions vs known addon ids — no invented prices)
  const addonHints: { answerKey: string; values: string[]; addonId: string }[] = []
  if (doc.service === 'web-development' || doc.service === 'e-commerce') {
    addonHints.push(
      { answerKey: 'needsCms', values: ['yes'], addonId: 'cms' },
      { answerKey: 'needsForms', values: ['yes'], addonId: 'forms' },
    )
  }
  if (doc.service === 'web-development') {
    addonHints.push({ answerKey: 'needsCms', values: ['yes'], addonId: 'seo-tech' })
  }

  for (const hint of addonHints) {
    const val = String(doc.answers[hint.answerKey] || '')
    if (hint.values.includes(val) && !doc.addonIds.includes(hint.addonId)) {
      const hasAddon = shopFor(doc.service).addons.some((a) => a.id === hint.addonId)
      if (hasAddon) {
        flags.push('addon-candidate')
        notes.push(`addon:${hint.addonId}`)
      } else {
        flags.push('needs-review')
        notes.push(`review:${hint.addonId}`)
      }
    }
  }

  // Complexity signals → manual review (not auto-priced)
  const purpose = String(doc.answers.websitePurpose || '')
  if (purpose === 'webapp' || purpose === 'store') {
    if (doc.service === 'web-development' && purpose === 'store') {
      flags.push('needs-review')
      notes.push('store-via-web-dev')
    }
    if (purpose === 'webapp') {
      flags.push('needs-review')
      notes.push('custom-webapp')
    }
  }

  const featEssential = [
    'featPayments',
    'featNotifications',
    'featMaps',
    'featCamera',
    'featMessaging',
    'featOffline',
  ].filter((k) => String(doc.answers[k] || '') === 'essential')
  if (profile === 'mobile' && featEssential.length >= 3) {
    flags.push('needs-review')
    notes.push('mobile-feature-density')
  }

  if (String(doc.answers.storeStatus || '') === 'migration') {
    flags.push('needs-review')
    notes.push('store-migration')
  }

  if (String(doc.answers.hostingNeed || '') === 'troubleshoot') {
    flags.push('needs-review')
    notes.push('hosting-troubleshoot')
  }

  if (String(doc.answers.scopeSplit || '') === 'install-also') {
    flags.push('needs-review')
    notes.push('install-assessment')
  }

  const unique = [...new Set(flags)]
  if (!unique.length) unique.push('within-scope')

  if (unique.includes('needs-review') && doc.intent !== 'checkout') {
    return { flags: unique, notes, nextAction: 'quote' }
  }
  if (unique.includes('needs-review') && doc.intent === 'checkout') {
    // Preserve answers; do not charge guessed amount
    return { flags: unique, notes, nextAction: 'review' }
  }

  return {
    flags: unique,
    notes,
    nextAction: canPurchaseDirect(item.package) ? 'checkout' : 'quote',
  }
}

export function changeServicePreservingBusiness(
  doc: BriefingDocument,
  nextService: BookingServiceKey,
  nextPackageId: string,
): BriefingDocument {
  const orphaned: Record<string, string | string[]> = {
    ...doc.orphanedAnswers,
    ...doc.answers,
    ...doc.visual,
  }
  return {
    ...doc,
    service: nextService,
    packageId: nextPackageId,
    addonIds: [],
    answers: {},
    visual: {},
    materials: {},
    orphanedAnswers: orphaned,
    orphanedService: doc.service,
    referenceId: undefined,
    submittedAt: undefined,
    scopeFlags: [],
    reviewNotes: [],
  }
}
