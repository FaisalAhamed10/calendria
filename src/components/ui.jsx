import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion, smoothScrub } from '../lib/motion'
import { img } from '../data/products'

/**
 * Words wrapped in overflow-hidden lines so they can rise in one by one.
 * Pass `lines` as an array of strings (each becomes its own line), or `text`.
 * Words can be marked italic by wrapping them in *asterisks*.
 */
export function SplitText({ lines, text, as: Tag = 'h2', className = '', wordClass = '', lineClass = '', ...rest }) {
  const L = lines ?? [text]
  return (
    <Tag className={className} aria-label={L.join(' ').replace(/\*/g, '')} {...rest}>
      {L.map((line, li) => (
        <span key={li} className={`split-line ${lineClass}`} aria-hidden="true">
          {line.split(' ').map((w, wi) => {
            const it = w.startsWith('*') && w.endsWith('*')
            return (
              <span key={wi} className={`split-word ${wordClass} ${it ? 'italic-accent' : ''}`}>
                {it ? w.slice(1, -1) : w}
                {wi < line.split(' ').length - 1 ? ' ' : ''}
              </span>
            )
          })}
        </span>
      ))}
    </Tag>
  )
}

/** Reveal `.split-word`s inside `ref` when it scrolls into view. */
export function useWordReveal(ref, { start = 'top 82%', stagger = 0.06, delay = 0 } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      el.querySelectorAll('[data-reveal="words"]').forEach((block) => {
        gsap.fromTo(
          block.querySelectorAll('.split-word'),
          { yPercent: 115, rotate: 3 },
          {
            yPercent: 0,
            rotate: 0,
            duration: 1.25,
            ease: 'expo.out',
            stagger,
            delay,
            scrollTrigger: { trigger: block, start, once: true },
          }
        )
      })
      el.querySelectorAll('[data-reveal="fade"]').forEach((node) => {
        gsap.fromTo(
          node,
          { y: 36, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: node, start, once: true } }
        )
      })
      el.querySelectorAll('[data-speed]').forEach((node) => {
        const speed = parseFloat(node.dataset.speed)
        node.style.willChange = 'transform'
        gsap.fromTo(
          node,
          { yPercent: -speed * 50 },
          {
            yPercent: speed * 50,
            ease: 'none',
            scrollTrigger: { trigger: node.closest('section') ?? node, start: 'top bottom', end: 'bottom top', scrub: smoothScrub() },
          }
        )
      })
    }, el)
    return () => ctx.revert()
  }, [ref, start, stagger, delay])
}

/** Product photograph with AVIF + WebP sources. */
export function Photo({ id, alt, className = '', imgClassName = '', eager = false, sizes = '(max-width: 768px) 90vw, 40vw' }) {
  return (
    <picture className={className}>
      <source srcSet={img(id, 'avif')} type="image/avif" />
      <img
        src={img(id, 'webp')}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        sizes={sizes}
        width="1016"
        height="836"
        className={imgClassName}
      />
    </picture>
  )
}

/**
 * Decorative calendula drawn in SVG — used as illustration in the
 * campaign, footer and section ornaments (never as a logo).
 */
export function CalendulaArt({ className = '', rings = 3, petals = 22, tone = 'warm', strokeOnly = false, title, ...rest }) {
  const uid = useRef(`c${Math.random().toString(36).slice(2, 8)}`).current
  const palette =
    tone === 'gold'
      ? ['#8f6f3a', '#c8a56a', '#e6cc95']
      : ['#b5440b', '#e58a35', '#f6bd45']
  const ringDefs = Array.from({ length: rings }, (_, r) => ({
    n: Math.max(10, petals - r * 4),
    len: 96 - r * 18,
    w: 15 - r * 1.5,
    rot: r * 7,
  }))
  return (
    <svg viewBox="-110 -110 220 220" className={className} role={title ? 'img' : 'presentation'} aria-hidden={title ? undefined : true} {...rest}>
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={`${uid}p`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={palette[0]} />
          <stop offset="0.5" stopColor={palette[1]} />
          <stop offset="1" stopColor={palette[2]} />
        </linearGradient>
        <radialGradient id={`${uid}c`}>
          <stop offset="0" stopColor={tone === 'gold' ? '#5a4520' : '#3d1a06'} />
          <stop offset="1" stopColor={tone === 'gold' ? '#a88550' : '#a4500f'} />
        </radialGradient>
      </defs>
      {ringDefs.map((ring, r) => (
        <g key={r} transform={`rotate(${ring.rot})`}>
          {Array.from({ length: ring.n }, (_, i) => (
            <path
              key={i}
              transform={`rotate(${(i / ring.n) * 360})`}
              d={`M14 0 C ${ring.len * 0.35} ${-ring.w} ${ring.len * 0.8} ${-ring.w * 0.95} ${ring.len} ${-ring.w * 0.3} L ${ring.len - 3} 0 L ${ring.len} ${ring.w * 0.3} C ${ring.len * 0.8} ${ring.w * 0.95} ${ring.len * 0.35} ${ring.w} 14 0 Z`}
              fill={strokeOnly ? 'none' : `url(#${uid}p)`}
              stroke={strokeOnly ? 'currentColor' : 'rgba(120,40,0,0.18)'}
              strokeWidth={strokeOnly ? 0.6 : 0.4}
              opacity={strokeOnly ? 0.9 : 1 - r * 0.05}
            />
          ))}
        </g>
      ))}
      <circle r="22" fill={strokeOnly ? 'none' : `url(#${uid}c)`} stroke={strokeOnly ? 'currentColor' : 'none'} strokeWidth="0.6" />
      {!strokeOnly &&
        Array.from({ length: 60 }, (_, i) => {
          const a = i * 2.39996
          const rr = Math.sqrt(i / 60) * 19
          return <circle key={i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r={1.1} fill={tone === 'gold' ? '#d8bd85' : '#e8892a'} opacity={0.45 + (i / 60) * 0.5} />
        })}
    </svg>
  )
}

/** A single loose petal shape for DOM petal drifts. */
export function PetalSVG({ className = '', style }) {
  return (
    <svg viewBox="0 0 60 20" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id="petal-g" x1="0" x2="1">
          <stop offset="0" stopColor="#c4500e" />
          <stop offset="0.55" stopColor="#ec8a1e" />
          <stop offset="1" stopColor="#f7b52c" />
        </linearGradient>
      </defs>
      <path d="M2 10 C 14 1, 40 0, 58 6 L 55 10 L 58 14 C 40 20, 14 19, 2 10 Z" fill="url(#petal-g)" />
      <path d="M6 10 C 24 9, 40 9, 54 10" stroke="rgba(150,60,0,0.25)" strokeWidth="0.6" fill="none" />
    </svg>
  )
}

/** Floating-label input with an animated calendula underline. */
export function Field({ id, label, as = 'input', type = 'text', error, className = '', ...rest }) {
  const Tag = as
  return (
    <div className={`field ${className}`} data-error={!!error}>
      <Tag
        id={id}
        name={id}
        placeholder=" "
        type={as === 'input' ? type : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        {...rest}
      />
      <span className="bar" aria-hidden="true" />
      <label htmlFor={id}>{label}</label>
      {error && (
        <p id={`${id}-err`} className="mt-2 text-xs text-[#b5462a]">
          {error}
        </p>
      )}
    </div>
  )
}

export function Stars({ n = 5, className = '' }) {
  return (
    <div className={`flex gap-1 ${className}`} aria-label={`${n} out of 5 stars`} role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={`h-3.5 w-3.5 ${i < n ? 'text-champagne' : 'text-charcoal/15'}`} aria-hidden="true">
          <path fill="currentColor" d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L1.3 7.8l6.1-.7z" />
        </svg>
      ))}
    </div>
  )
}
