import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion, scroller } from './lib/motion'
import { CartProvider } from './lib/cart'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Ingredients from './components/Ingredients'
import ProductCollection from './components/ProductCollection'
import RitualScroll from './components/RitualScroll'
import Product3D from './components/Product3D'
import About from './components/About'
import Campaign from './components/Campaign'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Preloader from './components/Preloader'
import PetalDrift from './components/PetalDrift'
import { AccountPanel, CartDrawer, ProductDetail, SearchPanel, Toast } from './components/Overlays'
import Checkout from './components/Checkout'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    // lerp-based glide feels silkier than a fixed duration and never queues up long tweens
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.4 })
    scroller.lenis = lenis
    if (import.meta.env.DEV) window.__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      scroller.lenis = null
    }
  }, [])

  // Recalculate trigger positions once fonts and images settle.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  return (
    <CartProvider>
      {loading && <Preloader onReveal={() => setRevealed(true)} onDone={() => setLoading(false)} />}
      <a href="#products" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-botanical focus:px-5 focus:py-3 focus:text-ivory">
        Skip to products
      </a>
      <Navbar />
      <main>
        <Hero ready={revealed} />
        <Ingredients />
        <ProductCollection />
        <RitualScroll />
        <Product3D />
        <About />
        <Campaign />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <PetalDrift />
      <CartDrawer />
      <Checkout />
      <ProductDetail />
      <SearchPanel />
      <AccountPanel />
      <Toast />
    </CartProvider>
  )
}
