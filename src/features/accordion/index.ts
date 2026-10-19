import { trackEvent } from '../../lib/telemetry'

export function initAccordions(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-accordion]').forEach((group) => {
    const trackName = group.dataset.trackOpen
    group.querySelectorAll('details').forEach((item) => {
      item.addEventListener('toggle', () => {
        if (!item.open) return
        group.querySelectorAll('details').forEach((other) => {
          if (other !== item) other.open = false
        })
        if (trackName) {
          const summary = item.querySelector('summary')?.textContent?.trim().slice(0, 80)
          trackEvent(trackName, { q: summary || 'open' })
        }
      })
    })
  })
}
