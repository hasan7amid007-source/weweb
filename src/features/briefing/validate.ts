import type { BriefingFieldDef } from './types'
import { fieldVisible } from './questions'

const URL_RE = /^https?:\/\/[^\s]+$/i
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

export function validateField(
  field: BriefingFieldDef,
  raw: string | string[] | undefined,
  all: Record<string, string | string[]>,
): string | null {
  if (!fieldVisible(field, all)) return null
  const isEmpty =
    raw == null ||
    (typeof raw === 'string' && !raw.trim()) ||
    (Array.isArray(raw) && raw.length === 0)

  if (field.required && isEmpty) return 'required'

  if (isEmpty) return null

  if (typeof raw === 'string') {
    const value = raw.trim()
    if (field.maxLength && value.length > field.maxLength) return 'maxLength'
    if (field.type === 'email' && !value.includes('@')) return 'email'
    if (field.type === 'url' && value && !URL_RE.test(value)) return 'url'
    if (field.type === 'color' && value && !HEX_RE.test(value)) return 'color'
    if (field.options?.length && field.type !== 'checkbox') {
      const allowed = new Set(field.options.map((o) => o.value))
      if (!allowed.has(value)) return 'option'
    }
  }

  if (Array.isArray(raw) && field.options?.length) {
    const allowed = new Set(field.options.map((o) => o.value))
    if (raw.some((v) => !allowed.has(v))) return 'option'
  }

  return null
}

export function validateFields(
  fields: BriefingFieldDef[],
  values: Record<string, string | string[]>,
): { id: string; error: string }[] {
  const errors: { id: string; error: string }[] = []
  for (const field of fields) {
    const err = validateField(field, values[field.id], values)
    if (err) errors.push({ id: field.id, error: err })
  }
  return errors
}
