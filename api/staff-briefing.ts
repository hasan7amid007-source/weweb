import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  durableStoreConfigured,
  getBriefingByReference,
} from './_lib/briefing-store.js'
import { requireStaffAuth } from './_lib/staff-auth.js'

function applySensitiveHeaders(res: VercelResponse): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  res.setHeader('Referrer-Policy', 'no-referrer')
}

/**
 * Authorized staff read of a durable briefing.
 * GET /api/staff-briefing?ref=BRF_…
 * Auth: Authorization: Bearer <BRIEFING_STAFF_TOKEN> (or x-bditec-staff-token)
 *
 * A briefing reference alone never grants access.
 * robots noindex / X-Robots-Tag are NOT access control.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySensitiveHeaders(res)

  // Reject staff/customer secrets if someone put them in the query string
  const q = req.query
  if (q.token != null || q.accessToken != null || q.staffToken != null) {
    return res.status(400).json({
      ok: false,
      error: 'Secrets must not be sent in the query string',
    })
  }

  if (req.method === 'OPTIONS') {
    // No credentialed CORS surface: preflight is not an authenticated data path
    res.setHeader('Allow', 'GET, OPTIONS')
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  // Every data request: authorize before store or ref validation that could leak existence
  const auth = requireStaffAuth(req)
  if (!auth.ok) {
    return res.status(auth.status).json({ ok: false, error: auth.error })
  }

  const ref = String(req.query.ref || '').trim()
  if (!ref || !ref.startsWith('BRF_') || ref.length > 48) {
    return res.status(400).json({ ok: false, error: 'Valid briefing reference required' })
  }

  if (!durableStoreConfigured()) {
    return res.status(503).json({
      ok: false,
      error: 'Briefing store unavailable',
    })
  }

  const record = await getBriefingByReference(ref)
  if (!record) {
    // Log ref only (ops); never token, email, or payload
    console.info(JSON.stringify({ event: 'staff_briefing_not_found', referenceId: ref }))
    return res.status(404).json({ ok: false, error: 'Briefing not found or expired' })
  }

  console.info(
    JSON.stringify({
      event: 'staff_briefing_retrieved',
      referenceId: record.referenceId,
      service: record.service,
      packageId: record.packageId || null,
    }),
  )

  // Never return accessTokenHash — staff need payload, not customer checkout credential
  const { accessTokenHash: _omit, ...safe } = record
  void _omit
  return res.status(200).json({
    ok: true,
    briefing: safe,
  })
}
