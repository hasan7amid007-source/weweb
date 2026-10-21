import type { BookingServiceKey } from '../booking/catalog'
import type { BriefingIntent } from './types'

export function briefingHref(input: {
  service: BookingServiceKey
  packageId?: string
  addonIds?: string[]
  intent?: BriefingIntent
  from?: string
  lang?: string
}): string {
  const q = new URLSearchParams()
  q.set('service', input.service)
  if (input.packageId) q.set('package', input.packageId)
  if (input.addonIds?.length) q.set('addons', input.addonIds.join(','))
  if (input.intent) q.set('intent', input.intent)
  if (input.from) q.set('from', input.from)
  if (input.lang && input.lang !== 'de') q.set('lang', input.lang)
  return `/briefing.html?${q.toString()}`
}
