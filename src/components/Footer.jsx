import { useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { scrollToId } from '../lib/motion'
import SocialLinks from './Social'
import { CalendulaArt } from './ui'

const LINKS = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Products', id: 'products' },
  { label: 'Contact', id: 'contact' },
]

const LEGAL = {
  privacy: {
    title: 'Privacy Policy',
    body: 'CALENDRIA is a demonstration storefront. We do not collect, store or share personal data: forms on this site validate in your browser only, and your bag is kept in your own browser storage.',
  },
  terms: {
    title: 'Terms & Conditions',
    body: 'Products, prices and reviews shown are fictional and for design demonstration. No orders are processed and no payment is taken.',
  },
}

export default function Footer() {
  const [legal, setLegal] = useState(null)
  return (
    <footer className="relative overflow-hidden bg-botanical text-ivory">
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[34rem] w-[34rem] opacity-25 md:-bottom-48 md:-right-32" aria-hidden="true">
        <CalendulaArt className="spin-slow h-full w-full" tone="gold" rings={4} petals={28} />
      </div>
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_85%_20%,rgba(200,165,106,0.18),transparent_55%)]" aria-hidden="true" />

      <div className="gutter relative pb-10 pt-24 md:pt-32">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="font-display text-[clamp(2.2rem,5.2vw,5rem)] leading-none tracking-[0.16em] text-champagne">CALENDRIA</p>
            <p className="mt-6 max-w-sm font-serif text-2xl italic leading-snug text-ivory/85">Nature-inspired skincare. A ritual of botanical beauty.</p>
            <SocialLinks className="mt-10" itemClass="border-champagne/40 text-champagne hover:bg-champagne hover:text-botanical" />
          </div>

          <nav className="md:col-span-3" aria-label="Footer">
            <p className="eyebrow mb-6 text-champagne">Navigate</p>
            <ul className="space-y-3">
              {LINKS.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToId(l.id)
                    }}
                    className="ulink text-ivory/80 hover:text-ivory"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <button onClick={() => setLegal('privacy')} className="ulink text-ivory/80 hover:text-ivory">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => setLegal('terms')} className="ulink text-ivory/80 hover:text-ivory">
                  Terms &amp; Conditions
                </button>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="eyebrow mb-6 text-champagne">Contact</p>
            <ul className="space-y-3 text-ivory/80">
              <li>
                <a href="mailto:hello@calendria.com" className="ulink hover:text-ivory">
                  hello@calendria.com
                </a>
              </li>
              <li>
                <a href="tel:+919443127586" className="ulink hover:text-ivory">
                  +91 94431 27586
                </a>
              </li>
              <li>Chennai, Tamil Nadu, India.</li>
            </ul>
          </div>
        </div>

        {legal && (
          <div className="mt-14 max-w-2xl rounded-3xl border border-champagne/30 bg-ivory/5 p-6" role="region" aria-label={LEGAL[legal].title}>
            <div className="flex items-start justify-between gap-6">
              <p className="font-serif text-xl italic text-champagne">{LEGAL[legal].title}</p>
              <button onClick={() => setLegal(null)} className="text-xs uppercase tracking-wideish text-ivory/60 hover:text-ivory">
                Close
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ivory/70">{LEGAL[legal].body}</p>
          </div>
        )}

        <div className="mt-20 flex flex-col-reverse items-start justify-between gap-6 border-t border-champagne/25 pt-8 text-sm text-ivory/60 md:flex-row md:items-center">
          {/* copyright + credit on one line at every width */}
          <p className="whitespace-nowrap text-[clamp(0.56rem,2.65vw,0.875rem)]">
            © 2026 CALENDRIA. All Rights Reserved. Made with 💙 by{' '}
            <a href="https://luphera.com/" target="_blank" rel="noopener noreferrer" className="ulink text-champagne hover:text-ivory">
              Luphera
            </a>
          </p>
          <button onClick={() => scrollToId('home')} className="group inline-flex items-center gap-3 text-xs uppercase tracking-wideish text-ivory/70 hover:text-ivory">
            Back to top
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-champagne/40 transition-transform duration-500 group-hover:-translate-y-1">
              <ArrowUp size={14} strokeWidth={1.5} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}
