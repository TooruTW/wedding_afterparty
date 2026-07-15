export type WalkStyle = 'normal' | 'frenzy'

export const WALK_SPEED: Record<WalkStyle, number> = {
  normal: 5,
  frenzy: 8,
}

export type WalkCycle = {
  swing: number
  bob: number
  cos: number
}
