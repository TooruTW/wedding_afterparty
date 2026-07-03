import { useFrame } from '@react-three/fiber'
import type { RefObject } from 'react'
import { applyWalkUpperFrenzy } from './applyWalkUpperFrenzy'
import { applyWalkUpperNormal } from './applyWalkUpperNormal'
import type { UpperBodyRefs, WalkCycle, WalkStyle } from './types'

export function useWalkUpper(
  walkStyle: WalkStyle,
  refs: UpperBodyRefs,
  cycle: RefObject<WalkCycle>,
) {
  useFrame(() => {
    const state = cycle.current
    if (walkStyle === 'frenzy') applyWalkUpperFrenzy(refs, state)
    else applyWalkUpperNormal(refs, state)
  })
}
