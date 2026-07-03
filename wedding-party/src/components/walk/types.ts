import type { RefObject } from 'react'

export type WalkStyle = 'normal' | 'frenzy'

export type Pivot = {
  rotation: { x: number; z: number }
  position: { y: number }
}

export type WalkCycle = {
  swing: number
  bob: number
}

export type UpperBodyRefs = {
  bodyRef: RefObject<Pivot | null>
  leftArmRef: RefObject<Pivot | null>
  rightArmRef: RefObject<Pivot | null>
}
