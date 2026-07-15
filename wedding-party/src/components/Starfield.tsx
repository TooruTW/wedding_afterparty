import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Points } from 'three'
import { FLOOR_GRID } from './floorModes'
import type { VenueTheme } from './venueThemes'

const RANGE = 90
/** 場地外緣留白，星不進舞池上方 */
const CLEAR = 1.5

function buildStarPositions(count: number) {
  const halfW = FLOOR_GRID.width / 2 + CLEAR
  const halfD = FLOOR_GRID.depth / 2 + CLEAR
  const positions = new Float32Array(count * 3)
  let placed = 0
  let guard = 0
  while (placed < count && guard < count * 20) {
    guard += 1
    const x = (Math.random() - 0.5) * RANGE * 2
    const y = Math.random() * 45 + 0.3
    const z = (Math.random() - 0.5) * RANGE * 2
    if (Math.abs(x) < halfW && Math.abs(z) < halfD) continue
    const i = placed * 3
    positions[i] = x
    positions[i + 1] = y
    positions[i + 2] = z
    placed += 1
  }
  return positions
}

export function Starfield({ config }: { config: VenueTheme['starfield'] }) {
  const ref = useRef<Points>(null)
  const positions = useMemo(() => buildStarPositions(config.count), [config.count])
  const spin = config.spin

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * spin
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={config.color}
        size={config.size}
        sizeAttenuation
        transparent
        opacity={0.92}
        depthWrite={false}
      />
    </points>
  )
}

{
  const count = 64
  const halfW = FLOOR_GRID.width / 2 + CLEAR
  const halfD = FLOOR_GRID.depth / 2 + CLEAR
  const pos = buildStarPositions(count)
  console.assert(pos.length === count * 3, 'star count mismatch')
  let inside = 0
  for (let i = 0; i < count; i++) {
    const x = pos[i * 3]!
    const z = pos[i * 3 + 2]!
    if (Math.abs(x) < halfW && Math.abs(z) < halfD) inside += 1
  }
  console.assert(inside === 0, `stars inside venue: ${inside}`)
}
