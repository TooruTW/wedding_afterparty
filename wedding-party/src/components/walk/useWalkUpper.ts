import { useFrame } from '@react-three/fiber'
import type { RefObject } from 'react'
import { applyWalkUpper as applyWalkUpperFrenzy } from './frenzy/applyWalkUpper'
import { applyWalkUpper as applyWalkUpperNormal } from './normal/applyWalkUpper'
import type { UpperBodyRefs } from '../../types/pose'
import type { WalkCycle, WalkStyle } from '../../types/walk'

export function useWalkUpper(
  walkStyle: WalkStyle,
  refs: UpperBodyRefs,
  cycle: RefObject<WalkCycle>,
  enabled = true,
) {
  useFrame(() => {
    if (!enabled) return
    const state = cycle.current
    if (walkStyle === 'frenzy') applyWalkUpperFrenzy(refs, state)
    else applyWalkUpperNormal(refs, state)
  })
}
