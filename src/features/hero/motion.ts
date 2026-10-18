/**
 * Triangles Animation hero background.
 * Adapted from Lindsay Grizzard “Triangles Animation” (CodePen qRZZmX)
 * via https://freefrontend.com/css-triangle-backgrounds/#triangles-animation-l
 * Restyled to BDITEC palette; drift group ids renamed to avoid clashing with #top.
 *
 * JS drives the main mesh so motion still runs when OS “reduce motion” is on
 * (decorative hero; user-requested animation).
 */
export { triangleHeroSvg } from './svg'

type LayerSpec = {
  id: string
  ampX: number
  ampY: number
  rot: number
  period: number
  phase: number
}

const LAYERS: LayerSpec[] = [
  { id: 'base0', ampX: 34, ampY: -26, rot: 1.1, period: 9000, phase: 0 },
  { id: 'base1', ampX: -40, ampY: 24, rot: -0.9, period: 12000, phase: 1.2 },
  { id: 'base2', ampX: 26, ampY: 32, rot: 0.7, period: 10000, phase: 2.1 },
  { id: 'tri-drift-far', ampX: 70, ampY: -48, rot: 0, period: 8000, phase: 0.4 },
  { id: 'tri-drift-near', ampX: -78, ampY: 54, rot: 0, period: 6500, phase: 1.6 },
  { id: 'tri-drift-top', ampX: 88, ampY: -28, rot: 0, period: 7500, phase: 0.8 },
  { id: 'tri-drift-bottom', ampX: -48, ampY: 68, rot: 0, period: 9500, phase: 2.4 },
]

export function initTriangleMotion(root: ParentNode = document): () => void {
  const svg = root.querySelector('.tri-hero-svg')
  if (!(svg instanceof SVGElement)) return () => {}

  svg.classList.add('is-js-motion')

  const nodes = LAYERS.map((spec) => {
    const el = svg.querySelector(`#${spec.id}`)
    return el instanceof SVGGElement ? { el, spec } : null
  }).filter((n): n is { el: SVGGElement; spec: LayerSpec } => n !== null)

  if (!nodes.length) return () => {}

  let raf = 0
  const t0 = performance.now()

  const tick = (now: number) => {
    const t = now - t0
    for (const { el, spec } of nodes) {
      // Smooth ping-pong via cosine (0 → 1 → 0)
      const u = (1 - Math.cos((t / spec.period) * Math.PI * 2 + spec.phase)) / 2
      const x = spec.ampX * u
      const y = spec.ampY * u
      const r = spec.rot * u
      el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${r.toFixed(3)}deg)`
    }
    // Whole SVG soft breathe
    const breathe = (1 - Math.cos((t / 11000) * Math.PI * 2)) / 2
    svg.style.transform = `translate(${(-4 * breathe).toFixed(2)}%, ${(2 * breathe).toFixed(2)}%) scale(${(1 + 0.045 * breathe).toFixed(4)})`
    raf = requestAnimationFrame(tick)
  }

  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    svg.classList.remove('is-js-motion')
    svg.style.transform = ''
    for (const { el } of nodes) el.style.transform = ''
  }
}
