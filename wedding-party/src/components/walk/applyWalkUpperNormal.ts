import type { UpperBodyRefs, WalkCycle } from './types'

const ARM_SWING = 0.4

export function applyWalkUpperNormal(refs: UpperBodyRefs, { swing, bob }: WalkCycle) {
  const { bodyRef, leftArmRef, rightArmRef } = refs

  if (bodyRef.current) bodyRef.current.position.y = bob
  if (leftArmRef.current) {
    leftArmRef.current.rotation.x = -swing * ARM_SWING
    leftArmRef.current.rotation.z = -Math.PI / 2
  }
  if (rightArmRef.current) {
    rightArmRef.current.rotation.x = swing * ARM_SWING
    rightArmRef.current.rotation.z = Math.PI / 2
  }
}
