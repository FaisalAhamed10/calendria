import { useRef, useState } from 'react'
import { ArrowRight, Check, Mail, MapPin, Phone } from 'lucide-react'
import SocialLinks from './Social'
import { CalendulaArt, Field, SplitText, useWordReveal } from './ui'
import { cleanField, cleanInput, createSubmitGuard, EMAIL_RE, HONEYPOT_PROPS, LIMITS } from '../lib/security'

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '' }

function validate(v) {
  const e = {}
  if (v.name.trim().length < 2) e.name = 'Please share your name.'
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Please enter a valid email address.'
  if (v.phone && !/^[+\d][\d\s-]{7,15}$/.test(v.phone.trim())) e.phone = 'Please enter a valid phone number.'
  if (v.subject.trim().length < 2) e.subject = 'What is this about?'
  if (v.message.trim().length < 10) e.message = 'A few more words, please (10+ characters).'
  return e
}

export default function Contact() {
  const root = useRef(null)
  const [v, setV] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [notice, setNotice] = useState('')
  const [guard] = useState(() => createSubmitGuard({ gapMs: 20000, minFillMs: 3000 }))
  useWordReveal(root)

  const set = (k) => (e) => {
    setNotice('')
    setV((s) => ({ ...s, [k]: cleanInput(e.target.value, LIMITS[k]) }))
    if (errors[k]) setErrors((s) => ({ ...s, [k]: undefined }))
  }

  const submit = (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const clean = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, cleanField(x, LIMITS[k])]))
    const errs = validate(clean)
    setErrors(errs)
    if (Object.keys(errs).length) {
      root.current.querySelector(`#c-${Object.keys(errs)[0]}`)?.focus()
      return
    }
    if (e.currentTarget.elements.website?.value) return // bot filled the hidden field
    const verdict = guard.check()
    if (verdict !== 'ok') {
      setNotice(verdict === 'too-soon' ? 'You just sent a message — please wait a few seconds before sending another.' : 'One moment — please check your message and send again.')
      return
    }
    setStatus('sending')
    setTimeout(() => {
      setStatus('sent')
      setV(EMPTY)
    }, 1100)
  }

  return (
    <section id="contact" ref={root} data-petals className="relative overflow-hidden bg-ivory py-28 md:py-40">
      <CalendulaArt className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 text-champagne/50" strokeOnly rings={3} />
      <div className="gutter relative grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p data-reveal="fade" className="eyebrow mb-6 flex items-center gap-3 text-calendula">
            <span className="h-px w-8 bg-calendula" /> Contact
          </p>
          <SplitText data-reveal="words" lines={["Let's", '*connect.*']} className="display offset-last text-[clamp(2.8rem,7vw,7rem)] text-botanical" />
          <p data-reveal="fade" className="mt-8 max-w-sm leading-relaxed text-charcoal/65">
            Questions about your ritual, an order, or a collaboration? Our botanical care team replies within one working day.
          </p>

          <ul data-reveal="fade" className="mt-12 space-y-6">
            <li className="flex items-start gap-4">
              <Mail size={18} strokeWidth={1.3} className="mt-1 text-calendula" />
              <div>
                <p className="eyebrow text-[0.6rem] text-charcoal/45">Email</p>
                <a href="mailto:hello@calendria.com" className="ulink mt-1 inline-block font-serif text-xl text-botanical">
                  hello@calendria.com
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Phone size={18} strokeWidth={1.3} className="mt-1 text-calendula" />
              <div>
                <p className="eyebrow text-[0.6rem] text-charcoal/45">Phone</p>
                <a href="tel:+919443127586" className="ulink mt-1 inline-block font-serif text-xl text-botanical">
                  +91 94431 27586
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <MapPin size={18} strokeWidth={1.3} className="mt-1 text-calendula" />
              <div>
                <p className="eyebrow text-[0.6rem] text-charcoal/45">Studio</p>
                <address className="mt-1 font-serif text-xl not-italic leading-snug text-botanical">
                  24 Botanical Avenue,
                  <br />
                  Anna Nagar, Chennai,
                  <br />
                  Tamil Nadu 600040, India.
                </address>
              </div>
            </li>
          </ul>
          <SocialLinks className="mt-10" itemClass="border-charcoal/15 text-botanical hover:border-botanical hover:bg-botanical hover:text-ivory" />
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="relative rounded-[2.5rem] bg-beige/45 p-7 md:p-12">
            {status === 'sent' ? (
              <div className="flex min-h-[460px] flex-col items-center justify-center text-center" role="status">
                <span className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-botanical text-ivory">
                  <Check size={26} strokeWidth={1.4} />
                </span>
                <p className="font-display text-3xl uppercase text-botanical">Message received</p>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-charcoal/65">Thank you for writing to us. (This is a demo — no message was actually sent.)</p>
                <button className="btn btn-ghost mt-8" onClick={() => setStatus('idle')}>
                  Write another
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="relative grid gap-7 sm:grid-cols-2">
                <input {...HONEYPOT_PROPS} defaultValue="" />
                <Field id="c-name" maxLength={LIMITS.name} label="Full name" value={v.name} onChange={set('name')} autoComplete="name" error={errors.name} />
                <Field id="c-email" maxLength={LIMITS.email} label="Email address" type="email" value={v.email} onChange={set('email')} autoComplete="email" error={errors.email} />
                <Field id="c-phone" maxLength={LIMITS.phone} label="Phone number" type="tel" value={v.phone} onChange={set('phone')} autoComplete="tel" error={errors.phone} />
                <Field id="c-subject" maxLength={LIMITS.subject} label="Subject" value={v.subject} onChange={set('subject')} error={errors.subject} />
                <Field id="c-message" maxLength={LIMITS.message} as="textarea" rows={5} label="Message" value={v.message} onChange={set('message')} error={errors.message} className="sm:col-span-2" />
                <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2">
                  <p className="text-xs text-charcoal/50" role="status">{notice ? <span className="text-[#b5462a]">{notice}</span> : 'We’ll only use your details to reply.'}</p>
                  <button type="submit" className="btn btn-solid" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Sending…' : 'Send message'} <ArrowRight size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
