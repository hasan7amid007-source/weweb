import type { BriefingDocument } from './types'
import { BRIEFING_SCHEMA_VERSION, emptyBriefing } from './types'
import type { BookingServiceKey } from '../booking/catalog'
import { isBookingServiceKey } from '../booking/catalog'

export const BRIEFING_DRAFT_KEY = 'bditec-briefing-draft'
export const BRIEFING_SUBMITTED_KEY = 'bditec-briefing-submitted'

function safeParse(raw: string | null): BriefingDocument | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as BriefingDocument
    if (data?.schemaVersion !== BRIEFING_SCHEMA_VERSION) return null
    if (!isBookingServiceKey(data.service)) return null
    return data
  } catch {
    return null
  }
}

export function readBriefingDraft(): BriefingDocument | null {
  try {
    return safeParse(sessionStorage.getItem(BRIEFING_DRAFT_KEY))
  } catch {
    return null
  }
}

export function writeBriefingDraft(doc: BriefingDocument): void {
  try {
    sessionStorage.setItem(BRIEFING_DRAFT_KEY, JSON.stringify(doc))
  } catch {
    /* private mode / quota */
  }
}

export function clearBriefingDraft(): void {
  try {
    sessionStorage.removeItem(BRIEFING_DRAFT_KEY)
  } catch {
    /* ignore */
  }
}

export function readSubmittedBriefing(): BriefingDocument | null {
  try {
    return safeParse(sessionStorage.getItem(BRIEFING_SUBMITTED_KEY))
  } catch {
    return null
  }
}

export function writeSubmittedBriefing(doc: BriefingDocument): void {
  try {
    sessionStorage.setItem(BRIEFING_SUBMITTED_KEY, JSON.stringify(doc))
  } catch {
    /* ignore */
  }
}

export function briefingMatchesCart(
  doc: BriefingDocument | null,
  service: BookingServiceKey,
  packageId: string,
  addonIds: string[] = [],
): boolean {
  if (!doc?.durable || !doc.referenceId || !doc.accessToken) return false
  if (doc.service !== service || doc.packageId !== packageId) return false
  const a = [...(doc.addonIds || [])].sort().join('|')
  const b = [...addonIds].sort().join('|')
  return a === b
}

/** Invalidate retained brief when selection changes */
export function clearSubmittedIfSelectionChanged(
  service: BookingServiceKey,
  packageId: string,
  addonIds: string[],
): void {
  const submitted = readSubmittedBriefing()
  if (!submitted) return
  if (!briefingMatchesCart(submitted, service, packageId, addonIds)) {
    try {
      sessionStorage.removeItem(BRIEFING_SUBMITTED_KEY)
    } catch {
      /* ignore */
    }
  }
}

export function ensureDraft(partial: {
  service: BookingServiceKey
  packageId: string
  addonIds?: string[]
  intent?: BriefingDocument['intent']
  locale?: string
}): BriefingDocument {
  const existing = readBriefingDraft()
  if (
    existing &&
    existing.service === partial.service &&
    existing.packageId === partial.packageId
  ) {
    return {
      ...existing,
      addonIds: partial.addonIds ?? existing.addonIds,
      intent: partial.intent ?? existing.intent,
      locale: partial.locale ?? existing.locale,
    }
  }
  const base = emptyBriefing(
    partial.service,
    partial.packageId,
    partial.addonIds ?? [],
    partial.intent ?? 'quote',
    partial.locale ?? 'de',
  )
  if (existing?.business && Object.keys(existing.business).length) {
    base.business = { ...existing.business }
  }
  if (existing && existing.service !== partial.service) {
    base.orphanedAnswers = { ...existing.answers, ...existing.visual }
    base.orphanedService = existing.service
  }
  return base
}
