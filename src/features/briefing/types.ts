import type { BookingServiceKey } from '../booking/catalog'

export const BRIEFING_SCHEMA_VERSION = 1 as const

export type BriefingIntent = 'checkout' | 'quote' | 'review'

export type MaterialStatus = 'ready' | 'later' | 'need-help' | ''

export type BriefingStepId = 'business' | 'requirements' | 'visual' | 'materials' | 'review'

export type FieldOption = { value: string; labelKey: string }

export type BriefingFieldDef = {
  id: string
  type: 'text' | 'textarea' | 'email' | 'tel' | 'url' | 'select' | 'radio' | 'checkbox' | 'color'
  labelKey: string
  hintKey?: string
  required?: boolean
  maxLength?: number
  options?: FieldOption[]
  adviceOption?: boolean
  /** When true, field lives in shared business slice */
  shared?: boolean
  /** Show only when another field equals one of these values */
  when?: { field: string; values: string[] }
}

export type BriefingProfileId =
  | 'web'
  | 'ecommerce'
  | 'mobile'
  | 'marketing'
  | 'seo'
  | 'hosting'
  | 'offline'
  | 'general'

export type ScopeFlag = 'within-scope' | 'addon-candidate' | 'needs-review'

export type BriefingDocument = {
  schemaVersion: typeof BRIEFING_SCHEMA_VERSION
  service: BookingServiceKey
  packageId: string
  addonIds: string[]
  intent: BriefingIntent
  locale: string
  business: Record<string, string>
  answers: Record<string, string | string[]>
  visual: Record<string, string>
  materials: Record<string, MaterialStatus>
  /** Answers from a previous service that no longer apply */
  orphanedAnswers: Record<string, string | string[]>
  orphanedService?: BookingServiceKey
  /** Set only after durable API accept (KV) */
  referenceId?: string
  /** Opaque access token — session only; never put in URLs or analytics */
  accessToken?: string
  selectionFingerprint?: string
  /** True only when server confirmed durable retention */
  durable?: boolean
  submittedAt?: string
  scopeFlags: ScopeFlag[]
  reviewNotes: string[]
}

export function emptyBriefing(
  service: BookingServiceKey,
  packageId: string,
  addonIds: string[] = [],
  intent: BriefingIntent = 'quote',
  locale = 'de',
): BriefingDocument {
  return {
    schemaVersion: BRIEFING_SCHEMA_VERSION,
    service,
    packageId,
    addonIds: [...addonIds],
    intent,
    locale,
    business: {},
    answers: {},
    visual: {},
    materials: {},
    orphanedAnswers: {},
    scopeFlags: [],
    reviewNotes: [],
  }
}
