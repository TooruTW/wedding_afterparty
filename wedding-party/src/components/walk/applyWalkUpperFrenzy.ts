import type { UpperBodyRefs, WalkCycle } from './types'

// ponytail: 瘋狂走法上半身待實作（揮手過頭、身體後傾）；暫只跟隨步伐起伏
export function applyWalkUpperFrenzy(refs: UpperBodyRefs, { bob }: WalkCycle) {
  if (refs.bodyRef.current) refs.bodyRef.current.position.y = bob
}
