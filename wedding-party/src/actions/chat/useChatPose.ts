import { useFrame } from '@react-three/fiber'
import type { UpperBodyRefs } from '../../types/pose'

const BURST_DURATION = 1.2
const PAUSE_DURATION = 2
const BURST_WAVES = 3
const DEG30 = Math.PI / 6
const WAVE_CENTER = -Math.PI / 2 // 手臂舉至水平
const WAVE_AMPLITUDE = DEG30 // 水平位置上下各 30°
const ARM_OPEN = 0.42
const ARM_REST_OUTWARD = 0.16
const ARM_REST_X = 0.08
const RAMP_DURATION = 0.18

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}

export function useChatPose(enabled: boolean, refs: UpperBodyRefs, phase = 0) {
  useFrame(({ clock }) => {
    if (!enabled) return

    const cycleDuration = BURST_DURATION + PAUSE_DURATION
    const cycleTime = (clock.elapsedTime + phase) % cycleDuration
    const isBurst = cycleTime < BURST_DURATION
    const burstProgress = isBurst ? cycleTime / BURST_DURATION : 1
    const rampIn = smoothstep(Math.min(cycleTime / RAMP_DURATION, 1))
    const rampOut = smoothstep(Math.min(Math.max(BURST_DURATION - cycleTime, 0) / RAMP_DURATION, 1))
    const lift = isBurst ? Math.min(rampIn, rampOut) : 0
    // ponytail: 固定節奏版本，先連揮三下再停兩秒；若之後要做自然緩動再升級成曲線表
    const swing = isBurst ? Math.sin(burstProgress * Math.PI * 2 * BURST_WAVES) : 0

    if (refs.bodyRef.current) {
      refs.bodyRef.current.position.y = 0
      refs.bodyRef.current.rotation.x = 0
    }

    if (refs.headRef.current) {
      refs.headRef.current.rotation.z = 0
    }

    if (refs.leftArmRef.current) {
      refs.leftArmRef.current.rotation.x = ARM_REST_X
      refs.leftArmRef.current.rotation.z = -ARM_REST_OUTWARD
    }

    if (refs.rightArmRef.current) {
      const activeX = WAVE_CENTER + swing * WAVE_AMPLITUDE
      refs.rightArmRef.current.rotation.x = ARM_REST_X + (activeX - ARM_REST_X) * lift
      refs.rightArmRef.current.rotation.z = ARM_REST_OUTWARD + (ARM_OPEN - ARM_REST_OUTWARD) * lift
    }
  })
}
