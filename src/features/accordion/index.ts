export function initAccordions(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-accordion]').forEach((group) => {
    group.querySelectorAll('details').forEach((item) => {
      item.addEventListener('toggle', () => {
        if (!item.open) return
        group.querySelectorAll('details').forEach((other) => {
          if (other !== item) other.open = false
        })
      })
    })
  })
}
