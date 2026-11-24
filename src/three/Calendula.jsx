import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { makeDiscGeometry, makeFloretGeometry, makePetalGeometry } from './geometry'

const GOLDEN = Math.PI * (3 - Math.sqrt(5))

/**
 * Procedural Calendula officinalis bloom.
 * - Several whorls of ray florets that open from a closed bud (open=0) to a
 *   flat, generous bloom (open=1).
 * - A domed disc of tubular florets laid out with phyllotaxis.
 * Every petal breathes on its own phase so the flower feels alive.
 *
 * `control` is a mutable object (often tweened by GSAP) with { open, spin }.
 */
export default function Calendula({ control, quality = 'high', ...props }) {
  const petals = useRef()
  const florets = useRef()
  const group = useRef()
  const hi = quality === 'high'

  const rings = useMemo(
    () => [
      { n: hi ? 30 : 22, len: 1.0, tiltOpen: 0.04, tiltClosed: 1.25, lift: 0.0, scaleJ: 0.12 },
      { n: hi ? 26 : 18, len: 0.9, tiltOpen: 0.16, tiltClosed: 1.32, lift: 0.025, scaleJ: 0.1 },
      { n: hi ? 22 : 16, len: 0.76, tiltOpen: 0.3, tiltClosed: 1.4, lift: 0.05, scaleJ: 0.1 },
      { n: hi ? 18 : 12, len: 0.56, tiltOpen: 0.5, tiltClosed: 1.46, lift: 0.075, scaleJ: 0.08 },
    ],
    [hi]
  )

  const petalGeo = useMemo(() => {
    const g = makePetalGeometry({ length: 0.85, width: 0.2, segL: hi ? 28 : 16, segW: hi ? 8 : 5 })
    g.translate(0.2, 0, 0) // petals emerge from the rim of the disc
    return g
  }, [hi])
  const floretGeo = useMemo(() => makeFloretGeometry(), [])
  const discGeo = useMemo(() => makeDiscGeometry(0.3), [])

  // static per-petal data
  const data = useMemo(() => {
    const arr = []
    rings.forEach((ring, r) => {
      const offset = r * 0.37
      for (let i = 0; i < ring.n; i++) {
        const rnd = Math.sin((i + 1) * 12.9898 + r * 78.233) * 43758.5453
        const j = rnd - Math.floor(rnd)
        arr.push({
          ring: r,
          az: (i / ring.n) * Math.PI * 2 + offset + (j - 0.5) * 0.08,
          len: ring.len * (1 - ring.scaleJ / 2 + j * ring.scaleJ),
          twist: (j - 0.5) * 0.35,
          phase: j * Math.PI * 2,
          ...ring,
        })
      }
    })
    return arr
  }, [rings])

  const floretData = useMemo(() => {
    const count = hi ? 520 : 260
    const out = []
    for (let i = 0; i < count; i++) {
      const t = i / count
      const rr = Math.sqrt(t) * 0.285
      const a = i * GOLDEN
      const y = Math.sqrt(Math.max(0, 1 - (rr / 0.3) ** 2)) * 0.3 * 0.38
      out.push({ x: Math.cos(a) * rr, z: Math.sin(a) * rr, y, t })
    }
    return out
  }, [hi])

  // colour florets: dark chocolate centre -> burnt orange rim
  useLayoutEffect(() => {
    const m = new THREE.Object3D()
    const c = new THREE.Color()
    const inner = new THREE.Color('#3d1a06')
    const outer = new THREE.Color('#c8610f')
    floretData.forEach((f, i) => {
      m.position.set(f.x, f.y - 0.005, f.z)
      const n = new THREE.Vector3(f.x, f.y * 2.6, f.z).normalize()
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n.lengthSq() ? n : new THREE.Vector3(0, 1, 0))
      const s = 0.8 + f.t * 0.6
      m.scale.set(s, s * (1.2 - f.t * 0.4), s)
      m.updateMatrix()
      florets.current.setMatrixAt(i, m.matrix)
      c.copy(inner).lerp(outer, Math.pow(f.t, 1.4))
      florets.current.setColorAt(i, c)
    })
    florets.current.instanceMatrix.needsUpdate = true
    if (florets.current.instanceColor) florets.current.instanceColor.needsUpdate = true

    // subtle per-petal tint variation
    const pc = new THREE.Color()
    data.forEach((d, i) => {
      const k = 0.84 + ((Math.sin(i * 3.1) + 1) / 2) * 0.2 - d.ring * 0.05
      pc.setRGB(k, k * (0.97 + d.ring * 0.01), k * 0.95)
      petals.current.setColorAt(i, pc)
    })
    if (petals.current.instanceColor) petals.current.instanceColor.needsUpdate = true
  }, [floretData, data])

  const tmp = useMemo(() => new THREE.Object3D(), [])
  const live = useRef({ open: control?.open ?? 1 })

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const target = control?.open ?? 1
    live.current.open += (target - live.current.open) * Math.min(1, delta * 4)
    const open = live.current.open
    const breathe = control?.breathe ?? 1

    data.forEach((d, i) => {
      const tilt = THREE.MathUtils.lerp(d.tiltClosed, d.tiltOpen, open)
      const flutter = Math.sin(t * 1.1 + d.phase) * 0.035 * breathe + Math.sin(t * 2.3 + d.phase * 2) * 0.012 * breathe
      tmp.position.set(0, d.lift + 0.02, 0)
      tmp.rotation.set(0, 0, 0)
      tmp.rotateY(d.az)
      tmp.rotateZ(tilt + flutter)
      tmp.rotateX(d.twist)
      const s = d.len * THREE.MathUtils.lerp(0.72, 1, open)
      tmp.scale.set(s, s, s)
      tmp.updateMatrix()
      petals.current.setMatrixAt(i, tmp.matrix)
    })
    petals.current.instanceMatrix.needsUpdate = true

    if (group.current) group.current.rotation.y += delta * (control?.spin ?? 0.08)
  })

  return (
    <group {...props}>
      <group ref={group}>
        <instancedMesh ref={petals} args={[petalGeo, undefined, data.length]} castShadow>
          <meshPhysicalMaterial
            vertexColors
            side={THREE.DoubleSide}
            roughness={0.62}
            sheen={0.45}
            sheenRoughness={0.5}
            sheenColor={'#ffae4a'}
            envMapIntensity={0.55}
          />
        </instancedMesh>
        <mesh geometry={discGeo} position={[0, 0.02, 0]}>
          <meshStandardMaterial color="#6b2e08" roughness={0.9} />
        </mesh>
        <instancedMesh ref={florets} args={[floretGeo, undefined, floretData.length]}>
          <meshStandardMaterial roughness={0.75} />
        </instancedMesh>
      </group>
    </group>
  )
}
