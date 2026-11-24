import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ArrowDown, ArrowRight } from 'lucide-react'
import Stage from '../three/Stage'
import Calendula from '../three/Calendula'
import ProductModel from '../three/ProductModel'
import { FloatingPetals, Studio } from '../three/Studio'
import { PRODUCTS } from '../data/products'
import { gsap, pointer, prefersReducedMotion, scrollToId, useMedia, liteGPU } from '../lib/motion'
import { Photo, SplitText } from './ui'

const SERUM = PRODUCTS[0]

// Phones and portrait tablets stack the bloom above the copy.
const STACKED = '(max-width: 767px), (max-aspect-ratio: 1/1)'
// Side-by-side layout shrinks its horizontal offsets as the window narrows.
const fit = () => Math.min(1.15, Math.max(0.62, window.innerWidth / window.innerHeight / 1.6))

/**
 * Stacked (phone / portrait tablet) layout: fit the bottle + bloom into the band
 * between the nav and the top of the headline, whatever the screen height.
 * Camera z 6.8, fov 35 -> bottle plane (z 1.1) half-height ~1.8 units, flower plane ~2.59.
 */
const STACK_CAM = 6.8
function stackedLayout(copyEl) {
  const H = window.innerHeight
  const top = Math.max(H * 0.3, (copyEl?.getBoundingClientRect().top ?? H * 0.4) - 12)
  const bandTop = 88
  const bandBottom = top + 6
  const center = (bandTop + bandBottom) / 2 + 12 // the dropper makes the bottle top-heavy: nudge down to keep it off the logo
  const halfB = Math.tan((17.5 * Math.PI) / 180) * (STACK_CAM - 1.1)
  const bottleY = halfB * (1 - (2 * center) / H)
  const bandWorld = ((bandBottom - bandTop) / H) * 2 * halfB
  const widthWorld = halfB * 2 * (window.innerWidth / H)
  const bottleScale = Math.max(0.55, Math.min(1.1, bandWorld / 1.6, widthWorld / 1.75))
  return { flowerX: 0, bottleX: 0, bottleY, bottleScale, flowerY: bottleY * ((STACK_CAM + 1.4) / (STACK_CAM - 1.1)), flowerScale: bottleScale * 1.62, camZ: STACK_CAM }
}

function HeroScene({ ctl, mobile }) {
  const flower = useRef()
  const bottle = useRef()
  const cam = useRef({ x: 0, y: 0 })
  const { camera } = useThree()

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const k = Math.min(1, dt * 3)
    // parallax camera
    cam.current.x += (pointer.x * 0.35 - cam.current.x) * k
    cam.current.y += (pointer.y * 0.22 - cam.current.y) * k
    camera.position.set(cam.current.x, cam.current.y, ctl.camZ)
    camera.lookAt(0, 0, 0)

    if (flower.current) {
      const f = flower.current
      f.position.set(ctl.flowerX, ctl.flowerY + Math.sin(t * 0.5) * 0.04, ctl.flowerZ)
      f.scale.setScalar(ctl.flowerScale)
      f.rotation.x = Math.PI / 2 - 0.32 + pointer.y * 0.06
      f.rotation.z = -0.12 + Math.sin(t * 0.3) * 0.03 - pointer.x * 0.06
    }
    if (bottle.current) {
      const b = bottle.current
      b.position.set(ctl.bottleX, ctl.bottleY + Math.sin(t * 1.1) * 0.06, 1.1)
      b.scale.setScalar(ctl.bottleScale)
      const targetY = ctl.bottleRot + pointer.x * 0.45 + Math.sin(t * 0.6) * 0.12
      b.rotation.y += (targetY - b.rotation.y) * k
      b.rotation.x += (-pointer.y * 0.12 - b.rotation.x) * k
      b.rotation.z = Math.sin(t * 0.8) * 0.03
    }
  })

  return (
    <>
      <Studio />
      <group ref={flower}>
        <Calendula control={ctl} quality={mobile ? 'low' : 'high'} />
      </group>
      <group ref={bottle}>
        <ProductModel model={SERUM.model} lite={liteGPU()} />
      </group>
      <FloatingPetals count={mobile ? 14 : 30} area={[10, 7, 4]} control={ctl} />
    </>
  )
}

export default function Hero({ ready }) {
  const root = useRef(null)
  const mobile = useMedia(STACKED)
  const ctl = useMemo(
    () => ({ open: 0.5, spin: 0.06, breathe: 1, flowerScale: 1, flowerX: 0, flowerY: 0, flowerZ: -1.4, bottleX: 0, bottleY: 0, bottleRot: 0, bottleScale: 1, camZ: 6.2, burst: 0 }),
    []
  )

  // Layout of the scene differs between desktop and mobile.
  useEffect(() => {
    const layout = () => {
      if (window.scrollY > 10) return // the scroll timeline owns the scene once the visitor scrolls
      const f = fit()
      if (mobile) Object.assign(ctl, stackedLayout(root.current?.querySelector('[data-hero-copy]')))
      else {
        // narrower screens (tablet landscape, small laptops): shrink a touch and slide right so the headline stays clear
        const k = Math.max(0, 1 - f)
        Object.assign(ctl, { flowerX: 1.45 * f + 1.6 * k, flowerY: -0.05, bottleX: 1.2 * f + 1.4 * k, bottleY: -0.42, bottleScale: 1.02 * Math.min(1, f + 0.05), flowerScale: 1.78 * Math.min(1, f), camZ: 6.2 })
      }
    }
    layout()
    window.addEventListener('resize', layout)
    return () => window.removeEventListener('resize', layout)
  }, [mobile, ctl])

  // Intro: bloom + headline
  useEffect(() => {
    if (!ready) return
    const reduced = prefersReducedMotion()
    const ctx = gsap.context(() => {
      if (reduced) {
        ctl.open = 0.85
        return
      }
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.to(ctl, { open: 0.86, duration: 3.2, ease: 'power3.out' }, 0)
        .from('[data-hero="intro"] h1 .split-word', { yPercent: 120, rotate: 4, duration: 1.5, stagger: 0.08 }, 0.15)
        .from('[data-hero="fade"]', { y: 30, opacity: 0, duration: 1.4, stagger: 0.1 }, 0.7)
        .from('[data-hero="line"]', { scaleX: 0, duration: 1.6, transformOrigin: 'left' }, 0.6)
    }, root)
    return () => ctx.revert()
  }, [ready, ctl])

  // Scroll journey: bloom -> product reveal -> product steps aside for copy
  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add({ desk: '(min-width: 768px) and (min-aspect-ratio: 1001/1000)', mob: STACKED }, (c) => {
        const desk = c.conditions.desk
        // function values are re-read on refresh (resize / orientation change)
        const stackedTargets = () => {
          const l = () => stackedLayout(root.current?.querySelector('[data-hero="story"] > div'))
          return { bottleY: () => l().bottleY, bottleScale: () => l().bottleScale, flowerY: () => l().flowerY, flowerScale: () => l().flowerScale, camZ: STACK_CAM }
        }
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: root.current, start: 'top top', end: desk ? '+=300%' : '+=220%', pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, fastScrollEnd: true },
        })
        // A — the flower opens and floods the frame
        tl.to('[data-hero="intro"]', { yPercent: -18, opacity: 0, duration: 1.6, ease: 'power2.in' }, 0)
          .to(ctl, { open: 1, duration: 3 }, 0)
          .to(ctl, { flowerScale: desk ? 3.1 : 1.9, flowerX: 0, flowerY: 0, duration: 3.4, ease: 'power2.inOut' }, 0)
          .to(ctl, { camZ: desk ? 5.4 : 6.2, duration: 3.4, ease: 'power2.inOut' }, 0)
          .to(ctl, { bottleY: -3.4, duration: 2, ease: 'power2.in' }, 0.3)
          .to(ctl, { burst: 1, spin: 0.22, duration: 2.4 }, 0.5)
          .fromTo('[data-hero="giant"]', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 2.2 }, 1.2)
        // B — the serum rises, turning, into the centre
          .set(ctl, { bottleX: 0 }, 3)
          .to(ctl, { bottleY: desk ? -0.05 : 0.2, bottleScale: desk ? 1.12 : 0.9, duration: 2.6, ease: 'power3.out' }, 3.1)
          .to(ctl, { bottleRot: Math.PI * 2, duration: 3, ease: 'power2.inOut' }, 3.1)
          .to(ctl, { burst: 0, spin: 0.08, flowerScale: desk ? 2.1 : 1.4, flowerZ: -2.4, duration: 2.6 }, 3.2)
          .to('[data-hero="giant"]', { opacity: 0, yPercent: -12, duration: 1.4 }, 4.8)
        // C — product glides right (down on mobile); copy rises on the left
          .to(ctl, desk ? { bottleX: () => 1.45 * fit(), flowerX: () => 1.9 * fit(), flowerScale: () => 1.7 * Math.min(1, fit() + 0.1), camZ: 5.8, duration: 2.6, ease: 'power2.inOut' } : { ...stackedTargets(), duration: 2.4, ease: 'power2.inOut' }, 6)
          .fromTo('[data-hero="story"]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 6.6)
          .fromTo('[data-hero="story"] .split-word', { yPercent: 120 }, { yPercent: 0, stagger: 0.12, duration: 1.2, ease: 'power3.out' }, 6.7)
          .fromTo('[data-hero="story-fade"]', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 1.2 }, 7.6)
          .to({}, { duration: 1.4 })
      })
    }, root)
    return () => ctx.revert()
  }, [ctl])

  const fallback = (
    <div className="absolute inset-0 flex items-center justify-center md:justify-end md:pr-[10vw]">
      <Photo id="glow-serum" alt="Calendula Glow Serum amber glass bottle beside a calendula flower" eager imgClassName="h-[60vh] w-auto rounded-[50%_50%_2rem_2rem] object-cover shadow-2xl" />
    </div>
  )

  return (
    <div className="pin-host">
      <section id="home" ref={root} className="grain relative h-[100svh] min-h-[620px] overflow-hidden bg-ivory" aria-label="Introduction">
      {/* warm light + leaf shadows */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-[10%] -top-[20%] h-[90vh] w-[90vh] rounded-full bg-[radial-gradient(circle,rgba(242,177,59,0.32),rgba(229,138,53,0.08)_45%,transparent_70%)]" />
        <div className="absolute -bottom-[30%] -left-[10%] h-[80vh] w-[80vh] rounded-full bg-[radial-gradient(circle,rgba(233,221,203,0.9),transparent_65%)]" />
        <div className="absolute inset-0 opacity-[0.35] [background:repeating-linear-gradient(115deg,transparent_0_9vw,rgba(255,240,210,0.55)_9vw_11vw,transparent_11vw_19vw)] [mask-image:linear-gradient(200deg,black,transparent_60%)]" />
        <svg className="absolute -left-10 top-10 h-[70vh] w-auto opacity-[0.12] blur-[6px] [transform:translateZ(0)]" viewBox="0 0 200 400">
          <path d="M100 400 C 98 300, 104 200, 90 0" stroke="#243D2D" strokeWidth="3" fill="none" />
          {Array.from({ length: 9 }, (_, i) => (
            <ellipse key={i} cx={i % 2 ? 125 : 70} cy={350 - i * 38} rx="34" ry="12" fill="#243D2D" transform={`rotate(${i % 2 ? -30 : 30} ${i % 2 ? 125 : 70} ${350 - i * 38})`} />
          ))}
        </svg>
      </div>

      {/* giant word behind the bloom */}
      <div data-hero="giant" className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0" aria-hidden="true">
        <span className="font-serif text-[26vw] italic leading-none text-calendula/[0.12]">Calendula</span>
      </div>

      <Stage className="absolute inset-0" camera={{ position: [0, 0, 6.2], fov: 35 }} fallback={fallback}>
        <HeroScene ctl={ctl} mobile={mobile} />
      </Stage>

      {/* Intro copy */}
      <div data-hero="intro" className="gutter relative z-10 flex h-full flex-col justify-end pb-9 pt-28 md:justify-center md:pb-0 md:portrait:justify-end md:portrait:pb-16">
        <div data-hero-copy className="max-w-[56rem]">
          <p data-hero="fade" className="eyebrow mb-6 hidden items-center gap-4 text-botanical/80 sm:flex">
            <span data-hero="line" className="inline-block h-px w-10 bg-calendula" />
            Calendula Botanical Skincare
          </p>
          <SplitText
            as="h1"
            lines={['Let nature', 'reveal your', '*glow.*']}
            className="display hero-title text-[clamp(3rem,6.5vw,7.6rem)] text-botanical"
          />
          <p data-hero="fade" className="mt-8 max-w-md text-[0.98rem] leading-relaxed text-charcoal/70 md:text-[1.02rem]">
            Discover the restorative beauty of Calendula-powered skincare. A botanical ritual designed to nourish, calm and illuminate.
          </p>
          <div data-hero="fade" className="mt-9 flex flex-wrap gap-3">
            <button className="btn btn-solid" onClick={() => scrollToId('products')}>
              Explore the collection <ArrowRight size={14} strokeWidth={1.5} />
            </button>
            <button className="btn btn-ghost" onClick={() => scrollToId('ingredients')}>
              Discover our science
            </button>
          </div>
        </div>

        <div data-hero="fade" className="absolute bottom-10 right-[var(--gutter)] hidden text-right xl:block xl:portrait:hidden">
          <p className="eyebrow text-charcoal/50">Featured</p>
          <p className="mt-2 font-serif text-2xl italic text-botanical">Calendula Glow Serum</p>
          <p className="mt-1 text-sm text-charcoal/60">30 ml · ₹1,299</p>
        </div>

        <button
          data-hero="fade"
          onClick={() => scrollToId('ingredients')}
          className="group absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 xl:flex"
          aria-label="Scroll to discover"
        >
          <span className="eyebrow text-[0.6rem] text-charcoal/55">Scroll to unfold</span>
          <span className="relative block h-14 w-px overflow-hidden bg-charcoal/15">
            <span className="scroll-drip absolute left-0 top-0 block h-1/2 w-px bg-calendula" />
          </span>
          <ArrowDown size={12} className="text-charcoal/40 transition-transform duration-500 group-hover:translate-y-1" />
        </button>
      </div>

      {/* Scroll chapter C */}
      <div data-hero="story" className="gutter invisible absolute inset-0 z-10 flex items-end pb-14 md:items-center md:pb-0 md:portrait:items-end md:portrait:pb-14">
        <div className="max-w-xl md:max-w-[46rem]">
          <p data-hero="story-fade" className="eyebrow mb-5 text-calendula">The Glow Serum — 30 ml</p>
          <SplitText as="h2" lines={['A single drop', 'of botanical', '*light.*']} className="display text-[clamp(2.3rem,4.8vw,5.2rem)] text-botanical" />
          <p data-hero="story-fade" className="mt-6 max-w-md leading-relaxed text-charcoal/70">
            Cold-infused calendula petals, suspended in amber glass. A weightless serum that melts into skin and leaves a soft, luminous finish.
          </p>
          <div data-hero="story-fade" className="mt-8 flex flex-wrap items-center gap-6">
            <button className="btn btn-solid" onClick={() => scrollToId('products')}>
              Shop the serum · ₹1,299
            </button>
            <span className="text-xs uppercase tracking-wideish text-charcoal/50">Brighten · Soothe · Renew</span>
          </div>
        </div>
      </div>
    </section>
    </div>
  )
}
