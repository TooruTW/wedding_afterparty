import { Html } from '@react-three/drei'
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

type BeanPersonProps = {
  body: Body
  position?: [number, number, number]
  rotationY?: number
  walkStyle?: WalkStyle
  pose?: Pose
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

function ChatBubble({ headY, headR }: { headY: number; headR: number }) {
  return (
    <Html position={[0, headY + headR * 1.85, 0]} center distanceFactor={10} sprite>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 24,
          height: 16,
          padding: '0 6px',
          borderRadius: 999,
          background: '#ffffff',
          border: '1px solid #d6d6d6',
          opacity: 0.95,
          color: '#1a1a1a',
          fontSize: 10,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: 1,
        }}
      >
        ...
        <div
          style={{
            position: 'absolute',
            left: '62%',
            bottom: -4,
            width: 6,
            height: 6,
            background: '#ffffff',
            borderRight: '1px solid #d6d6d6',
            borderBottom: '1px solid #d6d6d6',
            transform: 'translateX(-50%) rotate(45deg)',
          }}
        />
      </div>
    </Html>
  )
}

export function BeanPerson({
  body,
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

  const hipZ = pose === 'sit' ? limbR * SIT_HIP_FORWARD : 0

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group ref={characterRef}>
        <WalkLegs
          color={color}
          leftLegRef={leftLegRef}
          rightLegRef={rightLegRef}
          leftHip={[-legX, hipY, hipZ]}
          rightHip={[legX, hipY, hipZ]}
          legLen={legLen}
          limbR={limbR}
        />

        <group ref={bodyRef}>
          <BeanPart color={color} kind="capsule" position={[0, torsoY, 0]} scale={[torsoR, torsoH / 2, torsoR * 0.65]} />

          <group ref={headRef} position={[0, neckY, 0]}>
            <BeanPart color={color} kind="sphere" position={[0, headOffset, 0]} scale={[headR, headR, headR]} />
            <FaceMark headY={headOffset} headR={headR} />
            {pose === 'chat' ? <ChatBubble headY={headOffset} headR={headR} /> : null}
          </group>

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
