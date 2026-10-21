import type { BriefingPageCopy } from '../../i18n/briefing-page'
import type { BriefingDocument } from './types'

function escapeText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function displayValue(
  copy: BriefingPageCopy,
  _key: string,
  raw: string | string[] | undefined,
): string {
  if (raw == null || raw === '') return '—'
  if (Array.isArray(raw)) {
    return raw.map((v) => copy.opt[v] || v).join(', ') || '—'
  }
  return copy.opt[raw] || raw
}

export function briefingPlainSummary(doc: BriefingDocument, copy: BriefingPageCopy): string {
  const lines: string[] = [
    `BDITEC briefing ${doc.referenceId || '(draft)'}`,
    `Schema: v${doc.schemaVersion}`,
    `Service: ${doc.service}`,
    `Package: ${doc.packageId || 'none'}`,
    `Addons: ${doc.addonIds.join(', ') || 'none'}`,
    `Intent: ${doc.intent}`,
    '',
    '— Business —',
  ]
  for (const [k, v] of Object.entries(doc.business)) {
    if (!v) continue
    const label = copy.fields[k] || k
    lines.push(`${label}: ${displayValue(copy, k, v)}`)
  }
  lines.push('', '— Requirements —')
  for (const [k, v] of Object.entries(doc.answers)) {
    if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue
    const label = copy.fields[k] || k
    lines.push(`${label}: ${displayValue(copy, k, v)}`)
  }
  if (Object.keys(doc.visual).length) {
    lines.push('', '— Visual —')
    for (const [k, v] of Object.entries(doc.visual)) {
      if (!v) continue
      const label = copy.fields[k] || k
      lines.push(`${label}: ${displayValue(copy, k, v)}`)
    }
  }
  lines.push('', '— Materials —')
  for (const [k, v] of Object.entries(doc.materials)) {
    if (!v) continue
    const label = copy.materialLabels[k] || k
    const status = copy.materialStatus[v as keyof typeof copy.materialStatus] || v
    lines.push(`${label}: ${status}`)
  }
  if (doc.reviewNotes.length) {
    lines.push('', '— Review flags —')
    for (const n of doc.reviewNotes) {
      lines.push(copy.scopeNotes[n] || n)
    }
  }
  lines.push(
    '',
    'Note: Submitting a brief does not imply payment, scope acceptance, or a confirmed delivery date.',
  )
  return lines.join('\n')
}

export function escapeAttr(s: string): string {
  return escapeText(s)
}
