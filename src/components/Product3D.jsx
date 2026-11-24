import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import Stage from '../three/Stage'
import ProductModel from '../three/ProductModel'
import { FloatingPetals, Studio } from '../three/Studio'
import { PRODUCTS, formatINR } from '../data/products'
import { useCart } from '../lib/cart'
import { gsap, pointer, prefersReducedMotion, useMobile, liteGPU } from '../lib/motion'
import { Photo } from './ui'

const SERUM = PRODUCTS[0]

const CALLOUTS = [
  { k: '01', t: 'Champagne-gold collar', d: 'Hand-finished metal with a soft mirror polish.' },
  { k: '02', t: 'Amber UV glass', d: 'Shields the botanical extract from light.' },
  { k: '03', t: 'Precision dropper', d: 'Three drops, measured for every ritual.' },
]

function Showpiece({ ctl, mobile }) {
  const g = useRef()
  // fit the bottle to the frame: tall-and-narrow screens get a smaller bottle, nudged up above the captions
  const { width, height } = useThree((st) => st.size)
  const aspect = width / Math.max(1, height)
  const portrait = aspect < 1
  const scale = portrait ? Math.min(1.1, 1.9 * aspect) : 1.45
  const lift = portrait ? 0.15 : 0
  const sm = useRef({ x: 0, y: 0 })
  useFrame((s, dt) => {
    const k = Math.min(1, dt * 3)
    sm.current.x += (pointer.x - sm.current.x) * k
    sm.current.y += (pointer.y - sm.current.y) * k
    if (!g.current) return
    g.current.rotation.y = ctl.rot + sm.current.x * 0.8
    g.current.rotation.x = -sm.current.y * 0.18
    g.current.position.y = Math.sin(s.clock.elapsedTime * 1.2) * 0.05 + ctl.y
    g.current.scale.setScalar(ctl.scale)
  })
  return (
    <>
      <Studio intensity={1.15} />
      <group ref={g}>
        {/* phones get a smaller, slightly raised bottle so captions sit clear below it */}
        <ProductModel model={SERUM.model} lite={liteGPU()} scale={scale} position={[0, lift, 0]} />
      </group>
      <ContactShadows key={scale.toFixed(2)} position={[0, -0.78 * scale + lift - 0.08, 0]} opacity={0.5} scale={7} blur={2.8} far={3} resolution={256} frames={1} color="#4a2a10" />
      <FloatingPetals count={mobile ? 10 : 18} area={[8, 5, 4]} speed={0.7} />
    </>
  )
}

/** Full-screen 3D moment: the Glow Serum, turning a full circle as you scroll. */
export default function Product3D() {
  const root = useRef(null)
  const mobile = useMobile()
  const { setDetail } = useCart()
  const ctl = useMemo(() => ({ rot: 0, y: 0, scale: 1 }), [])

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=180%', pin: true, scrub: 0.6, anticipatePin: 1, fastScrollEnd: true },
      })
      tl.to(ctl, { rot: Math.PI * 2, duration: 10 }, 0)
        .fromTo('[data-sc="title"] .split-word', { yPercent: 110 }, { yPercent: 0, stagger: 0.3, duration: 2, ease: 'power3.out' }, 0)
        .fromTo('[data-sc="callout"]', { opacity: 0, x: 30 }, { opacity: 1, x: 0, stagger: 1.6, duration: 1.4 }, 1.6)
        .fromTo('[data-sc="ring"]', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 3 }, 0)
        .to(ctl, { scale: 0.82, y: 0.15, duration: 2 }, 8)
        .to('[data-sc="veil"]', { opacity: 1, duration: 2 }, 8)
    }, root)
    return () => ctx.revert()
  }, [ctl])

  return (
    <div className="pin-host">
      <section ref={root} data-petals className="relative h-[100svh] min-h-[640px] overflow-hidden bg-[radial-gradient(ellipse_at_50%_55%,#fff7e8_0%,#f3e7d3_45%,#e9ddcb_100%)]" aria-label="The Glow Serum in 3D">
      <div data-sc="ring" className="pointer-events-none absolute left-1/2 top-1/2 h-[min(78vh,78vw)] w-[min(78vh,78vw)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-champagne/40" aria-hidden="true">
        <div className="absolute inset-[9%] rounded-full border border-champagne/25" />
        <div className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle,rgba(242,177,59,0.28),transparent_70%)]" />
      </div>

      <div className="gutter pointer-events-none absolute inset-x-0 top-20 z-10 flex items-start justify-between md:top-28">
        <div data-sc="title">
          <p className="eyebrow text-calendula">In the round · 360°</p>
          <h2 className="display mt-3 text-[clamp(2rem,5vw,4.8rem)] text-botanical md:mt-4">
            <span className="split-line"><span className="split-word">Liquid</span></span>
            <span className="split-line"><span className="split-word italic-accent">amber.</span></span>
          </h2>
        </div>
        <p className="hidden max-w-[15rem] text-right text-sm leading-relaxed text-charcoal/60 md:block">Move your cursor to turn the bottle. Scroll to see it in the round.</p>
      </div>

      <Stage className="absolute inset-0" camera={{ position: [0, 0.1, 6], fov: 33 }} fallback={<div className="absolute inset-0 flex items-center justify-center"><Photo id="glow-serum" alt="Calendula Glow Serum" imgClassName="h-[60vh] w-auto rounded-[999px_999px_2rem_2rem] object-cover" /></div>}>
        <Showpiece ctl={ctl} mobile={mobile} />
      </Stage>

      <ul className="gutter absolute bottom-6 left-0 right-0 z-10 grid grid-cols-3 gap-3 md:bottom-14 md:gap-4">
        {CALLOUTS.map((c) => (
          <li key={c.k} data-sc="callout" className="border-t border-charcoal/15 pt-3 md:pt-4">
            <span className="text-xs text-calendula">{c.k}</span>
            <p className="mt-1 font-serif text-[0.95rem] italic leading-tight text-botanical md:text-xl">{c.t}</p>
            <p className="mt-1 hidden text-sm text-charcoal/60 md:block">{c.d}</p>
          </li>
        ))}
      </ul>

      <div className="absolute inset-x-[var(--gutter)] bottom-[6.5rem] z-10 flex items-center justify-between md:inset-x-auto md:bottom-auto md:right-[var(--gutter)] md:top-1/2 md:block md:-translate-y-1/2 md:text-right">
        <div>
          <p className="font-display text-2xl text-botanical md:text-4xl">{formatINR(SERUM.price)}</p>
          <p className="mt-1 text-xs text-charcoal/55 md:text-sm">30 ml</p>
        </div>
        <button onClick={() => setDetail(SERUM.id)} className="btn btn-solid px-5 py-3 md:mt-6 md:px-7 md:py-4">
          View the serum
        </button>
      </div>

      <div data-sc="veil" className="pointer-events-none absolute inset-0 bg-ivory opacity-0" aria-hidden="true" />
    </section>
    </div>
  )
}
