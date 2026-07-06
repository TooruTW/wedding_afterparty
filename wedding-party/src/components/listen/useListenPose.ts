import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { UpperBodyRefs } from '../../types/pose'

const NOD_BURST_DURATION = 0.7
const NOD_COUNT = 2
const NOD_AMPLITUDE = 0.22
const PAUSE_MIN = 1.5
const PAUSE_MAX = 4
const ARM_REST_OUTWARD = 0.16
const ARM_REST_X = 0.08

function randPause() {
  return PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN)
}

export function useListenPose(enabled: boolean, refs: UpperBodyRefs, phase = 0) {
  const burstStart = useRef<number | null>(null)
  const nextBurstAt = useRef(0)
  const ready = useRef(false)

  useFrame(({ clock }) => {
    if (!enabled) {
      burstStart.current = null
      ready.current = false
      return
    }

    const t = clock.elapsedTime
    if (!ready.current) {
      nextBurstAt.current = t + Math.abs(phase) + randPause()
      ready.current = true
    }

    let nod = 0
    if (burstStart.current !== null) {
      const elapsed = t - burstStart.current
      if (elapsed < NOD_BURST_DURATION) {
        nod = Math.max(0, Math.sin((elapsed / NOD_BURST_DURATION) * Math.PI * 2 * NOD_COUNT))
      } else {
        burstStart.current = null
        nextBurstAt.current = t + randPause()
      }
    } else if (t >= nextBurstAt.current) {
      burstStart.current = t
    }

    if (refs.bodyRef.current) {
      refs.bodyRef.current.position.y = 0
      refs.bodyRef.current.rotation.x = 0
    }

    if (refs.headRef.current) {
      refs.headRef.current.rotation.x = nod * NOD_AMPLITUDE
      refs.headRef.current.rotation.z = 0
    }

    if (refs.leftArmRef.current) {
      refs.leftArmRef.current.rotation.x = ARM_REST_X
      refs.leftArmRef.current.rotation.z = -ARM_REST_OUTWARD
    }

    if (refs.rightArmRef.current) {
      refs.rightArmRef.current.rotation.x = ARM_REST_X
      refs.rightArmRef.current.rotation.z = ARM_REST_OUTWARD
    }
  })
}
