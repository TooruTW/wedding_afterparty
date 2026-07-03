import type { Body } from '../types/body'

type BeanPersonProps = {
  body: Body
  position?: [number, number, number]
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

export function BeanPerson({ body, position = [0, 0, 0] }: BeanPersonProps) {
  // ponytail: 雛型固定值；僅 legHeight / headSize 對外開放
  const s = 1.2
  const color = '#FFFFFF'
  const limbR = 0.07 * 3 * s * 0.35
  const armLen = 0.1 * 3.5 * s
  const torsoH = 0.24 * s
  const legGap = 0.03 * s

  const legLen = 0.28 * s * body.legHeight
  const headR = 0.1 * 2.8 * s * body.headSize

  const hipY = legLen
  const partGap = 0.025 * s
  const torsoBottom = hipY + partGap
  const torsoY = torsoBottom + torsoH * 0.75
  const torsoTop = torsoY + torsoH * 0.75
  const shoulderY = torsoY + torsoH * 0.35

  const legX = limbR + legGap / 2
  const legSpan = limbR * 4 + legGap
  const torsoR = legSpan / 2
  const shoulderX = torsoR
  const headY = torsoTop + partGap + headR

  return (
    <group position={position}>
      <group position={[-legX, hipY, 0]}>
        <BeanCapsule color={color} position={[0, -legLen / 2, 0]} radius={limbR} length={legLen} />
      </group>

      <group position={[legX, hipY, 0]}>
        <BeanCapsule color={color} position={[0, -legLen / 2, 0]} radius={limbR} length={legLen} />
      </group>

      <BeanPart color={color} kind="capsule" position={[0, torsoY, 0]} scale={[torsoR, torsoH / 2, torsoR * 0.65]} />
      <BeanPart color={color} kind="sphere" position={[0, headY, 0]} scale={[headR, headR, headR]} />

      <group position={[-shoulderX, shoulderY, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <BeanCapsule color={color} position={[0, -armLen / 2, 0]} radius={limbR} length={armLen} />
      </group>

      <group position={[shoulderX, shoulderY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <BeanCapsule color={color} position={[0, -armLen / 2, 0]} radius={limbR} length={armLen} />
      </group>
    </group>
  )
}
