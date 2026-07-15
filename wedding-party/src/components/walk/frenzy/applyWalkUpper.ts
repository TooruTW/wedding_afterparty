import type { UpperBodyRefs } from '../../../types/pose'
import type { WalkCycle } from '../../../types/walk'

export function applyWalkUpper(refs: UpperBodyRefs, { swing, bob, cos }: WalkCycle) {
  const { bodyRef, leftArmRef, rightArmRef } = refs

  if (bodyRef.current) {
    bodyRef.current.position.y = bob
    bodyRef.current.rotation.x = swing * 0.1
  }
  if (leftArmRef.current) {
    leftArmRef.current.rotation.x = -swing * 1.35
    leftArmRef.current.rotation.z = -Math.PI / 2 + cos * 0.32
  }
  if (rightArmRef.current) {
    rightArmRef.current.rotation.x = swing * 1.35
    rightArmRef.current.rotation.z = Math.PI / 2 - cos * 0.32
  }
}
