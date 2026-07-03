import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Pivot, WalkCycle } from './types'

const LEG_SWING = 0.5

export function useWalkCycle(walkSpeed: number, phase: number, bobScale: number) {
  const cycle = useRef<WalkCycle>({ swing: 0, bob: 0 })
  const leftLegRef = useRef<Pivot>(null)
  const rightLegRef = useRef<Pivot>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * walkSpeed + phase
    const swing = Math.sin(t) * LEG_SWING
    const bob = (1 - Math.cos(t * 2)) * 0.5 * bobScale

    cycle.current = { swing, bob }
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing
  })

  return { cycle, leftLegRef, rightLegRef }
}
