import type { RefObject } from 'react'
import type { Pivot } from './types'

type WalkLegsProps = {
  color: string
  leftLegRef: RefObject<Pivot | null>
  rightLegRef: RefObject<Pivot | null>
  leftHip: [number, number, number]
  rightHip: [number, number, number]
  legLen: number
  limbR: number
}

function LegCapsule({
  color,
  legLen,
  limbR,
}: {
  color: string
  legLen: number
  limbR: number
}) {
  const cylinder = Math.max(legLen - limbR * 2, 0.001)
  return (
    <mesh position={[0, -legLen / 2, 0]}>
      <capsuleGeometry args={[limbR, cylinder, 12, 20]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

export function WalkLegs({
  color,
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
          <LegCapsule color={color} legLen={legLen} limbR={limbR} />
        </group>
      </group>
      <group position={rightHip}>
        <group ref={rightLegRef}>
          <LegCapsule color={color} legLen={legLen} limbR={limbR} />
        </group>
      </group>
    </>
  )
}
