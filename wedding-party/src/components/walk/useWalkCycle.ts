import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Pivot, WalkCycle } from './types'

const LEG_SWING = 0.62

// ponytail: pow 曲線模擬前擺快、後擺慢；單段腿無膝，靠抬腳補足
function legSwing(sin: number) {
  return Math.sign(sin) * Math.pow(Math.abs(sin), 0.7) * LEG_SWING
}

export function useWalkCycle(walkSpeed: number, phase: number, bobScale: number) {
  const cycle = useRef<WalkCycle>({ swing: 0, bob: 0, cos: 1 })
  const leftLegRef = useRef<Pivot>(null)
  const rightLegRef = useRef<Pivot>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * walkSpeed + phase
    const sin = Math.sin(t)
    const cos = Math.cos(t)
    const swing = sin * LEG_SWING
    const bob = (1 - Math.cos(t * 2)) * 0.5 * bobScale
    const lift = bobScale * 1.6

    cycle.current = { swing, bob, cos }

    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = legSwing(sin)
      leftLegRef.current.position.y = Math.max(0, sin) * lift
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = legSwing(-sin)
      rightLegRef.current.position.y = Math.max(0, -sin) * lift
    }
  })

  return { cycle, leftLegRef, rightLegRef }
}
