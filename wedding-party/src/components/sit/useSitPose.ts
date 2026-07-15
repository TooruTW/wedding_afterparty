import { useFrame } from '@react-three/fiber'
import { applySitHeadSway, applySitPose } from './applySitPose'
import type { PoseRefs, SitDims } from '../../types/pose'

export function useSitPose(
  enabled: boolean,
  refs: PoseRefs,
  dims: SitDims,
  phase = 0,
) {
  useFrame(({ clock }) => {
    if (!enabled) {
      if (refs.headRef.current) refs.headRef.current.rotation.z = 0
      return
    }
    applySitPose(refs, dims)
    applySitHeadSway(refs.headRef, clock.elapsedTime, phase)
  })
}
