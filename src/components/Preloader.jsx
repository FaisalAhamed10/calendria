import { useEffect, useState } from 'react'
import { prefersReducedMotion, whenScenesReady } from '../lib/motion'
import { CalendulaArt } from './ui'

/**
 * Opening curtain. Every animation here is a CSS transform/opacity keyframe,
 * so it runs on the compositor and stays fluid while the 3D scenes compile
 * on the main thread underneath. The curtain lifts once the scenes are ready.
 *
 * onReveal: the curtain starts lifting (hero intro plays under it)
 * onDone:   the curtain is gone (unmount)
 */
export default function Preloader({ onReveal, onDone }) {
  const [state, setState] = useState('loading') // loading -> leaving

  useEffect(() => {
    if (prefersReducedMotion()) {
      onReveal()
      onDone()
      return
    }
    let alive = true
    document.documentElement.style.overflow = 'hidden'
    const minTime = new Promise((r) => setTimeout(r, 2300))
    Promise.all([minTime, whenScenesReady(4500)]).then(() => {
      if (!alive) return
      setState('leaving')
      setTimeout(() => alive && onReveal(), 250)
      setTimeout(() => {
        document.documentElement.style.overflow = ''
        if (alive) onDone()
      }, 1250)
    })
    return () => {
      alive = false
      document.documentElement.style.overflow = ''
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`preloader ${state === 'leaving' ? 'is-leaving' : ''}`} aria-hidden="true">
      <div className="preloader-inner">
        <div className="preloader-bloom">
          <CalendulaArt className="h-full w-full spin-slow" rings={2} petals={18} />
        </div>
        <div className="flex overflow-hidden font-display text-[clamp(2.2rem,6vw,4.5rem)] tracking-[0.3em]">
          {'CALENDRIA'.split('').map((c, i) => (
            <span key={i} className="preloader-letter" style={{ '--i': i }}>
              {c}
            </span>
          ))}
        </div>
        <div className="preloader-track">
          <span className="preloader-bar" />
        </div>
        <p className="preloader-note eyebrow text-[0.6rem] text-ivory/60">Botanical skincare · Calendula</p>
      </div>
    </div>
  )
}
