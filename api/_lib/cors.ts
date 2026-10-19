import type { VercelRequest, VercelResponse } from '@vercel/node'

const STATIC_ALLOWED = new Set([
  'https://weweb-weld.vercel.app',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://127.0.0.1:4173',
  'http://localhost:4173',
])

/** Preview deployments: weweb-*-hh-7.vercel.app */
const PREVIEW_RE = /^https:\/\/weweb(?:-[a-z0-9-]+)?-hh-7\.vercel\.app$/i

export function allowedOrigins(): Set<string> {
  const set = new Set(STATIC_ALLOWED)
  const site = (process.env.SITE_ORIGIN || '').trim().replace(/\/$/, '')
  if (site.startsWith('http')) set.add(site)
  return set
}

export function isAllowedOrigin(origin: string): boolean {
  const o = origin.trim().replace(/\/$/, '')
  if (!o) return false
  if (allowedOrigins().has(o)) return true
  return PREVIEW_RE.test(o)
}

/**
 * Apply CORS for browser POSTs. Returns false if Origin is present and not allowed.
 */
export function applyApiCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = String(req.headers.origin || '').trim()
  if (!origin) {
    // Same-origin / non-browser: no CORS headers required
    return true
  }
  if (!isAllowedOrigin(origin)) {
    return false
  }
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  return true
}

export function safeSameSiteUrl(candidate: string | undefined, fallback: string): string {
  const raw = (candidate || '').trim()
  if (!raw) return fallback
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return fallback
    const origin = `${u.protocol}//${u.host}`
    if (!isAllowedOrigin(origin)) return fallback
    return u.toString()
  } catch {
    return fallback
  }
}
