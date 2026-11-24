import { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { RITUAL_STEPS } from '../data/products'
import { useCart } from '../lib/cart'
import { gsap, prefersReducedMotion, useReducedMotion } from '../lib/motion'
import { CalendulaArt, Photo } from './ui'

const MASKS = [
  '50% 50% 46% 54% / 60% 58% 42% 40%',
  '999px 999px 2rem 2rem',
  '2rem 9rem 2rem 9rem',
  '58% 42% 50% 50% / 46% 52% 48% 54%',
  '999px',
  '9rem 2rem 9rem 2rem',
]

/** Horizontal showcase of the full ritual, driven by vertical scroll. */
export default function RitualScroll() {
  const root = useRef(null)
  const track = useRef(null)
  const { setDetail } = useCart()
  const reduced = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      // same pinned, scroll-driven horizontal journey on every screen size
      mm.add('all', () => {
        const distance = () => track.current.scrollWidth - window.innerWidth
        const tween = gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1, fastScrollEnd: true },
        })
        gsap.to('[data-progress]', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${distance()}`, scrub: true } })
        gsap.utils.toArray('[data-panel]').forEach((panel) => {
          const im = panel.querySelector('[data-img]')
          const inner = panel.querySelector('[data-img] img')
          gsap.fromTo(im, { scale: 0.86, opacity: 0.4 }, { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left 100%', end: 'left 45%', scrub: true } })
          if (inner) gsap.fromTo(inner, { scale: 1.3, xPercent: 8 }, { scale: 1, xPercent: -8, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
          gsap.fromTo(panel.querySelector('[data-num]'), { xPercent: 40 }, { xPercent: -40, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div className="pin-host">
      <section ref={root} data-petals className={`relative bg-botanical text-ivory ${reduced ? 'overflow-x-auto py-24' : 'h-[100svh] min-h-[600px] overflow-hidden'}`} aria-label="The complete calendula ritual">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(ellipse_at_80%_20%,rgba(200,165,106,0.22),transparent_55%),radial-gradient(ellipse_at_10%_90%,rgba(229,138,53,0.14),transparent_50%)]" />
      <div className={`absolute inset-x-[var(--gutter)] bottom-6 z-10 h-px bg-ivory/15 md:bottom-8 ${reduced ? 'hidden' : ''}`}>
        <div data-progress className="h-full origin-left scale-x-0 bg-champagne" />
      </div>
      <div ref={track} className="relative flex h-full w-max items-center gap-10 pl-[var(--gutter)] pt-14 will-change-transform md:gap-[6vw] md:pt-0">
        {/* intro panel */}
        <div className="flex w-[80vw] flex-none flex-col justify-center md:w-[38vw]">
          <p className="eyebrow mb-6 text-champagne">The daily ritual</p>
          <h2 className="display text-[clamp(2.6rem,6vw,6rem)] text-ivory">
            Six steps.
            <br />
            <span className="italic-accent text-marigold">One flower.</span>
          </h2>
          <p className="mt-6 max-w-sm leading-relaxed text-ivory/70 md:mt-8">
            From a golden morning cleanse to a honeyed lip balm at dusk — scroll through the full CALENDRIA ritual.
          </p>
          <CalendulaArt className="mt-8 h-16 w-16 text-champagne spin-slow md:mt-10 md:h-20 md:w-20" strokeOnly rings={2} />
          <p className="eyebrow mt-8 flex items-center gap-3 text-[0.6rem] text-ivory/50">
            Keep scrolling <ArrowRight size={12} strokeWidth={1.5} />
          </p>
        </div>

        {RITUAL_STEPS.map((s, i) => (
          <article key={s.id} data-panel className="relative flex w-[min(72vw,20rem)] flex-none flex-col md:w-auto md:flex-row md:items-end md:gap-8">
            <span data-num className="pointer-events-none absolute -top-12 right-0 font-display text-[6rem] leading-none text-ivory/[0.07] md:-top-24 md:text-[14rem]" aria-hidden="true">
              0{i + 1}
            </span>
            <div data-img className="relative aspect-[4/5] max-h-[44svh] w-full overflow-hidden will-change-transform md:h-[62vh] md:max-h-none md:w-auto" style={{ borderRadius: MASKS[i] }}>
              <Photo id={s.id} alt={s.name} eager imgClassName="h-full w-full object-cover" sizes="(max-width: 768px) 82vw, 30vw" />
            </div>
            <div className="mt-5 md:mb-4 md:mt-0 md:w-56 md:flex-none">
              <p className="eyebrow text-champagne">
                0{i + 1} · {s.time}
              </p>
              <h3 className="mt-2 font-display text-2xl uppercase text-ivory md:mt-3 md:text-3xl">{s.step}</h3>
              <p className="mt-1 font-serif text-lg italic text-marigold">{s.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-ivory/65 md:mt-3">{s.text}</p>
              {s.soon ? (
                <span className="mt-5 inline-block rounded-full border border-ivory/20 px-4 py-2 text-[0.62rem] uppercase tracking-wideish text-ivory/60">Coming soon</span>
              ) : (
                <button onClick={() => setDetail(s.id)} className="ulink mt-5 inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-wideish text-ivory">
                  Discover <ArrowRight size={13} strokeWidth={1.5} />
                </button>
              )}
            </div>
          </article>
        ))}
        <div className="w-[12vw] flex-none md:w-[8vw]" aria-hidden="true" />
      </div>
    </section>
    </div>
  )
}
