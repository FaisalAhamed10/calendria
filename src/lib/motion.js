import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })
export { gsap, ScrollTrigger }

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Touch-first device (phones, tablets): the browser scrolls natively there, without Lenis' glide. */
export const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches

/**
 * Scrub value for scroll-linked effects. On desktop Lenis already smooths the scroll, so effects
 * can follow it 1:1. On touch the native scroll arrives in uneven steps, so a short catch-up
 * keeps parallax and masks gliding instead of stuttering.
 */
export const smoothScrub = (desktop = true) => (isTouch() ? (desktop === true ? 0.5 : Math.max(desktop, 0.5)) : desktop)

export const isSmallScreen = () =>
  typeof window !== 'undefined' && (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768)

export function useMedia(query) {
  const [match, setMatch] = useState(() => (typeof window === 'undefined' ? false : window.matchMedia(query).matches))
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)')
export const useMobile = () => useMedia('(max-width: 767px)')

/** Shared pointer position, normalised to -1..1. Consumers smooth it themselves. */
export const pointer = { x: 0, y: 0 }
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    },
    { passive: true }
  )
}

/** Lenis handle so navigation can scroll smoothly to anchors. */
export const scroller = { lenis: null }
export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (scroller.lenis) scroller.lenis.scrollTo(el, { offset: id === 'home' ? 0 : -10, duration: 1.8 })
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

/**
 * 3D scenes register while their shaders compile; the preloader waits for
 * all of them so no compile stall ever lands mid-scroll.
 */
let pendingScenes = 0
let sceneWaiters = []
export function registerScene() {
  pendingScenes++
  let released = false
  return () => {
    if (released) return
    released = true
    pendingScenes--
    if (pendingScenes <= 0) {
      sceneWaiters.forEach((f) => f())
      sceneWaiters = []
    }
  }
}
export function whenScenesReady(timeout = 6000) {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeout)
    const done = () => {
      clearTimeout(timer)
      resolve()
    }
    // give Stage components a frame to register before checking
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (pendingScenes <= 0) done()
        else sceneWaiters.push(done)
      })
    )
  })
}

/** Freeze page scroll while overlays (menu, drawers, modals) are open. */
let locks = 0
export function lockScroll(on) {
  locks = Math.max(0, locks + (on ? 1 : -1))
  const locked = locks > 0
  document.documentElement.style.overflow = locked ? 'hidden' : ''
  if (scroller.lenis) locked ? scroller.lenis.stop() : scroller.lenis.start()
}
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return
    lockScroll(true)
    return () => lockScroll(false)
  }, [active])
}

/** Is the element near the viewport? Used to pause offscreen WebGL canvases. */
export function useInView(rootMargin = '200px') {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])
  return [ref, inView]
}

/** Only genuinely low-end devices get the simplified (non-refractive) glass. */
export const liteGPU = () =>
  typeof navigator !== 'undefined' && ((navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3)

/** WebGL support check — falls back to photography when unavailable. */
let glOk = null
export function hasWebGL() {
  if (glOk !== null) return glOk
  try {
    const c = document.createElement('canvas')
    glOk = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    glOk = false
  }
  return glOk
}
