import { inject } from '@vercel/analytics'

/** Privacy-friendly Vercel Web Analytics (production only; free tier). */
export function initTelemetry() {
  inject()
}
