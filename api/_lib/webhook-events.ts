/**
 * Webhook event idempotency.
 * Prefer Vercel KV / Upstash REST when env is set; otherwise process memory (soft-launch).
 *
 * Env (either pair):
 * - KV_REST_API_URL + KV_REST_API_TOKEN  (Vercel KV)
 * - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 */

const memory = new Set<string>()
const MEMORY_CAP = 500
const KEY_PREFIX = 'stripe:evt:'
/** Keep processed IDs ~30 days (Stripe retries are far shorter). */
const TTL_SECONDS = 60 * 60 * 24 * 30

type ClaimResult = { status: 'new' | 'duplicate'; backend: 'kv' | 'memory' }

function redisRest(): { url: string; token: string } | null {
  const url = (
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    ''
  ).trim()
  const token = (
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    ''
  ).trim()
  if (!url || !token) return null
  return { url: url.replace(/\/$/, ''), token }
}

function claimMemory(eventId: string): ClaimResult {
  if (memory.has(eventId)) return { status: 'duplicate', backend: 'memory' }
  memory.add(eventId)
  if (memory.size > MEMORY_CAP) {
    const first = memory.values().next().value
    if (first) memory.delete(first)
  }
  return { status: 'new', backend: 'memory' }
}

/**
 * Atomically claim an event id. Returns duplicate if already processed.
 */
export async function claimWebhookEvent(eventId: string): Promise<ClaimResult> {
  const id = eventId.trim()
  if (!id) return { status: 'new', backend: 'memory' }

  const rest = redisRest()
  if (!rest) return claimMemory(id)

  const key = `${KEY_PREFIX}${id}`
  try {
    // SET key 1 NX EX ttl — Upstash / Vercel KV REST
    const res = await fetch(`${rest.url}/set/${encodeURIComponent(key)}/1?NX=true&EX=${TTL_SECONDS}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${rest.token}` },
    })
    if (!res.ok) {
      console.warn('[webhook-events] KV SET failed, falling back to memory', res.status)
      return claimMemory(id)
    }
    const body = (await res.json()) as { result?: string | null }
    // null => key already existed (NX failed) => duplicate
    if (body.result === null) return { status: 'duplicate', backend: 'kv' }
    return { status: 'new', backend: 'kv' }
  } catch (err) {
    console.warn('[webhook-events] KV error, falling back to memory', err)
    return claimMemory(id)
  }
}

/** Release a claim so Stripe can retry after a handler failure. */
export async function releaseWebhookEvent(eventId: string, backend: 'kv' | 'memory'): Promise<void> {
  const id = eventId.trim()
  if (!id) return

  if (backend === 'memory') {
    memory.delete(id)
    return
  }

  const rest = redisRest()
  if (!rest) {
    memory.delete(id)
    return
  }

  const key = `${KEY_PREFIX}${id}`
  try {
    await fetch(`${rest.url}/del/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${rest.token}` },
    })
  } catch (err) {
    console.warn('[webhook-events] KV DEL failed', err)
  }
}
