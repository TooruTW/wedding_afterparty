import { useRef } from 'react'
import type { Body } from '../types/body'
import type { Pivot, Pose } from '../types/pose'
import { WALK_SPEED, type WalkStyle } from '../types/walk'
import { useWalkCycle } from './walk/useWalkCycle'
import { useWalkUpper } from './walk/useWalkUpper'
import { useSitPose } from './sit/useSitPose'
import { SIT_HIP_FORWARD, SIT_SHOULDER_INSET } from './sit/applySitPose'
import { WalkLegs } from './walk/WalkLegs'
import { useChatPose } from './chat/useChatPose'
import { useListenPose } from './listen/useListenPose'
import { FACE_MAPS, type FaceId } from './beanFace'
import { SaySprite } from './SaySprite'
import { NameSprite } from './NameSprite'
import { useToonGradient } from './useToonGradient'

type BeanPersonProps = {
  body: Body
  name: string
  say?: string
  position?: [number, number, number]
  rotationY?: number
  walkStyle?: WalkStyle
  pose?: Pose
}

function BeanToonMaterial({
  color,
  gradientMap,
}: {
  color: string
  gradientMap: ReturnType<typeof useToonGradient>
}) {
  return <meshToonMaterial color={color} gradientMap={gradientMap} />
}

function BeanCapsule({
  color,
  gradientMap,
  position,
  radius,
  length,
}: {
  color: string
  gradientMap: ReturnType<typeof useToonGradient>
  position: [number, number, number]
  radius: number
  length: number
}) {
  const cylinder = Math.max(length - radius * 2, 0.001)
  return (
    <mesh position={position}>
      <capsuleGeometry args={[radius, cylinder, 12, 20]} />
      <BeanToonMaterial color={color} gradientMap={gradientMap} />
    </mesh>
  )
}

function BeanPart({
  color,
  gradientMap,
  position,
  scale,
  kind,
}: {
  color: string
  gradientMap: ReturnType<typeof useToonGradient>
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
      <BeanToonMaterial color={color} gradientMap={gradientMap} />
    </mesh>
  )
}

function FaceMark({
  face,
  headY,
  headR,
}: {
  face: FaceId
  headY: number
  headR: number
}) {
  const size = headR * 1.15
  return (
    <mesh position={[0, headY, headR * 1.01]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={FACE_MAPS[face]} transparent depthWrite={false} />
    </mesh>
  )
}

export function BeanPerson({
  body,
  name,
  say,
  position = [0, 0, 0],
  rotationY = 0,
  walkStyle = 'normal',
  pose = 'stand',
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
  const shoulderSpread = torsoR + limbR * 0.9
  const shoulderX = pose === 'sit' ? shoulderSpread * SIT_SHOULDER_INSET : shoulderSpread
  const shoulderZ = walkStyle === 'frenzy' ? -limbR * 1.0 : 0
  const neckY = torsoTop
  const headOffset = partGap + headR

  const characterRef = useRef<Pivot>(null)
  const bodyRef = useRef<Pivot>(null)
  const headRef = useRef<Pivot>(null)
  const leftArmRef = useRef<Pivot>(null)
  const rightArmRef = useRef<Pivot>(null)
  const upperRefs = { characterRef, bodyRef, headRef, leftArmRef, rightArmRef }

  const walkPhase = position[0] * 0.7
  const walking = pose === 'stand'
  const walkSpeed = WALK_SPEED[walkStyle]
  const { cycle, leftLegRef, rightLegRef } = useWalkCycle(walkSpeed, walkPhase, 0.02 * s, walking)
  useWalkUpper(walkStyle, upperRefs, cycle, walking)
  useSitPose(pose === 'sit', { ...upperRefs, leftLegRef, rightLegRef }, { hipY, limbR }, position[0] * 0.7)
  useChatPose(pose === 'chat', upperRefs, position[0] * 0.4)
  useListenPose(pose === 'listen', upperRefs, position[0] * 0.5)

  const toonGradient = useToonGradient()
  const hipZ = pose === 'sit' ? limbR * SIT_HIP_FORWARD : 0

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group ref={characterRef}>
        <WalkLegs
          color={color}
          gradientMap={toonGradient}
          leftLegRef={leftLegRef}
          rightLegRef={rightLegRef}
          leftHip={[-legX, hipY, hipZ]}
          rightHip={[legX, hipY, hipZ]}
          legLen={legLen}
          limbR={limbR}
        />

        <group ref={bodyRef}>
          <BeanPart color={color} gradientMap={toonGradient} kind="capsule" position={[0, torsoY, 0]} scale={[torsoR, torsoH / 2, torsoR * 0.65]} />

          <group ref={headRef} position={[0, neckY, 0]}>
            <BeanPart
              color={color}
              gradientMap={toonGradient}
              kind="sphere"
              position={[0, headOffset, 0]}
              scale={[headR, headR, headR]}
            />
            <FaceMark face={body.face} headY={headOffset} headR={headR} />
            <NameSprite name={name} headY={headOffset} headR={headR} />
            {say ? <SaySprite text={say} headY={headOffset} headR={headR} /> : null}
          </group>

          <group ref={leftArmRef} position={[-shoulderX, shoulderY, shoulderZ]}>
            <BeanCapsule color={color} gradientMap={toonGradient} position={[0, -armLen / 2, 0]} radius={limbR} length={armLen} />
          </group>

          <group ref={rightArmRef} position={[shoulderX, shoulderY, shoulderZ]}>
            <BeanCapsule color={color} gradientMap={toonGradient} position={[0, -armLen / 2, 0]} radius={limbR} length={armLen} />
          </group>
        </group>
      </group>
    </group>
  )
}
