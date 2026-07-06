import type { UpperBodyRefs } from '../../../types/pose'
import type { WalkCycle } from '../../../types/walk'

const ARM_SWING = 0.28
const ARM_OUTWARD = 0.16

export function applyWalkUpper(refs: UpperBodyRefs, { swing, bob }: WalkCycle) {
  const { bodyRef, leftArmRef, rightArmRef } = refs

  if (bodyRef.current) {
    bodyRef.current.position.y = bob
    bodyRef.current.rotation.x = swing * 0.04
  }
  if (leftArmRef.current) {
    leftArmRef.current.rotation.x = -swing * ARM_SWING
    leftArmRef.current.rotation.z = -ARM_OUTWARD
  }
  if (rightArmRef.current) {
    rightArmRef.current.rotation.x = swing * ARM_SWING
    rightArmRef.current.rotation.z = ARM_OUTWARD
  }
}
