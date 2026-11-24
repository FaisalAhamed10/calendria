import { useEffect, useRef } from 'react'
import { Eye, Plus } from 'lucide-react'
import { PRODUCTS, formatINR } from '../data/products'
import { useCart } from '../lib/cart'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { flyToBag } from './Overlays'
import { Photo, SplitText, useWordReveal } from './ui'

function ProductCard({ p, i }) {
  const { add, setDetail } = useCart()
  const card = useRef(null)
  const media = useRef(null)
  const shot = useRef(null)

  const onMove = (e) => {
    if (prefersReducedMotion() || e.pointerType === 'touch') return
    const r = media.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    gsap.to(media.current, { rotateY: x * 14, rotateX: -y * 12, duration: 0.8, ease: 'power3.out' })
    gsap.to(shot.current, { x: x * 22, y: y * 16, scale: 1.08, duration: 0.9, ease: 'power3.out' })
  }
  const onLeave = () => {
    gsap.to(media.current, { rotateY: 0, rotateX: 0, duration: 1.1, ease: 'elastic.out(1, 0.6)' })
    gsap.to(shot.current, { x: 0, y: 0, scale: 1, duration: 1.1, ease: 'power3.out' })
  }

  return (
    <article ref={card} data-card className={`group relative ${i % 2 ? 'mt-10 lg:mt-24' : ''}`}>
      <div className="[perspective:1200px]">
        <div
          ref={media}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className="relative overflow-hidden rounded-[1.4rem_1.4rem_1.4rem_4.5rem] bg-beige md:rounded-[2.2rem_2.2rem_2.2rem_9rem] shadow-[0_40px_60px_-45px_rgba(36,61,45,0.45)] transition-shadow duration-700 [transform-style:preserve-3d] group-hover:shadow-[0_60px_90px_-40px_rgba(36,61,45,0.5)]"
        >
          <button onClick={() => setDetail(p.id)} className="block w-full" aria-label={`View ${p.name}`}>
            <div ref={shot} className="will-change-transform">
              <Photo id={p.id} alt={`${p.name}, ${p.size}`} imgClassName="aspect-[4/5] w-full object-cover" sizes="(max-width: 1024px) 48vw, 24vw" />
            </div>
          </button>
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ivory/85 px-2.5 py-1 text-[0.58rem] font-medium tracking-wideish text-botanical md:left-5 md:top-5 md:px-3 md:text-[0.62rem]">
            {p.index}
          </span>
          <div className="absolute bottom-3 right-3 flex translate-y-3 gap-2 opacity-0 md:bottom-4 md:right-4 transition-all duration-700 ease-silk group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
            <button onClick={() => setDetail(p.id)} aria-label={`Quick view ${p.name}`} className="glass-panel inline-flex h-9 w-9 items-center justify-center gap-2 rounded-full text-[0.64rem] font-medium uppercase tracking-wideish text-botanical transition-colors hover:bg-ivory md:h-11 md:w-auto md:px-5">
              <Eye size={14} strokeWidth={1.5} /> <span className="hidden md:inline">Quick view</span>
            </button>
            <button
              onClick={(e) => {
                flyToBag(e.currentTarget, p.id)
                add(p.id, 1)
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-botanical text-ivory transition-colors hover:bg-calendula md:h-11 md:w-11"
              aria-label={`Add ${p.name} to bag`}
            >
              <Plus size={16} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 px-0.5 md:mt-6 md:flex-row md:items-start md:justify-between md:gap-4 md:px-1">
        <div>
          <h3 className="font-serif text-[1.08rem] leading-tight text-botanical md:text-[1.55rem]">
            <button onClick={() => setDetail(p.id)} className="text-left hover:text-calendula">
              {p.name}
            </button>
          </h3>
          <p className="mt-1.5 max-w-[16rem] text-xs leading-relaxed text-charcoal/60 md:mt-2 md:text-sm">{p.description}</p>
        </div>
        <div className="flex flex-none items-baseline gap-2 md:block md:text-right">
          <p className="font-display text-base text-botanical md:text-lg">{formatINR(p.price)}</p>
          <p className="text-[0.7rem] text-charcoal/45 md:text-xs">{p.size}</p>
        </div>
      </div>
    </article>
  )
}

export default function ProductCollection() {
  const root = useRef(null)
  useWordReveal(root)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-card]').forEach((c, i) => {
        gsap.fromTo(
          c,
          { y: 120, opacity: 0, clipPath: 'inset(18% 0 0 0 round 2rem)' },
          { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0 round 0rem)', duration: 1.6, ease: 'expo.out', delay: (i % 4) * 0.1, scrollTrigger: { trigger: c, start: 'top 90%', once: true } }
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="products" ref={root} data-petals className="relative bg-ivory py-28 md:py-40">
      <div className="gutter">
        <div className="mb-16 flex flex-col justify-between gap-8 md:mb-24 md:flex-row md:items-end">
          <div>
            <p data-reveal="fade" className="eyebrow mb-6 flex items-center gap-3 text-calendula">
              <span className="h-px w-8 bg-calendula" /> The collection · 04 rituals
            </p>
            <SplitText data-reveal="words" lines={['The botanical', '*ritual.*']} className="display offset-last text-[clamp(2.6rem,6.6vw,6.6rem)] text-botanical" />
          </div>
          <p data-reveal="fade" className="max-w-sm leading-relaxed text-charcoal/65">
            Four essentials, one flower. Each formula is built around calendula and finished in amber and ivory glass with a champagne-gold touch.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-y-16">
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.id} p={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
