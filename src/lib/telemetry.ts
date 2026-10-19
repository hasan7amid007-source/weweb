import { inject, track } from '@vercel/analytics'

/** Privacy-friendly Vercel Web Analytics (production only; free tier). */
export function initTelemetry() {
  inject()
}

export function trackEvent(
  name: string,
  data?: Record<string, string | number | boolean | null | undefined>,
) {
  const clean: Record<string, string | number | boolean> = {}
  if (data) {
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined || v === null) continue
      clean[k] = v
    }
  }
  track(name, clean)
}
