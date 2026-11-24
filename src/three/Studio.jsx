import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { makePetalGeometry } from './geometry'

/**
 * Warm studio lighting built entirely from Lightformers — no HDR download,
 * so glass and gold get crisp reflections offline and instantly.
 */
export function Studio({ intensity = 1, warm = '#ffd9a0' }) {
  return (
    <>
      <ambientLight intensity={0.18 * intensity} color="#fff3e2" />
      <directionalLight position={[3, 5, 4]} intensity={2 * intensity} color="#fff1dc" castShadow={false} />
      <directionalLight position={[-4, 2, -3]} intensity={0.8 * intensity} color={warm} />
      <pointLight position={[0, -1.5, 2.5]} intensity={2 * intensity} color="#ffb35c" distance={8} />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#f3e9d9']} />
        <Lightformer form="rect" intensity={3} color="#fff6e8" position={[0, 5, -2]} scale={[10, 3, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={4} color="#ffe2b8" position={[-4, 1, 1]} scale={[2, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={2.5} color="#fff" position={[4, 1, 1]} scale={[1, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={2} color="#ffc27a" position={[2, 2, 4]} scale={2} />
        <Lightformer form="rect" intensity={1.5} color="#e58a35" position={[0, -3, 2]} scale={[8, 2, 1]} rotation-x={-Math.PI / 2} />
      </Environment>
    </>
  )
}

/** A drifting cloud of loose calendula petals. */
export function FloatingPetals({ count = 36, area = [9, 6, 5], speed = 1, control }) {
  const ref = useRef()
  const geo = useMemo(() => {
    const g = makePetalGeometry({ length: 1, width: 0.26, segL: 12, segW: 4, cup: 0.5, arch: 0.12 })
    g.translate(-0.5, 0, 0)
    return g
  }, [])
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (k) => {
          const x = Math.sin(i * 91.7 + k * 17.3) * 43758.5453
          return x - Math.floor(x)
        }
        return {
          x: (r(1) - 0.5) * area[0],
          y: (r(2) - 0.5) * area[1],
          z: (r(3) - 0.5) * area[2],
          s: 0.12 + r(4) * 0.16,
          sp: 0.15 + r(5) * 0.35,
          rx: r(6) * Math.PI * 2,
          ry: r(7) * Math.PI * 2,
          rs: 0.3 + r(8) * 0.8,
        }
      }),
    [count, area]
  )
  const tmp = useMemo(() => new THREE.Object3D(), [])
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed
    const boost = control?.burst ?? 0
    seeds.forEach((p, i) => {
      const drift = t * p.sp
      let x = p.x + Math.sin(drift * 0.7 + i) * 0.4 + drift * 0.35 + boost * (p.x * 0.6)
      x = ((x + area[0] / 2) % area[0] + area[0]) % area[0] - area[0] / 2
      let y = p.y - drift * 0.25 + Math.cos(drift + i) * 0.2 + boost * p.y * 0.4
      y = ((y + area[1] / 2) % area[1] + area[1]) % area[1] - area[1] / 2
      tmp.position.set(x, y, p.z + boost * 1.5)
      tmp.rotation.set(p.rx + t * p.rs, p.ry + t * p.rs * 0.6, Math.sin(t + i) * 0.6)
      tmp.scale.setScalar(p.s)
      tmp.updateMatrix()
      ref.current.setMatrixAt(i, tmp.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} frustumCulled={false}>
      <meshPhysicalMaterial vertexColors side={THREE.DoubleSide} roughness={0.6} sheen={0.4} sheenColor="#ffae4a" envMapIntensity={0.6} />
    </instancedMesh>
  )
}
