import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion, smoothScrub } from '../lib/motion'
import { CalendulaArt, PetalSVG, Photo, SplitText, useWordReveal } from './ui'

/**
 * A golden-hour editorial spread: deep botanical green, shafts of sunlight,
 * framed product photographs and oversized calendula blooms in soft focus.
 */
export default function Campaign() {
  const root = useRef(null)
  useWordReveal(root, { start: 'top 75%' })

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-cp="frame"]', { clipPath: 'inset(30% 30% 30% 30% round 999px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px)', ease: 'none', stagger: 0.1, scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'center 50%', scrub: smoothScrub(1) } })
      gsap.to('[data-cp="sun"]', { rotate: 18, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: smoothScrub() } })
      gsap.utils.toArray('[data-cp="petal"]').forEach((p, i) => {
        gsap.fromTo(p, { y: 120 + i * 40, rotate: i * 40 }, { y: -160 - i * 30, rotate: i * 40 + 160, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: smoothScrub() } })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} data-petals className="relative overflow-hidden bg-[#1d3325] py-28 text-ivory md:py-40" aria-label="Campaign">
      {/* sunlight */}
      <div data-cp="sun" className="pointer-events-none absolute -right-[20%] -top-[30%] h-[140%] w-[90%] origin-top-right opacity-70 [background:repeating-linear-gradient(105deg,transparent_0_4vw,rgba(242,177,59,0.12)_4vw_7vw,transparent_7vw_12vw)] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[8%] top-[6%] h-[50vh] w-[50vh] rounded-full bg-[radial-gradient(circle,rgba(242,177,59,0.45),rgba(229,138,53,0.12)_45%,transparent_70%)]" aria-hidden="true" />
      <CalendulaArt className="pointer-events-none absolute -bottom-40 -left-40 h-72 w-72 opacity-30 md:h-[34rem] md:w-[34rem] md:opacity-40" rings={4} petals={30} />
      <CalendulaArt data-speed="0.5" className="pointer-events-none absolute right-[-6rem] top-[40%] h-40 w-40 opacity-40 will-change-transform md:h-80 md:w-80 md:opacity-50" rings={3} petals={24} />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} data-cp="petal" className="pointer-events-none absolute will-change-transform" style={{ left: `${10 + i * 19}%`, top: `${30 + (i % 3) * 18}%` }} aria-hidden="true">
          <PetalSVG className={`${i % 2 ? 'w-10 opacity-70' : 'w-16 opacity-90'}`} />
        </div>
      ))}

      <div className="gutter relative">
        <p data-reveal="fade" className="eyebrow mb-8 text-champagne">
          The campaign · Golden hour, Chennai
        </p>
        <SplitText data-reveal="words" lines={['Beauty, in its', 'most *natural*', 'form.']} className="display offset-last relative z-10 text-[clamp(2.8rem,8.2vw,8.8rem)] text-ivory" />

        <div className="relative mt-16 grid grid-cols-12 items-end gap-4 md:-mt-24">
          <div className="col-span-7 col-start-1 md:col-span-4 md:col-start-6">
            <div data-cp="frame" className="overflow-hidden rounded-[999px_999px_1.5rem_1.5rem] shadow-[0_50px_80px_-30px_rgba(0,0,0,0.6)]">
              <Photo id="repair-cream" alt="Calendula Repair Cream in golden light" imgClassName="aspect-[3/4] w-full object-cover" sizes="(max-width: 768px) 60vw, 30vw" />
            </div>
          </div>
          <div data-speed="-0.3" className="col-span-5 md:col-span-3 md:col-start-10 md:mb-24">
            <div data-cp="frame" className="overflow-hidden rounded-full border border-champagne/40 p-2">
              <Photo id="exfoliating-scrub" alt="Calendula Exfoliating Scrub with calendula blooms" imgClassName="aspect-square w-full rounded-full object-cover" sizes="25vw" />
            </div>
            <p className="mt-4 font-serif text-lg italic text-champagne">Petals, grains & golden light.</p>
          </div>
          <div className="col-span-12 mt-10 md:col-span-4 md:col-start-1 md:row-start-1 md:mt-0 md:pb-10">
            <p data-reveal="fade" className="max-w-xs leading-relaxed text-ivory/70">
              Sunlight through petals. Skin left to be itself. Our campaign celebrates the simple luxury of a botanical ritual — warm, unhurried, honest.
            </p>
            <div data-reveal="fade" className="mt-8 flex items-center gap-4">
              <span className="h-px w-12 bg-champagne" />
              <span className="eyebrow text-[0.6rem] text-ivory/60">Season 01 · 2026</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
