/** Home hero copy carousel — continuous autoplay loop (triangle bg is persistent). */

const SLIDE_MS = 4000
const EASE_OUT = 'cubic-bezier(0.19, 1, 0.22, 1)'
const EASE_IO = 'cubic-bezier(0.645, 0.045, 0.355, 1)'
const EASE_IN = 'cubic-bezier(0.55, 0.055, 0.675, 0.19)'

export function initShowcase(root: HTMLElement) {
  const slider = root.querySelector<HTMLElement>('.site-hero')
  if (!slider) return

  const slides = [...slider.querySelectorAll<HTMLElement>('.hero-slide')]
  if (slides.length < 2) return

  let index = 0
  let timer = 0
  let busy = false
  let queued: { next: number; dir: number } | null = null

  const playEnter = (slide: HTMLElement) => {
    slide.querySelectorAll<HTMLElement>('[data-enter]').forEach((el) => {
      el.classList.remove('is-in')
      void el.offsetWidth
      el.classList.add('is-in')
    })
  }

  const schedule = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => show(index + 1, 1), SLIDE_MS)
  }

  const show = (next: number, dir = 1) => {
    if (busy) {
      queued = { next, dir }
      return
    }
    const target = ((next % slides.length) + slides.length) % slides.length
    if (target === index && slides[index]?.classList.contains('is-active')) {
      schedule()
      return
    }
    busy = true
    queued = null
    const prev = slides[index]
    const curr = slides[target]
    index = target

    if (prev && prev !== curr) {
      prev.classList.add('is-leaving')
      prev.classList.remove('is-active')
      prev.style.setProperty('--leave-x', dir > 0 ? '-28px' : '28px')
    }

    curr.hidden = false
    curr.setAttribute('aria-hidden', 'false')
    curr.classList.remove('is-leaving')
    curr.classList.add('is-active')
    playEnter(curr)

    window.setTimeout(() => {
      slides.forEach((s, i) => {
        if (i !== index) {
          s.hidden = true
          s.setAttribute('aria-hidden', 'true')
          s.classList.remove('is-leaving', 'is-active')
          s.querySelectorAll('.is-in').forEach((n) => n.classList.remove('is-in'))
        }
      })
      busy = false
      if (queued) {
        const q = queued
        queued = null
        show(q.next, q.dir)
        return
      }
      schedule()
    }, 700)
  }

  let touchX = 0
  slider.addEventListener(
    'touchstart',
    (e) => {
      touchX = e.changedTouches[0]?.clientX ?? 0
    },
    { passive: true },
  )
  slider.addEventListener(
    'touchend',
    (e) => {
      const x = e.changedTouches[0]?.clientX ?? 0
      const dx = x - touchX
      if (Math.abs(dx) < 48) return
      show(dx < 0 ? index + 1 : index - 1, dx < 0 ? 1 : -1)
    },
    { passive: true },
  )

  slider.style.setProperty('--ease-out', EASE_OUT)
  slider.style.setProperty('--ease-io', EASE_IO)
  slider.style.setProperty('--ease-in', EASE_IN)

  slides.forEach((s, i) => {
    s.hidden = i !== 0
    s.setAttribute('aria-hidden', String(i !== 0))
  })
  slides[0]?.classList.add('is-active')
  playEnter(slides[0]!)
  schedule()
}
