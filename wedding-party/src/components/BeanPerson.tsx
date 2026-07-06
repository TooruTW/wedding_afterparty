import { useRef } from 'react'
import type { Body } from '../types/body'
import type { Pivot, WalkStyle } from './walk/types'
import { useWalkCycle } from './walk/useWalkCycle'
import { useWalkUpper } from './walk/useWalkUpper'
import { WalkLegs } from './walk/WalkLegs'

type BeanPersonProps = {
  body: Body
  position?: [number, number, number]
  walkSpeed?: number
  walkStyle?: WalkStyle
}

function BeanCapsule({
  color,
  position,
  radius,
  length,
}: {
  color: string
  position: [number, number, number]
  radius: number
  length: number
}) {
  const cylinder = Math.max(length - radius * 2, 0.001)
  return (
    <mesh position={position}>
      <capsuleGeometry args={[radius, cylinder, 12, 20]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function BeanPart({
  color,
  position,
  scale,
  kind,
}: {
  color: string
  position: [number, number, number]
  scale: [number, number, number]
  kind: 'sphere' | 'capsule'
}) {
  return (
    <mesh position={position} scale={scale}>
      {kind === 'sphere' ? (
        <sphereGeometry args={[1, 16, 16]} />
      ) : (
        <capsuleGeometry args={[1, 1, 8, 16]} />
      )}
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function FaceMark({
  headY,
  headR,
}: {
  headY: number
  headR: number
}) {
  return (
    <mesh position={[0, headY, headR * 1.01]}>
      <circleGeometry args={[headR * 0.28, 16]} />
      <meshBasicMaterial color="#1a1a1a" />
    </mesh>
  )
}

export function BeanPerson({
  body,
  position = [0, 0, 0],
  walkSpeed = 5,
  walkStyle = 'normal',
}: BeanPersonProps) {
  // ponytail: 雛型固定值；僅 headSize 對外開放
  const s = 1.2
  const legHeight = 1.75
  const color = '#FFFFFF'
  const limbR = 0.07 * 3 * s * 0.35
  const armLen = 0.1 * 3.5 * s
  const torsoH = 0.24 * s
  const legGap = 0.03 * s

  const legLen = 0.28 * s * legHeight
  const headR = 0.1 * 2.8 * s * body.headSize

  const hipY = legLen
  const partGap = 0.025 * s
  const torsoBottom = hipY + partGap
  const torsoY = torsoBottom + torsoH * 0.75
  const torsoTop = torsoY + torsoH * 0.75

  const legX = limbR + legGap / 2
  const legSpan = limbR * 4 + legGap
  const torsoR = legSpan / 2
  const shoulderY = torsoTop - torsoH * 0.2
  const shoulderX = torsoR + limbR * 0.9
  const shoulderZ = walkStyle === 'frenzy' ? -limbR * 1.0 : 0
  const headY = torsoTop + partGap + headR

  const characterRef = useRef<Pivot>(null)
  const bodyRef = useRef<Pivot>(null)
  const leftArmRef = useRef<Pivot>(null)
  const rightArmRef = useRef<Pivot>(null)
  const upperRefs = { characterRef, bodyRef, leftArmRef, rightArmRef }

  const walkPhase = position[0] * 0.7
  const { cycle, leftLegRef, rightLegRef } = useWalkCycle(walkSpeed, walkPhase, 0.02 * s)
  useWalkUpper(walkStyle, upperRefs, cycle)

  return (
    <group position={position}>
      <group ref={characterRef}>
        <WalkLegs
          color={color}
          leftLegRef={leftLegRef}
          rightLegRef={rightLegRef}
          leftHip={[-legX, hipY, 0]}
          rightHip={[legX, hipY, 0]}
          legLen={legLen}
          limbR={limbR}
        />

        <group ref={bodyRef}>
          <BeanPart color={color} kind="capsule" position={[0, torsoY, 0]} scale={[torsoR, torsoH / 2, torsoR * 0.65]} />
          <BeanPart color={color} kind="sphere" position={[0, headY, 0]} scale={[headR, headR, headR]} />
          <FaceMark headY={headY} headR={headR} />

          <group ref={leftArmRef} position={[-shoulderX, shoulderY, shoulderZ]}>
            <BeanCapsule color={color} position={[0, -armLen / 2, 0]} radius={limbR} length={armLen} />
          </group>

          <group ref={rightArmRef} position={[shoulderX, shoulderY, shoulderZ]}>
            <BeanCapsule color={color} position={[0, -armLen / 2, 0]} radius={limbR} length={armLen} />
          </group>
        </group>
      </group>
    </group>
  )
}
