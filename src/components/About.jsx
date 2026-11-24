import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion, smoothScrub } from '../lib/motion'
import { CalendulaArt, Photo, SplitText, useWordReveal } from './ui'

const PILLARS = [
  { t: 'Our philosophy', d: 'Fewer, better steps. Every product earns its place in a calm, considered daily ritual.' },
  { t: 'Botanical inspiration', d: 'The calendula bloom — its colour, its comfort, its quiet resilience — shapes everything we make.' },
  { t: 'Ingredient selection', d: 'We pair the flower with well-understood companions and leave out what skin doesn’t need.' },
  { t: 'Thoughtful skincare', d: 'Glass packaging, refined formulas and a commitment to doing simple things beautifully.' },
]

export default function About() {
  const root = useRef(null)
  useWordReveal(root)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-about="mask"]', { clipPath: 'circle(12% at 50% 55%)' }, { clipPath: 'circle(80% at 50% 55%)', ease: 'none', scrollTrigger: { trigger: '[data-about="mask"]', start: 'top 85%', end: 'center 45%', scrub: smoothScrub(1) } })
      gsap.fromTo('[data-about="mask"] img', { scale: 1.35 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '[data-about="mask"]', start: 'top bottom', end: 'bottom top', scrub: smoothScrub() } })
      gsap.fromTo('[data-pillar]', { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '[data-pillars]', start: 'top 85%', once: true } })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={root} data-petals className="relative overflow-hidden bg-ivory py-28 md:py-44">
      <div className="gutter grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="relative lg:col-span-6">
          <div data-about="mask" className="relative aspect-[4/5] overflow-hidden rounded-[999px_999px_2.5rem_2.5rem] md:aspect-[5/6]">
            <Photo id="radiance-oil" alt="Calendula Radiance Oil in clear golden glass, with calendula flowers and oil droplets" imgClassName="h-full w-full object-cover" sizes="(max-width: 1024px) 90vw, 45vw" />
          </div>
          <div data-speed="-0.35" className="absolute -bottom-10 -right-2 w-[42%] overflow-hidden rounded-full border-[6px] border-ivory shadow-2xl md:-right-10">
            <Photo id="lip-balm" alt="Calendula Lip Balm in a frosted jar" imgClassName="aspect-square w-full object-cover" sizes="20vw" />
          </div>
          <div data-speed="0.4" className="absolute -left-6 top-10 hidden md:block">
            <CalendulaArt className="h-28 w-28" rings={3} petals={22} />
          </div>
          <p className="eyebrow absolute -left-1 bottom-24 hidden origin-bottom-left -rotate-90 text-charcoal/45 lg:block">Calendula officinalis</p>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <p data-reveal="fade" className="eyebrow mb-6 flex items-center gap-3 text-calendula">
            <span className="h-px w-8 bg-calendula" /> About CALENDRIA
          </p>
          <SplitText data-reveal="words" lines={['Rooted in nature.', '*Refined* by science.']} className="display text-[clamp(2.3rem,4.6vw,4.6rem)] text-botanical" />
          <div data-reveal="fade" className="mt-10 space-y-5 text-[1.02rem] leading-relaxed text-charcoal/70">
            <p>
              At CALENDRIA, we believe beautiful skincare begins with nature. Inspired by the timeless Calendula flower, our philosophy brings botanical beauty and modern skincare thinking together.
            </p>
            <p>Every ritual is designed around simplicity, thoughtful ingredients and the beauty of everyday self-care.</p>
          </div>
          <dl data-pillars className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {PILLARS.map((p, i) => (
              <div key={p.t} data-pillar className="border-t border-charcoal/10 pt-5">
                <dt className="flex items-baseline gap-3">
                  <span className="text-[0.65rem] text-calendula">0{i + 1}</span>
                  <span className="font-serif text-xl italic text-botanical">{p.t}</span>
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-charcoal/60">{p.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
