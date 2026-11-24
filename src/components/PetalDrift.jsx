import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/motion'
import { PetalSVG } from './ui'

/**
 * A light veil of calendula petals that sweeps across the viewport each time
 * the visitor crosses into a new chapter (any section with data-petals).
 */
export default function PetalDrift() {
  const root = useRef(null)
  useEffect(() => {
    if (prefersReducedMotion()) return
    const petals = Array.from(root.current.children)
    let last = 0
    const sweep = (dir) => {
      const now = performance.now()
      if (now - last < 1400) return
      last = now
      const W = window.innerWidth
      const H = window.innerHeight
      petals.forEach((p, i) => {
        const startX = dir > 0 ? -80 - Math.random() * W * 0.3 : W + 80 + Math.random() * W * 0.3
        const endX = dir > 0 ? W + 120 : -120
        const y0 = H * (0.15 + Math.random() * 0.85)
        gsap.killTweensOf(p)
        gsap.set(p, { x: startX, y: y0, rotate: Math.random() * 360, opacity: 0, scale: 0.5 + Math.random() * 0.9 })
        gsap
          .timeline({ delay: i * 0.06 + Math.random() * 0.2 })
          .to(p, { opacity: 0.95, duration: 0.3 })
          .to(p, { x: endX, duration: 2.4 + Math.random() * 1.4, ease: 'power1.inOut' }, 0)
          .to(p, { y: y0 - H * (0.25 + Math.random() * 0.45), duration: 2.6 + Math.random(), ease: 'sine.inOut' }, 0)
          .to(p, { rotate: `+=${(Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360)}`, duration: 3, ease: 'none' }, 0)
          .to(p, { opacity: 0, duration: 0.5 }, '-=0.6')
      })
    }
    const triggers = Array.from(document.querySelectorAll('[data-petals]')).map((el) =>
      ScrollTrigger.create({ trigger: el, start: 'top 70%', onEnter: () => sweep(1), onEnterBack: () => sweep(-1) })
    )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <PetalSVG key={i} className="absolute left-0 top-0 w-12 opacity-0 will-change-transform md:w-16" />
      ))}
    </div>
  )
}
