import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { lathe, makeLabelTexture, roundedProfile } from './geometry'

/* Shared metallic and rubber materials */
function useMaterials(glassColor, clear, lite) {
  return useMemo(() => {
    const gold = new THREE.MeshPhysicalMaterial({
      color: '#d7b16e',
      metalness: 1,
      roughness: 0.16,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
    })
    const goldBrushed = new THREE.MeshPhysicalMaterial({ color: '#c9a160', metalness: 1, roughness: 0.32 })
    const rubber = new THREE.MeshPhysicalMaterial({
      color: '#f3ece0',
      roughness: 0.55,
      sheen: 0.6,
      sheenColor: new THREE.Color('#ffffff'),
    })
    const glass = new THREE.MeshPhysicalMaterial({
      color: glassColor,
      metalness: 0,
      roughness: clear ? 0.04 : 0.08,
      transmission: lite ? 0 : 1,
      opacity: lite ? 0.82 : 1,
      transparent: lite,
      thickness: clear ? 0.35 : 0.6,
      ior: 1.5,
      attenuationColor: new THREE.Color(glassColor),
      attenuationDistance: clear ? 1.4 : 0.85,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      specularIntensity: 1,
      envMapIntensity: 1.4,
    })
    return { gold, goldBrushed, rubber, glass }
  }, [glassColor, clear, lite])
}

function Label({ model, radius, height, y, theta = 2.25, aspect }) {
  const tex = useMemo(
    () => makeLabelTexture({ title: model.label, sub: model.sub, size: model.size, aspect }),
    [model.label, model.sub, model.size, aspect]
  )
  useEffect(() => () => tex.dispose(), [tex])
  return (
    <mesh position={[0, y, 0]} rotation={[0, -theta / 2, 0]}>
      <cylinderGeometry args={[radius, radius, height, 64, 1, true, 0, theta]} />
      <meshPhysicalMaterial map={tex} roughness={0.62} sheen={0.3} side={THREE.FrontSide} />
    </mesh>
  )
}

/* ------------------------------- Dropper ------------------------------- */
function Dropper({ model, lite }) {
  const m = useMaterials(model.glass, model.clear, lite)
  const R = 0.42
  const H = 1.08
  const body = useMemo(() => lathe(roundedProfile({ radius: R, height: H, corner: 0.1, bottomCorner: 0.06, neck: 0.15, neckH: 0.12, shoulder: 0.22 })), [])
  const liquid = useMemo(() => lathe(roundedProfile({ radius: R - 0.035, height: H * 0.78, corner: 0.05, bottomCorner: 0.04 }), 64), [])
  const bulb = useMemo(
    () =>
      lathe(
        [
          [0.0001, 0],
          [0.125, 0],
          [0.13, 0.04],
          [0.11, 0.1],
          [0.1, 0.16],
          [0.112, 0.24],
          [0.118, 0.3],
          [0.1, 0.36],
          [0.06, 0.395],
          [0.0001, 0.405],
        ],
        64
      ),
    []
  )
  return (
    <group>
      <mesh geometry={body} material={m.glass} castShadow />
      <mesh geometry={liquid} position={[0, 0.035, 0]}>
        <meshPhysicalMaterial
          color={model.liquid}
          roughness={0.15}
          emissive={model.liquid}
          emissiveIntensity={0.22}
        />
      </mesh>
      {/* pipette */}
      <mesh position={[0, H * 0.55, 0]}>
        <cylinderGeometry args={[0.03, 0.022, H * 0.95, 16]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.05} transparent opacity={0.35} />
      </mesh>
      <Label model={model} radius={R + 0.004} height={0.6} y={0.47} />
      {/* collar */}
      <mesh position={[0, H + 0.2, 0]} material={m.gold} castShadow>
        <cylinderGeometry args={[0.185, 0.19, 0.3, 64]} />
      </mesh>
      <mesh position={[0, H + 0.055, 0]} material={m.goldBrushed}>
        <cylinderGeometry args={[0.19, 0.19, 0.02, 64]} />
      </mesh>
      {/* bulb */}
      <mesh geometry={bulb} material={m.rubber} position={[0, H + 0.345, 0]} castShadow />
    </group>
  )
}

/* --------------------------------- Jar --------------------------------- */
function Jar({ model, lite }) {
  const m = useMaterials('#f6efe4', false, lite)
  const frosted = useMemo(() => {
    const g = m.glass.clone()
    g.roughness = 0.42
    g.color = new THREE.Color('#fbf6ec')
    g.attenuationColor = new THREE.Color('#f4e7d0')
    g.attenuationDistance = 0.8
    g.thickness = 0.9
    return g
  }, [m.glass])
  const R = 0.78
  const H = 0.68
  const body = useMemo(() => lathe(roundedProfile({ radius: R, height: H, corner: 0.12, bottomCorner: 0.1 })), [])
  const lid = useMemo(() => lathe(roundedProfile({ radius: R + 0.03, height: 0.3, corner: 0.06, bottomCorner: 0.01 })), [])
  return (
    <group position={[0, -0.1, 0]}>
      <mesh geometry={body} material={frosted} castShadow />
      <mesh position={[0, H * 0.45, 0]}>
        <cylinderGeometry args={[R - 0.09, R - 0.09, H * 0.75, 64]} />
        <meshStandardMaterial color={model.liquid} roughness={0.6} />
      </mesh>
      <Label model={model} radius={R + 0.004} height={0.42} y={0.33} theta={1.75} aspect={1.9} />
      <mesh geometry={lid} material={m.gold} position={[0, H - 0.005, 0]} castShadow />
    </group>
  )
}

/* -------------------------------- Pump --------------------------------- */
function Pump({ model, lite }) {
  const m = useMaterials(model.glass, true, lite)
  const R = 0.34
  const H = 1.55
  const body = useMemo(() => lathe(roundedProfile({ radius: R, height: H, corner: 0.08, bottomCorner: 0.06, neck: 0.12, neckH: 0.08, shoulder: 0.14 })), [])
  const liquid = useMemo(() => lathe(roundedProfile({ radius: R - 0.03, height: H * 0.86, corner: 0.05, bottomCorner: 0.04 }), 64), [])
  const white = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#faf6ef', roughness: 0.3, clearcoat: 0.5 }), [])
  return (
    <group position={[0, -0.25, 0]}>
      <mesh geometry={body} material={m.glass} castShadow />
      <mesh geometry={liquid} position={[0, 0.03, 0]}>
        <meshPhysicalMaterial color={model.liquid} roughness={0.1} emissive={model.liquid} emissiveIntensity={0.18} />
      </mesh>
      <Label model={model} radius={R + 0.004} height={0.78} y={0.68} theta={2.1} aspect={0.95} />
      <mesh position={[0, H + 0.13, 0]} material={white}>
        <cylinderGeometry args={[0.14, 0.14, 0.12, 48]} />
      </mesh>
      <mesh position={[0, H + 0.26, 0]} material={white}>
        <cylinderGeometry args={[0.04, 0.04, 0.18, 24]} />
      </mesh>
      <mesh position={[0, H + 0.38, 0]} material={white} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 48]} />
      </mesh>
      <mesh position={[0.18, H + 0.37, 0]} rotation={[0, 0, Math.PI / 2]} material={white}>
        <cylinderGeometry args={[0.025, 0.03, 0.22, 16]} />
      </mesh>
    </group>
  )
}

/** Vertically centred product model. Height ≈ 1.6 units for all variants. */
export default function ProductModel({ model, lite = false, ...props }) {
  const kind = model?.kind ?? 'dropper'
  return (
    <group {...props}>
      <group position={[0, kind === 'jar' ? -0.2 : -0.75, 0]}>
        {kind === 'dropper' && <Dropper model={model} lite={lite} />}
        {kind === 'jar' && <Jar model={model} lite={lite} />}
        {kind === 'pump' && <Pump model={model} lite={lite} />}
      </group>
    </group>
  )
}
