import { useCallback, useEffect, useRef } from 'react'
import type { Pose } from '../../types/pose'
import type { WalkStyle } from '../../types/walk'
import { liveChatPose } from './chatTurns'
import { claimSlot, getSlotWorld, releaseSlot } from './slots'
import { gridToWorld, ZONE_SLOTS, zoneWorldBounds, type ZoneSlot } from './zones'

function slotPose(slot: ZoneSlot): Pose {
  return slot.zoneId === 'chat' ? liveChatPose(slot.id) : slot.pose
}

function findSlotDefinition(zoneId: 'chat' | 'sit', slotId: string): ZoneSlot | undefined {
  return ZONE_SLOTS.find((slot) => slot.zoneId === zoneId && slot.id === slotId)
}

export type ZoneBehaviorStatus = 'moving' | 'in_zone'

export type ZoneFrameState = {
  position: [number, number, number]
  rotationY: number
  pose: Pose
  walkStyle: WalkStyle
  status: ZoneBehaviorStatus
}

export type SlotBehaviorConfig = {
  kind: 'slot'
  zoneId: 'chat' | 'sit'
  slotId: string
}

export type WanderBehaviorConfig = {
  kind: 'wander'
  walkStyle: WalkStyle
  spawnGrid: [number, number]
}

export type ZoneBehaviorConfig = SlotBehaviorConfig | WanderBehaviorConfig

const MOVE_SPEED = 2
const WANDER_SPEED = 1.4
const ARRIVE_EPS = 0.05

function randomWanderVelocity(speed: number) {
  const angle = Math.random() * Math.PI * 2
  return { vx: Math.sin(angle) * speed, vz: Math.cos(angle) * speed }
}

function buildSlotState(slot: ZoneSlot): ZoneFrameState {
  return {
    position: getSlotWorld(slot),
    rotationY: slot.rotationY,
    pose: slotPose(slot),
    walkStyle: 'normal',
    status: 'in_zone',
  }
}

function buildWanderState(
  spawnGrid: [number, number],
  walkStyle: WalkStyle,
): ZoneFrameState {
  const [x, z] = gridToWorld(spawnGrid[0], spawnGrid[1])
  const { vx, vz } = randomWanderVelocity(WANDER_SPEED)
  return {
    position: [x, 0, z],
    rotationY: Math.atan2(vx, vz),
    pose: 'stand',
    walkStyle,
    status: 'in_zone',
  }
}

export function useZoneBehavior(config: ZoneBehaviorConfig) {
  const slotRef = useRef<ZoneSlot | null>(null)
  const statusRef = useRef<ZoneBehaviorStatus>('in_zone')
  const positionRef = useRef<[number, number, number]>([0, 0, 0])
  const rotationRef = useRef(0)
  const poseRef = useRef<Pose>('stand')
  const walkStyleRef = useRef<WalkStyle>('normal')
  const targetRef = useRef<[number, number] | null>(null)
  const velocityRef = useRef({ vx: 0, vz: 0 })
  const initRef = useRef<ZoneFrameState | null>(null)

  // ponytail: render 只讀 slot 定義；claim 放 useEffect，避 Strict Mode 雙 render 佔用失敗
  if (!initRef.current) {
    if (config.kind === 'slot') {
      const slot = findSlotDefinition(config.zoneId, config.slotId)
      if (!slot) {
        throw new Error(`Unknown slot ${config.slotId} in ${config.zoneId}`)
      }
      slotRef.current = slot
      const state = buildSlotState(slot)
      positionRef.current = state.position
      rotationRef.current = state.rotationY
      poseRef.current = state.pose
      walkStyleRef.current = state.walkStyle
      statusRef.current = state.status
      initRef.current = state
    } else {
      const state = buildWanderState(config.spawnGrid, config.walkStyle)
      positionRef.current = state.position
      rotationRef.current = state.rotationY
      poseRef.current = state.pose
      walkStyleRef.current = state.walkStyle
      statusRef.current = state.status
      const angle = state.rotationY
      velocityRef.current = {
        vx: Math.sin(angle) * WANDER_SPEED,
        vz: Math.cos(angle) * WANDER_SPEED,
      }
      initRef.current = state
    }
  }

  const init = initRef.current

  useEffect(() => {
    if (config.kind !== 'slot') return
    const { zoneId, slotId } = config
    const slot = claimSlot(zoneId, slotId)
    if (slot) slotRef.current = slot
    return () => {
      if (slot) releaseSlot(slot.id)
    }
  }, [config])

  const beginMoveTo = useCallback((worldX: number, worldZ: number, slot?: ZoneSlot) => {
    if (slot) {
      if (slotRef.current && slotRef.current.id !== slot.id) {
        releaseSlot(slotRef.current.id)
      }
      slotRef.current = slot
    }
    targetRef.current = [worldX, worldZ]
    statusRef.current = 'moving'
    poseRef.current = 'stand'
  }, [])

  const tick = useCallback(
    (dt: number): ZoneFrameState => {
      const [x, , z] = positionRef.current

      if (statusRef.current === 'moving' && targetRef.current) {
        const [targetX, targetZ] = targetRef.current
        const dx = targetX - x
        const dz = targetZ - z
        const dist = Math.hypot(dx, dz)

        if (dist < ARRIVE_EPS) {
          statusRef.current = 'in_zone'
          targetRef.current = null

          if (slotRef.current) {
            const slotState = buildSlotState(slotRef.current)
            positionRef.current = slotState.position
            rotationRef.current = slotState.rotationY
            poseRef.current = slotState.pose
          } else {
            positionRef.current = [targetX, 0, targetZ]
          }
        } else {
          const step = Math.min(MOVE_SPEED * dt, dist)
          const nextX = x + (dx / dist) * step
          const nextZ = z + (dz / dist) * step
          positionRef.current = [nextX, 0, nextZ]
          rotationRef.current = Math.atan2(dx, dz)
          poseRef.current = 'stand'
        }
      } else if (config.kind === 'wander' && statusRef.current === 'in_zone') {
        const bounds = zoneWorldBounds('wander')
        let { vx, vz } = velocityRef.current
        let nextX = x + vx * dt
        let nextZ = z + vz * dt

        if (nextX < bounds.minX) {
          nextX = bounds.minX
          vx = Math.abs(vx)
        } else if (nextX > bounds.maxX) {
          nextX = bounds.maxX
          vx = -Math.abs(vx)
        }
        if (nextZ < bounds.minZ) {
          nextZ = bounds.minZ
          vz = Math.abs(vz)
        } else if (nextZ > bounds.maxZ) {
          nextZ = bounds.maxZ
          vz = -Math.abs(vz)
        }

        velocityRef.current = { vx, vz }
        positionRef.current = [nextX, 0, nextZ]
        rotationRef.current = Math.atan2(vx, vz)
        poseRef.current = 'stand'
      } else if (
        statusRef.current === 'in_zone' &&
        slotRef.current?.zoneId === 'chat'
      ) {
        poseRef.current = liveChatPose(slotRef.current.id)
      }

      return {
        position: positionRef.current,
        rotationY: rotationRef.current,
        pose: poseRef.current,
        walkStyle: walkStyleRef.current,
        status: statusRef.current,
      }
    },
    [config.kind],
  )

  return { init, tick, beginMoveTo }
}
