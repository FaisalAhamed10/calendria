import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Plus } from 'lucide-react'
import Stage from '../three/Stage'
import Calendula from '../three/Calendula'
import { FloatingPetals, Studio } from '../three/Studio'
import { pointer, useMobile } from '../lib/motion'
import { CalendulaArt, SplitText, useWordReveal } from './ui'

const SPOTS = [
  {
    id: 'petals',
    label: 'Calendula petals',
    pos: { x: 76, y: 24 },
    kicker: 'Botanical inspiration',
    title: 'Sun-hued ray petals',
    body: 'Each bloom carries dozens of narrow, saffron-to-gold petals. Their warm pigments come from naturally occurring carotenoids — the inspiration for our amber palette and glow-giving rituals.',
    fact: 'Hand-harvested at full bloom, mid-morning',
  },
  {
    id: 'extracts',
    label: 'Botanical extracts',
    pos: { x: 22, y: 34 },
    kicker: 'Extraction story',
    title: 'Slow, cold infusion',
    body: 'Petals are gently dried, then steeped at low temperature for weeks rather than hours — a patient method chosen to keep the flower’s delicate character intact.',
    fact: 'Six-week cold infusion',
  },
  {
    id: 'center',
    label: 'Flower centre',
    pos: { x: 50, y: 52 },
    kicker: 'Skin-conditioning properties',
    title: 'The resinous heart',
    body: 'The disc florets at the centre hold the most aromatic, resin-rich part of the bloom. In our formulas this translates to a comforting, conditioning feel on the skin.',
    fact: 'Traditionally prized for comfort',
  },
  {
    id: 'oils',
    label: 'Natural oils',
    pos: { x: 24, y: 76 },
    kicker: 'Naturally inspired formulation',
    title: 'Sun-infused oils',
    body: 'Calendula is macerated in light, skin-loving oils such as jojoba and sunflower. The result is a silky golden infusion that softens and helps skin feel supple.',
    fact: 'Jojoba · Sunflower · Rosehip',
  },
  {
    id: 'actives',
    label: 'Skincare ingredients',
    pos: { x: 74, y: 76 },
    kicker: 'Modern skincare thinking',
    title: 'Paired with science',
    body: 'We pair the flower with well-understood companions — niacinamide, ceramides, squalane — so each ritual feels botanical yet behaves like modern skincare.',
    fact: 'Thoughtfully minimal formulas',
  },
]

function Bloom({ mobile }) {
  const g = useRef()
  const ctl = useMemo(() => ({ open: 1, spin: 0.05, breathe: 1 }), [])
  useFrame((_, dt) => {
    if (!g.current) return
    const k = Math.min(1, dt * 2.5)
    g.current.rotation.x += (Math.PI / 2 - 0.12 + pointer.y * 0.12 - g.current.rotation.x) * k
    g.current.rotation.z += (-pointer.x * 0.14 - g.current.rotation.z) * k
  })
  return (
    <>
      <Studio intensity={1.05} />
      <group ref={g} scale={mobile ? 1.35 : 1.55} position={[0, -0.05, 0]}>
        <Calendula control={ctl} quality={mobile ? 'low' : 'high'} />
      </group>
      <FloatingPetals count={mobile ? 8 : 14} area={[7, 5, 2]} speed={0.5} />
    </>
  )
}

export default function Ingredients() {
  const root = useRef(null)
  const mobile = useMobile()
  const [active, setActive] = useState('center')
  const spot = SPOTS.find((s) => s.id === active)
  useWordReveal(root)

  return (
    <section id="ingredients" ref={root} data-petals className="relative overflow-hidden bg-beige/40 py-28 md:py-40">
      <CalendulaArt className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] text-champagne/40" strokeOnly rings={2} />
      <div className="gutter relative">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p data-reveal="fade" className="eyebrow mb-6 flex items-center gap-3 text-calendula">
              <span className="h-px w-8 bg-calendula" /> Ingredient story
            </p>
            <SplitText data-reveal="words" lines={['The power of', 'a single *flower.*']} className="display offset-last text-[clamp(2.6rem,6.6vw,6.6rem)] text-botanical" />
          </div>
          <p data-reveal="fade" className="self-end leading-relaxed text-charcoal/70 md:col-span-4 md:col-start-9">
            Calendula officinalis — the marigold of old apothecary gardens. Explore the bloom: every part of the flower informs how we formulate.
          </p>
        </div>

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-12">
          {/* 3D bloom + hotspots */}
          <div className="relative mx-auto aspect-square w-full max-w-[680px] lg:col-span-7">
            <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,#fff8ea,rgba(248,244,236,0)_70%)]" />
            <Stage className="absolute inset-0" camera={{ position: [0, 0, 6], fov: 35 }} fallback={<CalendulaArt className="absolute inset-[10%]" rings={4} petals={28} title="Calendula flower" />}>
              <Bloom mobile={mobile} />
            </Stage>
            {SPOTS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                onMouseEnter={() => !mobile && setActive(s.id)}
                aria-pressed={active === s.id}
                aria-label={`${s.label}: show details`}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${s.pos.x}%`, top: `${s.pos.y}%` }}
              >
                <span className={`absolute inset-0 rounded-full bg-ivory/70 ${active === s.id ? '' : 'animate-ping'}`} style={{ animationDuration: `${2.4 + i * 0.3}s` }} />
                <span
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-500 md:h-11 md:w-11 ${
                    active === s.id ? 'scale-110 border-botanical bg-botanical text-ivory' : 'border-ivory/80 bg-ivory/60 text-botanical group-hover:bg-ivory'
                  }`}
                >
                  <Plus size={16} strokeWidth={1.5} className={`transition-transform duration-500 ${active === s.id ? 'rotate-45' : ''}`} />
                </span>
                <span className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-ivory/80 px-2 py-0.5 text-[0.5rem] font-medium uppercase tracking-[0.18em] text-botanical md:mt-2 md:bg-transparent md:px-0 md:text-[0.58rem] md:tracking-luxe">{s.label}</span>
              </button>
            ))}
          </div>

          {/* info panel */}
          <div className="lg:col-span-5">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Flower parts">
              {SPOTS.map((s) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={active === s.id}
                  onClick={() => setActive(s.id)}
                  className={`rounded-full border px-4 py-2 text-[0.68rem] uppercase tracking-wideish transition-colors duration-500 ${
                    active === s.id ? 'border-botanical bg-botanical text-ivory' : 'border-charcoal/15 text-charcoal/65 hover:border-botanical'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <article key={spot.id} className="relative mt-8 overflow-hidden rounded-[2rem] bg-ivory p-8 shadow-[0_30px_80px_-40px_rgba(36,61,45,0.35)] md:p-10" role="tabpanel" style={{ animation: 'spot-in .9s var(--silk)' }}>
              <span className="absolute right-6 top-6 font-display text-6xl text-beige">0{SPOTS.indexOf(spot) + 1}</span>
              <p className="eyebrow text-calendula">{spot.kicker}</p>
              <h3 className="mt-4 font-serif text-[2.2rem] italic leading-tight text-botanical">{spot.title}</h3>
              <p className="mt-4 leading-relaxed text-charcoal/70">{spot.body}</p>
              <div className="mt-8 flex items-center gap-3 border-t border-charcoal/10 pt-5 text-sm text-botanical">
                <span className="h-2 w-2 rounded-full bg-calendula" />
                {spot.fact}
              </div>
            </article>
            <p className="mt-6 text-xs leading-relaxed text-charcoal/50">Descriptions reflect our botanical inspiration and formulation approach; they are not medical claims.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
