/** 白天太陽；固定在場外天空 */
export function DaySun({
  position,
  color,
  radius,
}: {
  position: [number, number, number]
  color: string
  radius: number
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}
