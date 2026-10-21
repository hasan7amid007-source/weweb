import { timingSafeEqual } from 'node:crypto'
import type { VercelRequest } from '@vercel/node'

/**
 * Soft-launch staff gate: shared secret in BRIEFING_STAFF_TOKEN.
 * Not a full IdP — project has no authenticated app surface yet.
 * A briefing reference alone must never authorize access.
 *
 * Limitations (ops):
 * - Anyone with the shared token can read any briefing by reference
 * - No per-user identity in audit logs
 * - Rotate by replacing the env var and redeploying; force Logout on clients
 * - noindex / robots Disallow are not authentication
 */
const MIN_TOKEN_LEN = 24

export function staffTokenConfigured(): boolean {
  const t = (process.env.BRIEFING_STAFF_TOKEN || '').trim()
  return t.length >= MIN_TOKEN_LEN
}

function extractBearer(req: VercelRequest): string {
  const h = String(req.headers.authorization || '').trim()
  if (h.toLowerCase().startsWith('bearer ')) {
    return h.slice(7).trim()
  }
  // Header alternative for tools that avoid Authorization (still not the briefing ref)
  return String(req.headers['x-bditec-staff-token'] || '').trim()
}

function safeEqualUtf8(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8')
  const bb = Buffer.from(b, 'utf8')
  if (ba.length !== bb.length) return false
  try {
    return timingSafeEqual(ba, bb)
  } catch {
    return false
  }
}

export type StaffAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; error: string }

/**
 * Require staff secret. Never treat briefingRef / customer accessToken as staff credentials.
 * Fail closed when unset or too short.
 */
export function requireStaffAuth(req: VercelRequest): StaffAuthResult {
  if (!staffTokenConfigured()) {
    return {
      ok: false,
      status: 503,
      error: 'Staff briefing access is not configured',
    }
  }
  const expected = (process.env.BRIEFING_STAFF_TOKEN || '').trim()
  const provided = extractBearer(req)
  if (!provided || provided.length < MIN_TOKEN_LEN || !safeEqualUtf8(provided, expected)) {
    return {
      ok: false,
      status: 401,
      error: 'Staff authentication required',
    }
  }
  return { ok: true }
}
