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
  const s = body.height
  const headR = 0.1 * body.head * s
  const buttR = 0.07 * body.butt * s
  const armLen = 0.1 * body.armLength * s
  const legLen = 0.28 * s
  const torsoH = 0.24 * s

  const hipY = legLen
  const torsoY = hipY + torsoH / 2
  const headY = hipY + torsoH + headR * 0.9
  const shoulderY = hipY + torsoH * 0.85

  const limbR = buttR * 0.35
  const legGap = 0.03 * s // ponytail: 固定小間距，夠看出兩腿分開即可
  const legX = limbR + legGap / 2
  const legSpan = limbR * 4 + legGap
  const torsoR = legSpan / 2
  const shoulderX = torsoR

  return (
    <group position={position}>
      <group position={[-legX, hipY, 0]}>
        <BeanCapsule color={body.color} position={[0, -legLen / 2, 0]} radius={limbR} length={legLen} />
      </group>

      <group position={[legX, hipY, 0]}>
        <BeanCapsule color={body.color} position={[0, -legLen / 2, 0]} radius={limbR} length={legLen} />
      </group>

      <BeanPart color={body.color} kind="capsule" position={[0, torsoY, 0]} scale={[torsoR, torsoH / 2, torsoR * 0.65]} />
      <BeanPart color={body.color} kind="sphere" position={[0, headY, 0]} scale={[headR, headR, headR]} />

      <group position={[-shoulderX, shoulderY, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <BeanCapsule color={body.color} position={[0, -armLen / 2, 0]} radius={limbR} length={armLen} />
      </group>

      <group position={[shoulderX, shoulderY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <BeanCapsule color={body.color} position={[0, -armLen / 2, 0]} radius={limbR} length={armLen} />
      </group>
    </group>
  )
}
