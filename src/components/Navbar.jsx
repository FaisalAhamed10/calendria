import { useEffect, useRef, useState } from 'react'
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from '../lib/cart'
import { gsap, ScrollTrigger, scrollToId, useScrollLock } from '../lib/motion'
import SocialLinks from './Social'

export const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'products', label: 'Products' },
  { id: 'contact', label: 'Contact' },
]

export default function Navbar() {
  const { count, bump, setOpen, setPanel } = useCart()
  const [solid, setSolid] = useState(false)
  const [active, setActive] = useState('home')
  const [menu, setMenu] = useState(false)
  const menuRef = useRef(null)
  const badge = useRef(null)

  // Solid background after the first scroll. Active link comes from ScrollTrigger's cached
  // positions, so nothing is measured while the page is moving.
  useEffect(() => {
    // scrollY is a cheap read (no layout); stays solid all the way down to the footer
    const onScroll = () => setSolid(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    let triggers = []
    // the deepest section already passed wins (cached trigger starts, no layout reads)
    const pick = () => {
      const passed = triggers.filter((t) => t.isActive).sort((x, y) => y.start - x.start)[0]
      setActive(passed ? passed.vars.id.slice(4) : 'home')
    }
    // wait a tick so pinned sections have inserted their spacers
    const id = setTimeout(() => {
      triggers = NAV.map((n) => {
        const el = document.getElementById(n.id)
        if (!el) return null
        return ScrollTrigger.create({
          id: `nav-${n.id}`,
          trigger: el,
          start: 'top 40%',
          end: 'max',
          onToggle: () => pick(),
        })
      }).filter(Boolean)
      ScrollTrigger.refresh()
      pick()
    }, 50)
    return () => {
      clearTimeout(id)
      window.removeEventListener('scroll', onScroll)
      triggers.forEach((t) => t.kill())
    }
  }, [])

  // badge bump on add
  useEffect(() => {
    if (!bump || !badge.current) return
    badge.current.classList.remove('bag-bump')
    void badge.current.offsetWidth
    badge.current.classList.add('bag-bump')
  }, [bump])

  useEffect(() => {
    if (!menuRef.current) return
    if (menu) {
      gsap.fromTo(menuRef.current, { clipPath: 'circle(0% at 100% 0%)' }, { clipPath: 'circle(150% at 100% 0%)', duration: 1, ease: 'expo.inOut' })
      gsap.fromTo(menuRef.current.querySelectorAll('[data-m]'), { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.07, delay: 0.35 })
    }
  }, [menu])
  useScrollLock(menu)

  const go = (id) => {
    setMenu(false)
    setTimeout(() => scrollToId(id), menu ? 120 : 0)
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-silk ${solid ? 'py-3' : 'py-5 md:py-7'}`}
      >
        <div
          className={`absolute inset-0 -z-10 transition-opacity duration-700 ${solid ? 'opacity-100' : 'opacity-0'} glass-panel border-b border-charcoal/[0.06]`}
          aria-hidden="true"
        />
        <nav className="gutter flex items-center justify-between" aria-label="Primary">
          <button onClick={() => go('home')} className="font-display text-[1.15rem] tracking-[0.34em] text-botanical md:text-[1.3rem]" aria-label="CALENDRIA — back to top">
            CALENDRIA
          </button>

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 lg:flex">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    go(n.id)
                  }}
                  aria-current={active === n.id}
                  className={`ulink eyebrow text-[0.66rem] transition-colors ${active === n.id ? 'text-botanical' : 'text-charcoal/65 hover:text-botanical'}`}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 text-botanical md:gap-2">
            <IconBtn label="Search products" onClick={() => setPanel('search')}>
              <Search size={18} strokeWidth={1.4} />
            </IconBtn>
            <IconBtn label="Account" onClick={() => setPanel('account')} className="hidden sm:inline-flex">
              <User size={18} strokeWidth={1.4} />
            </IconBtn>
            <IconBtn label={`Shopping bag, ${count} items`} onClick={() => setOpen(true)} id="bag-icon">
              <ShoppingBag size={18} strokeWidth={1.4} />
              <span
                ref={badge}
                className={`absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-calendula px-1 text-[0.6rem] font-semibold text-ivory transition-transform duration-500 ${count ? 'scale-100' : 'scale-0'}`}
                aria-hidden="true"
              >
                {count}
              </span>
            </IconBtn>
            <IconBtn label="Open menu" onClick={() => setMenu(true)} className="lg:hidden">
              <Menu size={20} strokeWidth={1.4} />
            </IconBtn>
          </div>
        </nav>
      </header>

      {menu && (
        <div ref={menuRef} className="fixed inset-0 z-[60] flex flex-col bg-ivory" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="gutter flex items-center justify-between py-5">
            <span className="font-display text-[1.15rem] tracking-[0.34em] text-botanical">CALENDRIA</span>
            <IconBtn label="Close menu" onClick={() => setMenu(false)}>
              <X size={22} strokeWidth={1.4} />
            </IconBtn>
          </div>
          <ul className="gutter mt-10 flex flex-1 flex-col gap-2">
            {NAV.map((n, i) => (
              <li key={n.id} className="overflow-hidden">
                <a
                  data-m
                  href={`#${n.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    go(n.id)
                  }}
                  className="flex items-baseline gap-4 font-display text-[3.2rem] uppercase leading-[1.05] text-botanical"
                >
                  <span className="font-sans text-xs text-calendula">0{i + 1}</span>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="gutter flex items-center justify-between border-t border-charcoal/10 py-6 text-sm text-charcoal/60">
            <span>hello@calendria.com</span>
            <SocialLinks itemClass="border-charcoal/15 text-botanical" />
          </div>
        </div>
      )}
    </>
  )
}

function IconBtn({ children, label, onClick, className = '', id }) {
  return (
    <button
      id={id}
      onClick={onClick}
      aria-label={label}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-500 hover:bg-botanical/[0.07] ${className}`}
    >
      {children}
    </button>
  )
}
