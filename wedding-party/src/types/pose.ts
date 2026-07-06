import type { RefObject } from 'react'

export type Pose = 'stand' | 'sit' | 'chat'

export type Pivot = {
  rotation: { x: number; y?: number; z: number }
  position: { y: number; z?: number }
}

export type UpperBodyRefs = {
  characterRef: RefObject<Pivot | null>
  bodyRef: RefObject<Pivot | null>
  headRef: RefObject<Pivot | null>
  leftArmRef: RefObject<Pivot | null>
  rightArmRef: RefObject<Pivot | null>
}

export type PoseRefs = UpperBodyRefs & {
  leftLegRef: RefObject<Pivot | null>
  rightLegRef: RefObject<Pivot | null>
}

export type SitDims = {
  hipY: number
  limbR: number
}
