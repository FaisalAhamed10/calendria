import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Banknote, Check, CreditCard, Lock, Minus, Package, Plus, RotateCcw, ShoppingBag, Tag, Truck, X } from 'lucide-react'
import { FREE_SHIPPING_AT, PROMOS, useCart } from '../lib/cart'
import { cleanInput, createSubmitGuard, EMAIL_RE, HONEYPOT_PROPS, LIMITS } from '../lib/security'
import { PRODUCTS, formatINR, img } from '../data/products'
import { gsap, scrollToId, useScrollLock } from '../lib/motion'
import { Field } from './ui'

const STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const STEPS = [
  { id: 'bag', label: 'Bag' },
  { id: 'checkout', label: 'Details & payment' },
  { id: 'done', label: 'Confirmed' },
]

/* ------------------------------------------------------------------ */
function Stepper({ page }) {
  const at = STEPS.findIndex((s) => s.id === page)
  return (
    <ol className="flex items-center gap-2 text-[0.6rem] uppercase tracking-wideish sm:gap-3 sm:text-[0.65rem]" aria-label="Checkout progress">
      {STEPS.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2 sm:gap-3">
          <span className={`flex items-center gap-1.5 ${i <= at ? 'text-botanical' : 'text-charcoal/35'}`} aria-current={i === at ? 'step' : undefined}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[0.58rem] ${i < at ? 'bg-botanical text-ivory' : i === at ? 'border border-botanical' : 'border border-charcoal/20'}`}>
              {i < at ? <Check size={10} strokeWidth={2} /> : i + 1}
            </span>
            <span className={i === at ? '' : 'hidden sm:inline'}>{s.label}</span>
          </span>
          {i < STEPS.length - 1 && <span className={`h-px w-4 sm:w-8 ${i < at ? 'bg-botanical' : 'bg-charcoal/15'}`} />}
        </li>
      ))}
    </ol>
  )
}

function QtyStepper({ value, onChange, label }) {
  return (
    <div className="inline-flex h-10 items-center rounded-full border border-charcoal/15">
      <button onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={`Decrease ${label} quantity`} className="inline-flex h-10 w-10 items-center justify-center disabled:opacity-30">
        <Minus size={14} strokeWidth={1.5} />
      </button>
      <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button onClick={() => onChange(value + 1)} disabled={value >= 9} aria-label={`Increase ${label} quantity`} className="inline-flex h-10 w-10 items-center justify-center disabled:opacity-30">
        <Plus size={14} strokeWidth={1.5} />
      </button>
    </div>
  )
}

function Totals({ compact = false }) {
  const { subtotal, discount, shipping, total, promo, count } = useCart()
  return (
    <dl className={`space-y-2.5 ${compact ? 'text-sm' : 'text-[0.95rem]'}`}>
      <div className="flex justify-between text-charcoal/70">
        <dt>Subtotal · {count} item{count === 1 ? '' : 's'}</dt>
        <dd className="tabular-nums">{formatINR(subtotal)}</dd>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-calendula">
          <dt>Promo {promo}</dt>
          <dd className="tabular-nums">− {formatINR(discount)}</dd>
        </div>
      )}
      <div className="flex justify-between text-charcoal/70">
        <dt>Shipping</dt>
        <dd className="tabular-nums">{shipping ? formatINR(shipping) : 'Free'}</dd>
      </div>
      <div className="flex justify-between text-charcoal/70">
        <dt>Cash on Delivery fee</dt>
        <dd>Free</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-charcoal/10 pt-4 font-display text-botanical">
        <dt className="text-lg uppercase tracking-[0.08em]">Total</dt>
        <dd className="text-2xl tabular-nums">{formatINR(total)}</dd>
      </div>
      <p className="text-right text-[0.7rem] text-charcoal/50">Inclusive of all taxes</p>
    </dl>
  )
}

function Perks() {
  return (
    <ul className="mt-6 grid grid-cols-3 gap-2 text-center text-[0.65rem] leading-snug text-charcoal/60">
      <li className="rounded-2xl bg-beige/50 px-2 py-3">
        <Truck size={16} strokeWidth={1.4} className="mx-auto mb-1.5 text-calendula" />
        Free shipping over {formatINR(FREE_SHIPPING_AT)}
      </li>
      <li className="rounded-2xl bg-beige/50 px-2 py-3">
        <Banknote size={16} strokeWidth={1.4} className="mx-auto mb-1.5 text-calendula" />
        Cash on Delivery
      </li>
      <li className="rounded-2xl bg-beige/50 px-2 py-3">
        <RotateCcw size={16} strokeWidth={1.4} className="mx-auto mb-1.5 text-calendula" />
        7-day easy returns
      </li>
    </ul>
  )
}

/* ------------------------------ BAG -------------------------------- */
function BagStep({ goShop }) {
  const { lines, setQty, remove, add, subtotal, discount, promo, applyPromo, clearPromo, setPage } = useCart()
  const [code, setCode] = useState('')
  const [codeMsg, setCodeMsg] = useState(null)
  const progress = Math.min(100, ((subtotal - discount) / FREE_SHIPPING_AT) * 100)
  const remaining = Math.max(0, FREE_SHIPPING_AT - (subtotal - discount))
  const suggestions = PRODUCTS.filter((p) => !lines.some((l) => l.id === p.id))

  if (!lines.length) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
        <ShoppingBag size={40} strokeWidth={1} className="mb-6 text-champagne" />
        <h2 className="font-serif text-4xl italic text-botanical">Your bag is waiting to bloom.</h2>
        <p className="mt-3 text-sm text-charcoal/60">Begin with the Glow Serum — our most-loved ritual.</p>
        <button className="btn btn-solid mt-8" onClick={goShop}>
          Explore the collection
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
      <div>
        <h2 className="display text-[clamp(2.2rem,5vw,3.8rem)] text-botanical">
          Your <span className="italic-accent">bag.</span>
        </h2>

        <div className="mt-6 rounded-2xl bg-beige/45 px-5 py-4">
          <p className="text-sm text-charcoal/70">
            {remaining > 0 ? (
              <>
                You’re <strong className="font-semibold text-botanical">{formatINR(remaining)}</strong> away from free shipping
              </>
            ) : (
              <>
                <Check size={14} className="mr-1 inline text-botanical" /> Free shipping unlocked
              </>
            )}
          </p>
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-ivory">
            <div className="h-full rounded-full bg-gradient-to-r from-calendula to-champagne transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <ul className="mt-6 divide-y divide-charcoal/10 border-y border-charcoal/10">
          {lines.map((l) => (
            <li key={l.id} className="flex gap-4 py-6 sm:gap-6">
              <img src={img(l.id)} alt={l.product.name} className="h-28 w-24 flex-none rounded-2xl object-cover sm:h-36 sm:w-32" />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-serif text-xl leading-tight text-botanical sm:text-2xl">{l.product.name}</p>
                    <p className="mt-1 text-[0.7rem] uppercase tracking-wideish text-charcoal/50">{l.product.tagline}</p>
                    <p className="mt-1 text-sm text-charcoal/60">
                      {l.product.size} · {formatINR(l.product.price)} each
                    </p>
                  </div>
                  <p className="flex-none font-display text-lg tabular-nums text-botanical">{formatINR(l.qty * l.product.price)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <QtyStepper value={l.qty} onChange={(q) => setQty(l.id, q)} label={l.product.name} />
                  <button onClick={() => remove(l.id)} className="ulink text-[0.65rem] uppercase tracking-wideish text-charcoal/55 hover:text-calendula" aria-label={`Remove ${l.product.name}`}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {suggestions.length > 0 && (
          <div className="mt-12">
            <p className="eyebrow text-calendula">Complete your ritual</p>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {suggestions.map((p) => (
                <li key={p.id} className="overflow-hidden rounded-2xl bg-beige/40">
                  <img src={img(p.id)} alt={p.name} className="aspect-[5/4] w-full object-cover" loading="lazy" />
                  <div className="flex items-center justify-between gap-2 p-3">
                    <div className="min-w-0">
                      <p className="truncate font-serif text-base text-botanical">{p.short}</p>
                      <p className="text-xs text-charcoal/55">{formatINR(p.price)}</p>
                    </div>
                    <button onClick={() => add(p.id, 1)} className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-botanical text-ivory hover:bg-calendula" aria-label={`Add ${p.name} to bag`}>
                      <Plus size={15} strokeWidth={1.6} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[2rem] bg-white/60 p-6 shadow-[0_30px_70px_-45px_rgba(36,61,45,0.45)] ring-1 ring-charcoal/5 sm:p-8">
          <p className="eyebrow mb-5 text-charcoal/50">Order summary</p>
          <form
            className="mb-6 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!code.trim()) return
              const ok = applyPromo(code)
              setCodeMsg(ok ? { ok: true, text: PROMOS[code.trim().toUpperCase()].label } : { ok: false, text: 'That code isn’t valid. Try CALENDRIA10.' })
              if (ok) setCode('')
            }}
          >
            <label className="relative flex-1">
              <span className="sr-only">Promo code</span>
              <Tag size={14} strokeWidth={1.5} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^a-z0-9]/gi, '').slice(0, LIMITS.promo))}
                maxLength={LIMITS.promo}
                autoComplete="off"
                spellCheck={false}
                placeholder={promo ? `${promo} applied` : 'Promo code'}
                className="h-11 w-full rounded-full border border-charcoal/15 bg-transparent pl-10 pr-4 text-sm uppercase outline-none placeholder:normal-case placeholder:text-charcoal/40 focus:border-calendula"
              />
            </label>
            {promo ? (
              <button type="button" onClick={() => { clearPromo(); setCodeMsg(null) }} className="h-11 rounded-full border border-charcoal/15 px-4 text-[0.65rem] uppercase tracking-wideish">
                Remove
              </button>
            ) : (
              <button type="submit" className="h-11 rounded-full border border-botanical px-5 text-[0.65rem] uppercase tracking-wideish text-botanical hover:bg-botanical hover:text-ivory">
                Apply
              </button>
            )}
          </form>
          {codeMsg && <p className={`-mt-3 mb-5 text-xs ${codeMsg.ok ? 'text-botanical' : 'text-[#b5462a]'}`}>{codeMsg.text}</p>}
          <Totals />
          <button className="btn btn-solid mt-6 w-full" onClick={() => setPage('checkout')}>
            Proceed to checkout <ArrowRight size={14} strokeWidth={1.5} />
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.7rem] text-charcoal/50">
            <Lock size={11} /> Pay with Cash on Delivery
          </p>
          <Perks />
        </div>
      </aside>
    </div>
  )
}

/* --------------------------- CHECKOUT ------------------------------ */
const EMPTY = { name: '', phone: '', email: '', address: '', landmark: '', city: '', state: 'Tamil Nadu', pin: '' }

function validate(v) {
  const e = {}
  if (v.name.trim().length < 2) e.name = 'Please enter your full name.'
  if (!/^[6-9]\d{9}$/.test(v.phone.replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''))) e.phone = 'Enter a valid 10-digit mobile number.'
  if (v.email && !EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address.'
  if (v.address.trim().length < 6) e.address = 'Please enter your house number and street.'
  if (v.city.trim().length < 2) e.city = 'Please enter your city.'
  if (!/^[1-9]\d{5}$/.test(v.pin.trim())) e.pin = 'Enter a valid 6-digit PIN code.'
  if (!STATES.includes(v.state)) e.state = 'Please choose your state.'
  return e
}

function CheckoutStep({ goShop }) {
  const { lines, total, setPage, placeOrder } = useCart()
  const [v, setV] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)
  const formRef = useRef(null)
  const [guard] = useState(() => createSubmitGuard({ gapMs: 5000, minFillMs: 800 }))

  const set = (k) => (e) => {
    const raw = e.target.value
    const value = k === 'state' ? raw : k === 'pin' ? raw.replace(/\D/g, '').slice(0, 6) : k === 'phone' ? raw.replace(/[^\d+\s-]/g, '').slice(0, LIMITS.phone) : cleanInput(raw, LIMITS[k])
    setV((s) => ({ ...s, [k]: value }))
    if (errors[k]) setErrors((s) => ({ ...s, [k]: undefined }))
  }

  if (!lines.length) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
        <ShoppingBag size={40} strokeWidth={1} className="mb-6 text-champagne" />
        <h2 className="font-serif text-4xl italic text-botanical">Nothing to check out yet.</h2>
        <button className="btn btn-solid mt-8" onClick={goShop}>
          Explore the collection
        </button>
      </div>
    )
  }

  const submit = (e) => {
    e.preventDefault()
    if (placing) return
    const errs = validate(v)
    setErrors(errs)
    if (Object.keys(errs).length) {
      formRef.current.querySelector(`#co-${Object.keys(errs)[0]}`)?.focus()
      return
    }
    // honeypot filled or form fired by a script before a person could type: pretend nothing happened
    if (e.currentTarget.elements.website?.value || guard.check() !== 'ok') return
    setPlacing(true)
    setTimeout(() => placeOrder({ ...v, phone: v.phone.replace(/[\s-]/g, '') }), 1200)
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="relative grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
      <input {...HONEYPOT_PROPS} defaultValue="" />
      <div>
        <button type="button" onClick={() => setPage('bag')} className="ulink mb-6 inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-wideish text-charcoal/60 hover:text-botanical">
          <ArrowLeft size={13} strokeWidth={1.5} /> Back to bag
        </button>
        <h2 className="display text-[clamp(2.2rem,5vw,3.8rem)] text-botanical">
          Almost <span className="italic-accent">yours.</span>
        </h2>

        <fieldset className="mt-10">
          <legend className="eyebrow mb-2 flex items-center gap-3 text-calendula">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-calendula text-[0.6rem] text-ivory">1</span> Contact
          </legend>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="co-name" maxLength={LIMITS.name} label="Full name" value={v.name} onChange={set('name')} autoComplete="name" error={errors.name} />
            <Field id="co-phone" maxLength={LIMITS.phone} label="Mobile number (10 digits)" type="tel" inputMode="numeric" value={v.phone} onChange={set('phone')} autoComplete="tel-national" error={errors.phone} />
            <Field id="co-email" maxLength={LIMITS.email} label="Email (optional, for order updates)" type="email" value={v.email} onChange={set('email')} autoComplete="email" error={errors.email} className="sm:col-span-2" />
          </div>
        </fieldset>

        <fieldset className="mt-12">
          <legend className="eyebrow mb-2 flex items-center gap-3 text-calendula">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-calendula text-[0.6rem] text-ivory">2</span> Delivery address
          </legend>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="co-address" maxLength={LIMITS.address} label="House no., building, street" value={v.address} onChange={set('address')} autoComplete="street-address" error={errors.address} className="sm:col-span-2" />
            <Field id="co-landmark" maxLength={LIMITS.landmark} label="Landmark / area (optional)" value={v.landmark} onChange={set('landmark')} className="sm:col-span-2" />
            <Field id="co-city" maxLength={LIMITS.city} label="City" value={v.city} onChange={set('city')} autoComplete="address-level2" error={errors.city} />
            <Field id="co-pin" label="PIN code" inputMode="numeric" maxLength={6} value={v.pin} onChange={set('pin')} autoComplete="postal-code" error={errors.pin} />
            <label className="block sm:col-span-2">
              <span className="text-[0.7rem] text-charcoal/55">State</span>
              <select id="co-state" value={v.state} onChange={set('state')} autoComplete="address-level1" className="mt-1 h-12 w-full rounded-none border-b border-charcoal/20 bg-transparent text-[0.95rem] text-charcoal outline-none focus:border-calendula">
                {STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset className="mt-12">
          <legend className="eyebrow mb-5 flex items-center gap-3 text-calendula">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-calendula text-[0.6rem] text-ivory">3</span> Payment method
          </legend>
          <div className="space-y-3" role="radiogroup" aria-label="Payment method">
            <label className="flex cursor-pointer items-start gap-4 rounded-2xl border-2 border-botanical bg-botanical/[0.04] p-5">
              <input type="radio" name="payment" defaultChecked className="mt-1 h-4 w-4 accent-[#243D2D]" />
              <span className="flex-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-medium text-botanical">
                    <Banknote size={18} strokeWidth={1.4} /> Cash on Delivery
                  </span>
                  <span className="rounded-full bg-calendula/15 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wideish text-calendula">No extra fee</span>
                </span>
                <span className="mt-1.5 block text-sm leading-relaxed text-charcoal/60">
                  Pay <strong className="text-botanical">{formatINR(total)}</strong> in cash (or UPI to the courier) when your order arrives.
                </span>
              </span>
            </label>
            <div className="flex items-start gap-4 rounded-2xl border border-charcoal/10 p-5 opacity-55" aria-disabled="true">
              <input type="radio" name="payment" disabled className="mt-1 h-4 w-4" />
              <span className="flex-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-medium text-charcoal">
                    <CreditCard size={18} strokeWidth={1.4} /> UPI · Cards · Net banking
                  </span>
                  <span className="text-[0.6rem] uppercase tracking-wideish text-charcoal/50">Coming soon</span>
                </span>
              </span>
            </div>
          </div>
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[2rem] bg-white/60 p-6 shadow-[0_30px_70px_-45px_rgba(36,61,45,0.45)] ring-1 ring-charcoal/5 sm:p-8">
          <p className="eyebrow mb-5 text-charcoal/50">Your order</p>
          <ul className="mb-6 space-y-4">
            {lines.map((l) => (
              <li key={l.id} className="flex items-center gap-3">
                <span className="relative flex-none">
                  <img src={img(`${l.id}-thumb`)} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-botanical px-1 text-[0.6rem] text-ivory">{l.qty}</span>
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-botanical">{l.product.name}</span>
                <span className="text-sm tabular-nums">{formatINR(l.qty * l.product.price)}</span>
              </li>
            ))}
          </ul>
          <Totals compact />
          <button type="submit" className="btn btn-solid mt-6 w-full" disabled={placing}>
            {placing ? 'Placing order…' : `Place order · ${formatINR(total)}`}
          </button>
          <p className="mt-3 text-center text-[0.68rem] leading-relaxed text-charcoal/50">Demo storefront — no real order is placed and no payment is collected.</p>
          <Perks />
        </div>
      </aside>
    </form>
  )
}

/* -------------------------- CONFIRMATION --------------------------- */
function DoneStep({ goShop }) {
  const { order } = useCart()
  const root = useRef(null)
  useEffect(() => {
    if (!root.current) return
    gsap.fromTo(root.current.querySelectorAll('[data-c]'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 1, ease: 'expo.out' })
  }, [])

  if (!order) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
        <Package size={40} strokeWidth={1} className="mb-6 text-champagne" />
        <h2 className="font-serif text-4xl italic text-botanical">No recent order.</h2>
        <button className="btn btn-solid mt-8" onClick={goShop}>
          Explore the collection
        </button>
      </div>
    )
  }
  const d = order.details
  return (
    <div ref={root} className="mx-auto max-w-3xl">
      <div data-c className="flex flex-col items-center text-center">
        <span className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-botanical text-ivory">
          <Check size={28} strokeWidth={1.4} />
        </span>
        <p className="eyebrow text-calendula">Order {order.id}</p>
        <h2 className="display mt-4 text-[clamp(2.2rem,5vw,3.8rem)] text-botanical">
          Thank you, <span className="italic-accent">{d.name.split(' ')[0]}.</span>
        </h2>
        <p className="mt-4 max-w-md text-charcoal/65">Your botanical ritual is confirmed. We’ll send updates{d.email ? ` to ${d.email}` : ''} and call {d.phone} before delivery.</p>
      </div>

      <div data-c className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-botanical p-5 text-ivory">
          <Banknote size={18} strokeWidth={1.4} className="text-champagne" />
          <p className="mt-3 text-[0.65rem] uppercase tracking-wideish text-ivory/60">Pay on delivery</p>
          <p className="mt-1 font-display text-2xl">{formatINR(order.total)}</p>
        </div>
        <div className="rounded-2xl bg-beige/50 p-5">
          <Truck size={18} strokeWidth={1.4} className="text-calendula" />
          <p className="mt-3 text-[0.65rem] uppercase tracking-wideish text-charcoal/50">Arriving</p>
          <p className="mt-1 font-serif text-xl text-botanical">{order.eta}</p>
        </div>
        <div className="rounded-2xl bg-beige/50 p-5">
          <Package size={18} strokeWidth={1.4} className="text-calendula" />
          <p className="mt-3 text-[0.65rem] uppercase tracking-wideish text-charcoal/50">Ship to</p>
          <p className="mt-1 text-sm leading-snug text-botanical">
            {d.address}
            {d.landmark ? `, ${d.landmark}` : ''}, {d.city}, {d.state} {d.pin}
          </p>
        </div>
      </div>

      <div data-c className="mt-8 rounded-[2rem] bg-white/60 p-6 ring-1 ring-charcoal/5 sm:p-8">
        <ul className="space-y-4">
          {order.lines.map((l) => (
            <li key={l.id} className="flex items-center gap-4">
              <img src={img(`${l.id}-thumb`)} alt="" className="h-14 w-14 rounded-xl object-cover" />
              <span className="flex-1 text-sm text-botanical">
                {l.product.name} <span className="text-charcoal/50">× {l.qty}</span>
              </span>
              <span className="text-sm tabular-nums">{formatINR(l.qty * l.product.price)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-charcoal/10 pt-5 text-sm">
          <div className="flex justify-between text-charcoal/65">
            <dt>Subtotal</dt>
            <dd>{formatINR(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-calendula">
              <dt>Promo {order.promo}</dt>
              <dd>− {formatINR(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between text-charcoal/65">
            <dt>Shipping</dt>
            <dd>{order.shipping ? formatINR(order.shipping) : 'Free'}</dd>
          </div>
          <div className="flex justify-between font-display text-lg text-botanical">
            <dt>Total · {order.payment}</dt>
            <dd>{formatINR(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div data-c className="mt-10 flex flex-col items-center gap-4">
        <button className="btn btn-solid" onClick={goShop}>
          Continue shopping
        </button>
        <p className="text-center text-xs text-charcoal/45">Demo storefront — this confirmation was generated in your browser; no order was sent.</p>
      </div>
    </div>
  )
}

/* ------------------------------ PAGE ------------------------------- */
export default function Checkout() {
  const { page, setPage, count } = useCart()
  const root = useRef(null)
  const [shown, setShown] = useState(page)
  useScrollLock(!!page)

  useEffect(() => {
    if (page) setShown(page)
    if (!root.current) return
    if (page && !shown) {
      gsap.fromTo(root.current, { yPercent: 100 }, { yPercent: 0, duration: 0.9, ease: 'expo.out' })
    } else if (!page && shown) {
      gsap.to(root.current, { yPercent: 100, duration: 0.7, ease: 'expo.in', onComplete: () => setShown(null) })
    }
    if (page) root.current.scrollTo({ top: 0 })
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!page) return
    const k = (e) => e.key === 'Escape' && setPage(null)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [page, setPage])

  const current = page ?? shown
  if (!current) return null

  const goShop = () => {
    setPage(null)
    setTimeout(() => scrollToId('products'), 750)
  }

  return (
    <div ref={root} className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-ivory" role="dialog" aria-modal="true" aria-label={current === 'bag' ? 'Your bag' : current === 'checkout' ? 'Checkout' : 'Order confirmed'} data-lenis-prevent>
      <header className="sticky top-0 z-10 border-b border-charcoal/[0.06] bg-ivory/95">
        <div className="gutter flex items-center justify-between gap-4 py-4">
          <button onClick={goShop} className="font-display text-[1.05rem] tracking-[0.32em] text-botanical md:text-[1.2rem]" aria-label="Back to the CALENDRIA store">
            CALENDRIA
          </button>
          <div className="hidden md:block">
            <Stepper page={current} />
          </div>
          <button onClick={() => setPage(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/15 hover:bg-botanical hover:text-ivory" aria-label="Close and return to the store">
            <X size={18} strokeWidth={1.4} />
          </button>
        </div>
        <div className="gutter pb-3 md:hidden">
          <Stepper page={current} />
        </div>
      </header>
      <main className="gutter mx-auto max-w-7xl py-10 md:py-16">
        {current === 'bag' && <BagStep goShop={goShop} />}
        {current === 'checkout' && <CheckoutStep goShop={goShop} />}
        {current === 'done' && <DoneStep goShop={goShop} />}
        {current === 'bag' && count > 0 && <div className="h-4" />}
      </main>
    </div>
  )
}
