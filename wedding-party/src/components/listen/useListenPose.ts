import { useFrame } from '@react-three/fiber'
import type { UpperBodyRefs } from '../../types/pose'

const CYCLE_DURATION = 3
const NOD_BURST_DURATION = 0.7
const NOD_COUNT = 2
const NOD_AMPLITUDE = 0.22
const ARM_REST_OUTWARD = 0.16
const ARM_REST_X = 0.08

export function useListenPose(enabled: boolean, refs: UpperBodyRefs, phase = 0) {
  useFrame(({ clock }) => {
    if (!enabled) return

    const cycleTime = (clock.elapsedTime + phase) % CYCLE_DURATION
    const isNodding = cycleTime < NOD_BURST_DURATION
    const nod = isNodding
      ? Math.max(0, Math.sin((cycleTime / NOD_BURST_DURATION) * Math.PI * 2 * NOD_COUNT))
      : 0

    if (refs.bodyRef.current) {
      refs.bodyRef.current.position.y = 0
      refs.bodyRef.current.rotation.x = 0
    }

    if (refs.headRef.current) {
      refs.headRef.current.rotation.x = nod * NOD_AMPLITUDE
      refs.headRef.current.rotation.z = 0
    }

    if (refs.leftArmRef.current) {
      refs.leftArmRef.current.rotation.x = ARM_REST_X
      refs.leftArmRef.current.rotation.z = -ARM_REST_OUTWARD
    }

    if (refs.rightArmRef.current) {
      refs.rightArmRef.current.rotation.x = ARM_REST_X
      refs.rightArmRef.current.rotation.z = ARM_REST_OUTWARD
    }
  })
}
