import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { SplitText, Stars, useWordReveal } from './ui'

const REVIEWS = [
  { name: 'Ananya R.', city: 'Bengaluru', product: 'Glow Serum', n: 5, text: 'Three drops in the morning and my skin looks rested even when I’m not. The amber bottle on my shelf feels like a little ritual of its own.' },
  { name: 'Meera K.', city: 'Chennai', product: 'Repair Cream', n: 5, text: 'Rich without ever feeling heavy. My skin feels comfortable all day, even under the office air-conditioning. Genuinely a forever product.' },
  { name: 'Isha P.', city: 'Mumbai', product: 'Gentle Cleanser', n: 5, text: 'Finally a cleanser that doesn’t leave my face tight. The golden gel and the soft, warm scent make night-time feel like a pause.' },
  { name: 'Rohan S.', city: 'Pune', product: 'Radiance Oil', n: 4, text: 'I was nervous about face oil, but this sinks in quickly and leaves a healthy sheen — not grease. A drop mixed into moisturiser is perfect.' },
  { name: 'Kavya N.', city: 'Hyderabad', product: 'Glow Serum', n: 5, text: 'The packaging alone is a gift, but it’s the texture that won me over. Light, silky and layers beautifully under sunscreen.' },
  { name: 'Aditi M.', city: 'Delhi', product: 'Repair Cream', n: 5, text: 'My winter rescue. The calendula cream calmed the dry patches on my cheeks and smells faintly of sunshine. I’ve already reordered.' },
]

export default function Testimonials() {
  const root = useRef(null)
  const track = useRef(null)
  const [index, setIndex] = useState(0)
  const [perView, setPerView] = useState(3)
  useWordReveal(root)

  useEffect(() => {
    const on = () => setPerView(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3)
    on()
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  const max = Math.max(0, REVIEWS.length - perView)
  const go = useCallback((i) => setIndex(Math.max(0, Math.min(max, i))), [max])

  useEffect(() => {
    if (!track.current) return
    const card = track.current.children[0]
    const gap = parseFloat(getComputedStyle(track.current).columnGap) || 24
    const x = -(card.offsetWidth + gap) * Math.min(index, max)
    gsap.to(track.current, { x, duration: prefersReducedMotion() ? 0 : 1.2, ease: 'expo.out' })
    Array.from(track.current.children).forEach((c, i) => {
      const visible = i >= index && i < index + perView
      gsap.to(c, { opacity: visible ? 1 : 0.35, scale: visible ? 1 : 0.94, duration: 0.9, ease: 'expo.out' })
    })
  }, [index, perView, max])

  // drag / swipe
  const drag = useRef(null)
  const onDown = (e) => (drag.current = { x: e.clientX })
  const onUp = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1))
    drag.current = null
  }

  return (
    <section ref={root} data-petals className="relative overflow-hidden bg-beige/50 py-28 md:py-40" aria-label="Customer reviews">
      <div className="gutter">
        <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p data-reveal="fade" className="eyebrow mb-6 flex items-center gap-3 text-calendula">
              <span className="h-px w-8 bg-calendula" /> Customer experience · 4.9 / 5
            </p>
            <SplitText data-reveal="words" lines={['The beauty ritual,', '*reimagined.*']} className="display offset-last text-[clamp(2.4rem,5.6vw,5.6rem)] text-botanical" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous reviews" className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-charcoal/20 transition-colors duration-500 hover:bg-botanical hover:text-ivory disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-charcoal">
              <ArrowLeft size={18} strokeWidth={1.4} />
            </button>
            <button onClick={() => go(index + 1)} disabled={index >= max} aria-label="Next reviews" className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-charcoal/20 transition-colors duration-500 hover:bg-botanical hover:text-ivory disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-charcoal">
              <ArrowRight size={18} strokeWidth={1.4} />
            </button>
          </div>
        </div>

        <div className="overflow-visible" onPointerDown={onDown} onPointerUp={onUp} onPointerLeave={() => (drag.current = null)} style={{ touchAction: 'pan-y' }}>
          <ul ref={track} className="flex cursor-grab gap-6 active:cursor-grabbing">
            {REVIEWS.map((r, i) => (
              <li key={r.name} className="flex w-full flex-none select-none flex-col rounded-[2rem] bg-ivory p-8 shadow-[0_30px_60px_-45px_rgba(36,61,45,0.4)] sm:w-[calc((100%-1.5rem)/2)] md:p-10 lg:w-[calc((100%-3rem)/3)]" aria-hidden={i < index || i >= index + perView}>
                <div className="flex items-center justify-between">
                  <Stars n={r.n} />
                  <Quote size={28} strokeWidth={1} className="text-champagne" />
                </div>
                <blockquote className="mt-8 flex-1 font-serif text-[1.45rem] italic leading-snug text-botanical">“{r.text}”</blockquote>
                <div className="mt-10 flex items-center gap-4 border-t border-charcoal/10 pt-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-marigold to-calendula font-display text-sm text-ivory">{r.name[0]}</span>
                  <div>
                    <p className="text-sm font-medium text-charcoal">{r.name}</p>
                    <p className="text-xs text-charcoal/50">
                      {r.city} · {r.product}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex justify-center gap-2" role="tablist" aria-label="Review pages">
          {Array.from({ length: max + 1 }, (_, i) => (
            <button key={i} role="tab" aria-selected={i === index} aria-label={`Show reviews from ${i + 1}`} onClick={() => go(i)} className={`h-1.5 rounded-full transition-all duration-700 ease-silk ${i === index ? 'w-10 bg-calendula' : 'w-4 bg-charcoal/20'}`} />
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-charcoal/45">Sample reviews from fictional customers, for demonstration.</p>
      </div>
    </section>
  )
}
