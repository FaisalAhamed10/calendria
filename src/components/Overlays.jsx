import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, PresentationControls } from '@react-three/drei'
import { Minus, Plus, X, ShoppingBag, ArrowRight, Search, Check } from 'lucide-react'
import { FREE_SHIPPING_AT, useCart } from '../lib/cart'
import { cleanInput, EMAIL_RE, LIMITS } from '../lib/security'
import { PRODUCTS, formatINR, img } from '../data/products'
import { gsap, prefersReducedMotion, scrollToId, useMobile, useScrollLock, liteGPU } from '../lib/motion'
import Stage from '../three/Stage'
import ProductModel from '../three/ProductModel'
import { FloatingPetals, Studio } from '../three/Studio'
import { Field, Photo } from './ui'

/** Fly a product image into the bag icon. */
export function flyToBag(fromEl, productId) {
  const bag = document.getElementById('bag-icon')
  if (!fromEl || !bag || prefersReducedMotion()) return
  const a = fromEl.getBoundingClientRect()
  const b = bag.getBoundingClientRect()
  const ghost = document.createElement('img')
  ghost.src = img(`${productId}-thumb`)
  ghost.alt = ''
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${a.left + a.width / 2 - 60}px`,
    top: `${a.top + a.height / 2 - 60}px`,
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '999px',
    zIndex: 90,
    pointerEvents: 'none',
    boxShadow: '0 20px 40px -10px rgba(36,61,45,.35)',
  })
  document.body.appendChild(ghost)
  const dx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dy = b.top + b.height / 2 - (a.top + a.height / 2)
  gsap
    .timeline({ onComplete: () => ghost.remove() })
    .fromTo(ghost, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' })
    .to(ghost, { x: dx, duration: 0.9, ease: 'power2.inOut' }, 0.3)
    .to(ghost, { y: dy, duration: 0.9, ease: 'power3.in' }, 0.3)
    .to(ghost, { scale: 0.12, opacity: 0.6, rotate: 25, duration: 0.9, ease: 'power2.in' }, 0.3)
}

/* ------------------------------------------------------------------ */
function Drawer({ open, onClose, side = 'right', label, children, wide = false }) {
  const panel = useRef(null)
  const [render, setRender] = useState(open)
  useScrollLock(open)
  useEffect(() => {
    if (open) setRender(true)
  }, [open])
  useEffect(() => {
    if (!render || !panel.current) return
    const from = side === 'right' ? { xPercent: 100 } : { yPercent: -100 }
    if (open) {
      gsap.fromTo(panel.current, from, { xPercent: 0, yPercent: 0, duration: 0.9, ease: 'expo.out' })
      gsap.fromTo(panel.current.previousSibling, { opacity: 0 }, { opacity: 1, duration: 0.6 })
      panel.current.querySelector('[data-autofocus]')?.focus()
    } else {
      gsap.to(panel.current, { ...from, duration: 0.6, ease: 'expo.in', onComplete: () => setRender(false) })
      gsap.to(panel.current.previousSibling, { opacity: 0, duration: 0.5 })
    }
  }, [open, render, side])
  useEffect(() => {
    if (!open) return
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
  if (!render) return null
  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-[3px]" onClick={onClose} />
      <div
        ref={panel}
        className={
          side === 'right'
            ? `absolute right-0 top-0 flex h-full w-full flex-col bg-ivory shadow-2xl ${wide ? 'max-w-xl' : 'max-w-md'}`
            : 'absolute inset-x-0 top-0 bg-ivory shadow-2xl'
        }
      >
        {children}
      </div>
    </div>
  )
}

/* ------------------------------ Cart ------------------------------- */
export function CartDrawer() {
  const { open, setOpen, lines, setQty, remove, count, subtotal, discount, shipping, total, setPage } = useCart()
  const close = () => setOpen(false)
  // drawer -> full-page bag / checkout (drawer slides away first)
  const goPage = (p) => {
    setOpen(false)
    setTimeout(() => setPage(p), 380)
  }
  const remaining = Math.max(0, FREE_SHIPPING_AT - (subtotal - discount))
  return (
    <Drawer open={open} onClose={close} label="Shopping bag">
      <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-5 md:px-8">
        <h2 className="font-display text-xl uppercase tracking-[0.12em] text-botanical">
          Your bag <span className="font-sans text-sm tracking-normal text-charcoal/50">({count})</span>
        </h2>
        <button data-autofocus onClick={close} aria-label="Close bag" className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-botanical/10">
          <X size={20} strokeWidth={1.4} />
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
          <ShoppingBag size={36} strokeWidth={1} className="mb-6 text-champagne" />
          <p className="font-serif text-3xl italic text-botanical">Your bag is waiting to bloom.</p>
          <p className="mt-3 text-sm text-charcoal/60">Begin with the Glow Serum — our most-loved ritual.</p>
          <button
            className="btn btn-solid mt-8"
            onClick={() => {
              close()
              setTimeout(() => scrollToId('products'), 400)
            }}
          >
            Explore the collection
          </button>
        </div>
      ) : (
        <>
          <div className="px-6 pt-5 md:px-8">
            <p className="text-xs text-charcoal/65">
              {remaining > 0 ? (
                <>
                  Add <strong className="font-semibold text-botanical">{formatINR(remaining)}</strong> more for complimentary shipping
                </>
              ) : (
                'Complimentary shipping unlocked'
              )}
            </p>
            <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-beige">
              <div className="h-full rounded-full bg-gradient-to-r from-calendula to-champagne transition-all duration-700" style={{ width: `${Math.min(100, ((subtotal - discount) / FREE_SHIPPING_AT) * 100)}%` }} />
            </div>
          </div>
          <ul className="flex-1 space-y-5 overflow-y-auto px-6 py-6 md:px-8" data-lenis-prevent>
            {lines.map((l) => (
              <li key={l.id} className="flex gap-4">
                <img src={img(`${l.id}-thumb`)} alt="" className="h-24 w-24 flex-none rounded-2xl object-cover" />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-serif text-lg leading-tight text-botanical">{l.product.name}</p>
                      <p className="mt-0.5 text-xs text-charcoal/55">{l.product.size}</p>
                    </div>
                    <button onClick={() => remove(l.id)} className="text-[0.65rem] uppercase tracking-wideish text-charcoal/50 hover:text-calendula" aria-label={`Remove ${l.product.name}`}>
                      Remove
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <Qty value={l.qty} onChange={(q) => setQty(l.id, q)} small />
                    <span className="text-sm font-medium">{formatINR(l.qty * l.product.price)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-charcoal/10 bg-beige/40 px-6 py-6 md:px-8">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between text-charcoal/70">
                <dt>Subtotal</dt>
                <dd>{formatINR(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-calendula">
                  <dt>Promo</dt>
                  <dd>− {formatINR(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-charcoal/70">
                <dt>Shipping</dt>
                <dd>{shipping ? formatINR(shipping) : 'Free'}</dd>
              </div>
              <div className="flex justify-between pt-2 font-display text-lg text-botanical">
                <dt>Total</dt>
                <dd>{formatINR(total)}</dd>
              </div>
            </dl>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button className="btn btn-ghost w-full px-4" onClick={() => goPage('bag')}>
                View full bag
              </button>
              <button className="btn btn-solid w-full px-4" onClick={() => goPage('checkout')}>
                Checkout <ArrowRight size={14} strokeWidth={1.5} />
              </button>
            </div>
            <p className="mt-3 text-center text-[0.68rem] text-charcoal/50">Cash on Delivery available · Taxes included</p>
          </div>
        </>
      )}
    </Drawer>
  )
}

export function Qty({ value, onChange, small = false }) {
  return (
    <div className={`inline-flex items-center rounded-full border border-charcoal/15 ${small ? 'h-9' : 'h-12'}`}>
      <button onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity" className={`inline-flex items-center justify-center disabled:opacity-30 ${small ? 'w-9' : 'w-12'}`}>
        <Minus size={14} strokeWidth={1.5} />
      </button>
      <span className={`text-center text-sm tabular-nums ${small ? 'w-5' : 'w-8'}`} aria-live="polite">
        {value}
      </span>
      <button onClick={() => onChange(value + 1)} disabled={value >= 9} aria-label="Increase quantity" className={`inline-flex items-center justify-center disabled:opacity-30 ${small ? 'w-9' : 'w-12'}`}>
        <Plus size={14} strokeWidth={1.5} />
      </button>
    </div>
  )
}

/* ------------------------- Product detail ------------------------- */
function Spinner({ children }) {
  const ref = useRef()
  useFrame((s) => {
    if (ref.current) {
      // gentle sway keeps the label facing the viewer; drag to see the back
      ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.45) * 0.65
      ref.current.position.y = Math.sin(s.clock.elapsedTime * 1.1) * 0.05
    }
  })
  return <group ref={ref}>{children}</group>
}

export function ProductDetail() {
  const { detail, setDetail, add } = useCart()
  const [qty, setQ] = useState(1)
  const mobile = useMobile()
  const product = useMemo(() => PRODUCTS.find((p) => p.id === detail), [detail])
  const [shown, setShown] = useState(product)
  const root = useRef(null)
  const addBtn = useRef(null)
  useScrollLock(!!product)

  useEffect(() => {
    if (product) {
      setShown(product)
      setQ(1)
    }
  }, [product])

  useEffect(() => {
    if (!root.current) return
    if (product) {
      gsap.fromTo(root.current, { clipPath: 'inset(100% 0 0 0 round 2rem)' }, { clipPath: 'inset(0% 0 0 0 round 0rem)', duration: 1.1, ease: 'expo.inOut' })
      gsap.fromTo(root.current.querySelectorAll('[data-d]'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 1.1, ease: 'expo.out', delay: 0.5 })
      root.current.querySelector('[data-autofocus]')?.focus()
    } else if (shown) {
      gsap.to(root.current, { clipPath: 'inset(0 0 100% 0 round 2rem)', duration: 0.8, ease: 'expo.inOut', onComplete: () => setShown(null) })
    }
  }, [product]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!product) return
    const k = (e) => e.key === 'Escape' && setDetail(null)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [product, setDetail])

  if (!shown) return null
  const p = shown
  const idx = PRODUCTS.findIndex((x) => x.id === p.id)
  const next = PRODUCTS[(idx + 1) % PRODUCTS.length]

  return (
    <div ref={root} className="fixed inset-0 z-[75] overflow-y-auto bg-ivory md:overflow-hidden" role="dialog" aria-modal="true" aria-label={p.name} data-lenis-prevent>
      <div className="grid min-h-full md:h-full md:grid-cols-[1.15fr_1fr]">
        <div className="relative h-[52vh] overflow-hidden bg-[radial-gradient(ellipse_at_50%_60%,#fff5e4,#efe3cf_60%,#e4d3b8)] md:h-full">
          <span className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-display text-[22vw] uppercase leading-none text-white/50 md:text-[13vw]" aria-hidden="true">
            {p.short.split(' ')[1] ?? p.short}
          </span>
          <Stage className="absolute inset-0" camera={{ position: [0, 0.15, mobile ? 5.4 : 6.4], fov: 32 }} interactive fallback={<Photo id={p.id} alt={p.name} imgClassName="h-full w-full object-cover" eager />}>
            <Studio intensity={1.1} />
            <PresentationControls global={false} cursor snap rotation={[0, 0, 0]} polar={[-0.2, 0.3]} azimuth={[-Infinity, Infinity]} config={{ mass: 1, tension: 170, friction: 26 }}>
              <Spinner>
                <ProductModel key={p.id} model={p.model} lite={liteGPU()} scale={p.model.kind === 'jar' ? 1.05 : 1} />
              </Spinner>
            </PresentationControls>
            <ContactShadows position={[0, -0.95, 0]} opacity={0.45} scale={6} blur={2.6} far={2.5} color="#5a3a1a" />
            <FloatingPetals count={mobile ? 8 : 16} area={[7, 5, 3]} speed={0.6} />
          </Stage>
          <p className="eyebrow pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-[0.6rem] text-charcoal/45">Drag to rotate</p>
        </div>

        <div className="relative flex flex-col justify-center px-6 py-10 md:px-14 md:py-16">
          <button data-autofocus onClick={() => setDetail(null)} className="fixed right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/15 bg-ivory/90 shadow-sm hover:bg-botanical hover:text-ivory md:absolute md:right-8 md:top-8 md:bg-transparent md:shadow-none" aria-label="Close product details">
            <X size={18} strokeWidth={1.4} />
          </button>
          <p data-d className="eyebrow text-calendula">
            {p.index} — The Botanical Ritual
          </p>
          <h2 data-d className="display mt-4 text-[clamp(2.1rem,3.6vw,3.6rem)] text-botanical">
            {p.name.replace('Calendula ', 'Calendula ')}
          </h2>
          <p data-d className="mt-3 text-xs uppercase tracking-wideish text-charcoal/50">{p.tagline}</p>
          <p data-d className="mt-6 max-w-md leading-relaxed text-charcoal/70">{p.long}</p>
          <ul data-d className="mt-6 flex flex-wrap gap-2">
            {p.notes.map((n) => (
              <li key={n} className="rounded-full border border-champagne/60 px-3 py-1.5 text-[0.7rem] text-charcoal/70">
                {n}
              </li>
            ))}
          </ul>
          <p data-d className="mt-6 border-l-2 border-calendula/60 pl-4 font-serif text-lg italic text-botanical/90">{p.ritual}</p>
          <div data-d className="mt-8 flex items-baseline gap-3">
            <span className="font-display text-3xl text-botanical">{formatINR(p.price)}</span>
            <span className="text-sm text-charcoal/50">{p.size} · incl. taxes</span>
          </div>
          <div data-d className="mt-6 flex flex-wrap items-center gap-3">
            <Qty value={qty} onChange={(q) => setQ(Math.max(1, Math.min(9, q)))} />
            <button
              ref={addBtn}
              className="btn btn-solid h-12 flex-1 sm:flex-none"
              onClick={() => {
                flyToBag(addBtn.current, p.id)
                add(p.id, qty)
              }}
            >
              Add to bag · {formatINR(p.price * qty)}
            </button>
          </div>
          <button data-d onClick={() => setDetail(next.id)} className="ulink mt-10 inline-flex w-max items-center gap-2 text-xs uppercase tracking-wideish text-charcoal/60 hover:text-botanical">
            Next: {next.name} <ArrowRight size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- Search ----------------------------- */
export function SearchPanel() {
  const { panel, setPanel, setDetail } = useCart()
  const [q, setQ] = useState('')
  const open = panel === 'search'
  const results = PRODUCTS.filter((p) => (p.name + ' ' + p.tagline + ' ' + p.notes.join(' ') + ' ' + p.description).toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <Drawer open={open} onClose={() => setPanel(null)} side="top" label="Search">
      <div className="gutter mx-auto max-w-6xl pb-10 pt-6">
        <div className="flex items-center gap-4 border-b border-charcoal/20 pb-4">
          <Search size={22} strokeWidth={1.3} className="text-calendula" />
          <input
            data-autofocus
            value={q}
            onChange={(e) => setQ(cleanInput(e.target.value, LIMITS.search))}
            maxLength={LIMITS.search}
            type="search"
            enterKeyHint="search"
            placeholder="Search serum, cream, calendula…"
            aria-label="Search products"
            className="flex-1 bg-transparent font-serif text-2xl italic text-botanical outline-none placeholder:text-charcoal/35 md:text-4xl"
          />
          <button onClick={() => setPanel(null)} aria-label="Close search" className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-botanical/10">
            <X size={20} strokeWidth={1.4} />
          </button>
        </div>
        <p className="eyebrow mt-6 text-charcoal/50">{q ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'The botanical ritual'}</p>
        <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {results.map((p) => (
            <li key={p.id}>
              <button
                className="group w-full text-left"
                onClick={() => {
                  setPanel(null)
                  setTimeout(() => setDetail(p.id), 350)
                }}
              >
                <div className="overflow-hidden rounded-2xl">
                  <img src={img(`${p.id}-thumb`)} alt="" className="aspect-[5/4] w-full object-cover transition-transform duration-700 ease-silk group-hover:scale-105" />
                </div>
                <p className="mt-3 font-serif text-lg leading-tight text-botanical">{p.name}</p>
                <p className="text-sm text-charcoal/55">{formatINR(p.price)}</p>
              </button>
            </li>
          ))}
          {!results.length && <li className="col-span-full py-6 font-serif text-xl italic text-charcoal/60">Nothing found — try “serum” or “oil”.</li>}
        </ul>
      </div>
    </Drawer>
  )
}

/* ----------------------------- Account ---------------------------- */
export function AccountPanel() {
  const { panel, setPanel, setToast } = useCart()
  const [mode, setMode] = useState('in')
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const open = panel === 'account'
  const submit = (e) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) return setErr('Please enter a valid email address.')
    setErr('')
    setPanel(null)
    setToast({ key: Date.now(), text: mode === 'in' ? 'Welcome back to the Ritual Club (demo)' : 'Welcome to the Ritual Club (demo)' })
  }
  return (
    <Drawer open={open} onClose={() => setPanel(null)} label="Account">
      <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-5 md:px-8">
        <h2 className="font-display text-xl uppercase tracking-[0.12em] text-botanical">Ritual Club</h2>
        <button onClick={() => setPanel(null)} aria-label="Close account" className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-botanical/10">
          <X size={20} strokeWidth={1.4} />
        </button>
      </div>
      <form onSubmit={submit} className="flex flex-1 flex-col px-6 py-8 md:px-8" noValidate>
        <p className="font-serif text-3xl italic leading-tight text-botanical">{mode === 'in' ? 'Welcome back.' : 'Join the ritual.'}</p>
        <p className="mt-3 text-sm leading-relaxed text-charcoal/60">Early access to new botanicals, ritual notes and complimentary samples with every order.</p>
        <div className="mt-8 space-y-6">
          <Field id="acct-email" label="Email address" type="email" data-autofocus maxLength={LIMITS.email} value={email} onChange={(e) => setEmail(cleanInput(e.target.value, LIMITS.email))} autoComplete="email" error={err} />
        </div>
        <button className="btn btn-solid mt-8 w-full" type="submit">
          {mode === 'in' ? 'Send me a sign-in link' : 'Create account'}
        </button>
        <button type="button" onClick={() => setMode(mode === 'in' ? 'up' : 'in')} className="ulink mx-auto mt-6 text-xs uppercase tracking-wideish text-charcoal/60">
          {mode === 'in' ? 'New here? Create an account' : 'Already a member? Sign in'}
        </button>
        <p className="mt-auto pt-10 text-center text-[0.68rem] text-charcoal/45">Demo storefront — no account data is stored.</p>
      </form>
    </Drawer>
  )
}

/* ------------------------------ Toast ----------------------------- */
export function Toast() {
  const { toast, setToast, setOpen, page, setPage } = useCart()
  const ref = useRef(null)
  useEffect(() => {
    if (!toast || !ref.current) return
    gsap.fromTo(ref.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out' })
    const t = setTimeout(() => {
      if (ref.current) gsap.to(ref.current, { y: 20, opacity: 0, duration: 0.5, onComplete: () => setToast(null) })
    }, 3200)
    return () => clearTimeout(t)
  }, [toast, setToast])
  if (!toast) return null
  return (
    <div ref={ref} className="fixed bottom-5 left-1/2 z-[95] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-4 rounded-full bg-botanical py-2.5 pl-6 pr-2.5 text-sm text-ivory shadow-2xl" role="status">
      <span className="truncate">{toast.text}</span>
      {toast.text.includes('added') && (
        <button onClick={() => (page ? setPage('bag') : setOpen(true))} className="flex-none rounded-full bg-ivory px-4 py-2 text-[0.65rem] font-medium uppercase tracking-wideish text-botanical">
          View bag
        </button>
      )}
    </div>
  )
}
