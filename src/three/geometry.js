import * as THREE from 'three'

const lerp = (a, b, t) => a + (b - a) * t
const smooth = (t) => t * t * (3 - 2 * t)

/**
 * A single calendula ray floret: long, oblong, gently cupped, with a
 * softly notched tip. Built along +X from the origin so instances can
 * pivot from the flower's centre.
 */
export function makePetalGeometry({ length = 1, width = 0.2, segL = 28, segW = 8, cup = 0.35, arch = 0.08 } = {}) {
  const geo = new THREE.PlaneGeometry(1, 1, segL, segW)
  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const base = new THREE.Color('#9e3206')
  const mid = new THREE.Color('#e2680c')
  const tip = new THREE.Color('#f39a1a')
  const c = new THREE.Color()

  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) + 0.5 // 0..1 along length
    const v = pos.getY(i) // -0.5..0.5 across
    // width profile: narrow claw at base, broad body, rounded tip
    // calendula ray florets are strap-shaped: narrow claw, parallel sides, blunt tip
    let w = u < 0.2 ? 0.3 + 0.7 * smooth(u / 0.2) : 1 - 0.08 * Math.sin(((u - 0.2) / 0.8) * Math.PI)
    if (u > 0.9) w *= Math.sqrt(Math.max(0.04, 1 - ((u - 0.9) / 0.1) ** 2))
    let x = u * length
    // notched tip: three shallow teeth
    if (u > 0.9) x -= Math.abs(Math.sin(v * Math.PI * 3)) * 0.03 * length * ((u - 0.9) / 0.1)
    const z = v * width * w
    // cup across the width + gentle arch along the length
    const y = -(v * v) * cup * width * 2 * w + Math.sin(u * Math.PI) * arch * length - u * u * 0.04 * length
    pos.setXYZ(i, x, y, z)

    // colour: deep ember at the base -> calendula -> golden tip, darker veins
    const t = smooth(Math.min(1, u * 1.15))
    if (t < 0.5) c.copy(base).lerp(mid, t * 2)
    else c.copy(mid).lerp(tip, (t - 0.5) * 2)
    const vein = 1 - 0.07 * Math.pow(Math.cos(v * Math.PI * 7), 8) * (1 - u * 0.5)
    colors[i * 3] = c.r * vein
    colors[i * 3 + 1] = c.g * vein
    colors[i * 3 + 2] = c.b * vein
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  return geo
}

/** Small tubular disc floret used in the flower centre. */
export function makeFloretGeometry() {
  const g = new THREE.CylinderGeometry(0.012, 0.016, 0.05, 6, 1)
  g.translate(0, 0.025, 0)
  return g
}

/** Dome for the flower's centre disc. */
export function makeDiscGeometry(radius = 0.24) {
  const g = new THREE.SphereGeometry(radius, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2)
  g.scale(1, 0.38, 1)
  return g
}

/** Revolve a 2D profile (array of [r, y]) into a smooth lathe. */
export function lathe(points, segments = 96) {
  return new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments)
}

/** Rounded profile helper: superellipse corners for cosmetic glass. */
export function roundedProfile({ radius, height, corner = 0.08, bottomCorner = corner, neck = 0, neckH = 0, shoulder = 0.18, steps = 10 }) {
  const pts = [[0.0001, 0]]
  // bottom corner
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2)
    pts.push([radius - bottomCorner + Math.sin(a) * bottomCorner, bottomCorner - Math.cos(a) * bottomCorner])
  }
  const bodyTop = height - (neck ? shoulder : corner)
  pts.push([radius, bodyTop])
  if (neck) {
    // shoulder curve into neck
    for (let i = 1; i <= steps * 2; i++) {
      const t = i / (steps * 2)
      const e = smooth(t)
      pts.push([lerp(radius, neck, e), bodyTop + Math.sin((t * Math.PI) / 2) * shoulder])
    }
    pts.push([neck, height + neckH])
    pts.push([neck * 0.82, height + neckH])
    pts.push([0.0001, height + neckH])
  } else {
    for (let i = 1; i <= steps; i++) {
      const a = (i / steps) * (Math.PI / 2)
      pts.push([radius - corner + Math.cos(a) * corner, bodyTop + Math.sin(a) * corner])
    }
    pts.push([0.0001, height])
  }
  return pts
}

/* ------------------------------------------------------------------ */
/*  Label texture — drawn on a canvas with the site's typography       */
/* ------------------------------------------------------------------ */

function drawMiniCalendula(ctx, cx, cy, r, alpha = 1) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(cx, cy)
  const rings = [
    { n: 18, len: r, w: r * 0.2, col: '#efa02a', rot: 0 },
    { n: 14, len: r * 0.78, w: r * 0.2, col: '#e5841e', rot: 0.12 },
  ]
  rings.forEach((ring) => {
    for (let i = 0; i < ring.n; i++) {
      ctx.save()
      ctx.rotate((i / ring.n) * Math.PI * 2 + ring.rot)
      const g = ctx.createLinearGradient(0, 0, ring.len, 0)
      g.addColorStop(0, '#c4550f')
      g.addColorStop(0.45, ring.col)
      g.addColorStop(1, '#f6bd45')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(r * 0.16, 0)
      ctx.quadraticCurveTo(ring.len * 0.55, -ring.w, ring.len, -ring.w * 0.25)
      ctx.lineTo(ring.len, ring.w * 0.25)
      ctx.quadraticCurveTo(ring.len * 0.55, ring.w, r * 0.16, 0)
      ctx.fill()
      ctx.restore()
    }
  })
  const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.26)
  cg.addColorStop(0, '#5a2a0a')
  cg.addColorStop(1, '#a4500f')
  ctx.fillStyle = cg
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.26, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function makeLabelTexture({ title = 'Glow Serum', sub = '', size = '', tint = '#f6f0e4', aspect = 1.2 } = {}) {
  const W = 1024
  const H = Math.round(W / aspect)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8

  const draw = () => {
    ctx.clearRect(0, 0, W, H)
    // paper
    const bg = ctx.createLinearGradient(0, 0, W, 0)
    bg.addColorStop(0, '#e8dfcf')
    bg.addColorStop(0.5, tint)
    bg.addColorStop(1, '#e8dfcf')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)
    // fine paper grain
    ctx.globalAlpha = 0.05
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = i % 2 ? '#7a6a50' : '#ffffff'
      ctx.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4)
    }
    ctx.globalAlpha = 1

    // decorative flowers in the corners
    drawMiniCalendula(ctx, W * 0.36, H * 0.86, H * 0.1, 0.9)
    drawMiniCalendula(ctx, W * 0.66, H * 0.9, H * 0.06, 0.65)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#2b2a24'
    // brand wordmark — typographic only
    ctx.font = `500 ${Math.round(H * 0.07)}px "Cormorant Garamond", Georgia, serif`
    ctx.letterSpacing = `${Math.round(H * 0.022)}px`
    ctx.fillText('CALENDRIA', W / 2 + H * 0.011, H * 0.2)
    ctx.letterSpacing = '0px'

    // hairline
    ctx.strokeStyle = 'rgba(200,165,106,0.9)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(W / 2 - H * 0.06, H * 0.26)
    ctx.lineTo(W / 2 + H * 0.06, H * 0.26)
    ctx.stroke()

    ctx.font = `400 ${Math.round(H * 0.1)}px "Cormorant Garamond", Georgia, serif`
    ctx.fillText('Calendula', W / 2, H * 0.41)
    ctx.fillText(title, W / 2, H * 0.53)

    ctx.font = `500 ${Math.round(H * 0.036)}px Manrope, system-ui, sans-serif`
    ctx.letterSpacing = `${Math.round(H * 0.008)}px`
    ctx.fillStyle = '#5b5547'
    ctx.fillText(sub, W / 2, H * 0.64)
    ctx.font = `400 ${Math.round(H * 0.05)}px "Cormorant Garamond", Georgia, serif`
    ctx.letterSpacing = '0px'
    ctx.fillStyle = '#2b2a24'
    ctx.fillText(size, W / 2, H * 0.76)
    tex.needsUpdate = true
  }

  draw()
  if (document.fonts?.ready) document.fonts.ready.then(draw)
  return tex
}
