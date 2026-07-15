import type { RefObject } from 'react'
import type { Pivot } from '../../types/pose'
import type { useToonGradient } from '../useToonGradient'

type WalkLegsProps = {
  color: string
  gradientMap: ReturnType<typeof useToonGradient>
  leftLegRef: RefObject<Pivot | null>
  rightLegRef: RefObject<Pivot | null>
  leftHip: [number, number, number]
  rightHip: [number, number, number]
  legLen: number
  limbR: number
}

function LegCapsule({
  color,
  gradientMap,
  legLen,
  limbR,
}: {
  color: string
  gradientMap: ReturnType<typeof useToonGradient>
  legLen: number
  limbR: number
}) {
  const cylinder = Math.max(legLen - limbR * 2, 0.001)
  return (
    <mesh position={[0, -legLen / 2, 0]}>
      <capsuleGeometry args={[limbR, cylinder, 12, 20]} />
      <meshToonMaterial color={color} gradientMap={gradientMap} />
    </mesh>
  )
}

export function WalkLegs({
  color,
  gradientMap,
  leftLegRef,
  rightLegRef,
  leftHip,
  rightHip,
  legLen,
  limbR,
}: WalkLegsProps) {
  return (
    <>
      <group position={leftHip}>
        <group ref={leftLegRef}>
          <LegCapsule color={color} gradientMap={gradientMap} legLen={legLen} limbR={limbR} />
        </group>
      </group>
      <group position={rightHip}>
        <group ref={rightLegRef}>
          <LegCapsule color={color} gradientMap={gradientMap} legLen={legLen} limbR={limbR} />
        </group>
      </group>
    </>
  )
}
