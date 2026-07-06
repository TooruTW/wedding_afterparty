import { useFrame } from '@react-three/fiber'
import { applySitPose } from './applySitPose'
import type { PoseRefs, SitDims } from './types'

export function useSitPose(enabled: boolean, refs: PoseRefs, dims: SitDims) {
  useFrame(() => {
    if (!enabled) return
    applySitPose(refs, dims)
  })
}
