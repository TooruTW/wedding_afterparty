import { FLOOR_GRID } from '../components/floorModes'
import type { Pose } from '../types/pose'

/** 舊版 20×10 配置等比例放大至 FLOOR_GRID（25×15），以 X/Z 中線分區 */
const X_MID = FLOOR_GRID.width / 2
const Z_MID = FLOOR_GRID.depth / 2
const SCALE_X = FLOOR_GRID.width / 20
const SCALE_Z = FLOOR_GRID.depth / 10

function scaleGrid(x: number, z: number): [number, number] {
  return [x * SCALE_X, z * SCALE_Z]
}

export type ZoneId = 'chat' | 'sit' | 'wander'

export type ZoneAABB = {
  id: ZoneId
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  allowedPoses: readonly Pose[]
}

export const ZONES: Record<ZoneId, ZoneAABB> = {
  chat: {
    id: 'chat',
    minX: 0,
    maxX: X_MID,
    minZ: 0,
    maxZ: Z_MID,
    allowedPoses: ['chat', 'listen'],
  },
  sit: {
    id: 'sit',
    minX: X_MID,
    maxX: FLOOR_GRID.width,
    minZ: 0,
    maxZ: Z_MID,
    allowedPoses: ['sit'],
  },
  wander: {
    id: 'wander',
    minX: 0,
    maxX: FLOOR_GRID.width,
    minZ: Z_MID,
    maxZ: FLOOR_GRID.depth,
    allowedPoses: ['stand'],
  },
}

export type ZoneSlot = {
  id: string
  zoneId: 'chat' | 'sit'
  gridX: number
  gridZ: number
  rotationY: number
  pose: Pose
}

function slotFromLegacy(gridX: number, gridZ: number) {
  const [x, z] = scaleGrid(gridX, gridZ)
  return { gridX: x, gridZ: z }
}

export const ZONE_SLOTS: ZoneSlot[] = [
  { id: 'chat-a', zoneId: 'chat', ...slotFromLegacy(2.5, 2.5), rotationY: Math.PI / 2, pose: 'chat' },
  { id: 'chat-b', zoneId: 'chat', ...slotFromLegacy(7.5, 2.5), rotationY: -Math.PI / 2, pose: 'listen' },
  { id: 'sit-a', zoneId: 'sit', ...slotFromLegacy(12.5, 2.5), rotationY: 0, pose: 'sit' },
  { id: 'sit-b', zoneId: 'sit', ...slotFromLegacy(17.5, 2.5), rotationY: 0, pose: 'sit' },
]

/** MVP 亂跑區出生點（等比例自 20×10 配置） */
export const WANDER_SPAWN_GRIDS: [number, number][] = [
  scaleGrid(5, 7.5),
  scaleGrid(15, 7.5),
]

export function gridToWorld(gridX: number, gridZ: number): [number, number] {
  return [
    gridX + 0.5 - FLOOR_GRID.width / 2,
    gridZ + 0.5 - FLOOR_GRID.depth / 2,
  ]
}

export function pointInZone(gridX: number, gridZ: number, zoneId: ZoneId): boolean {
  const zone = ZONES[zoneId]
  return (
    gridX >= zone.minX &&
    gridX <= zone.maxX &&
    gridZ >= zone.minZ &&
    gridZ <= zone.maxZ
  )
}

export function zoneWorldBounds(zoneId: ZoneId) {
  const zone = ZONES[zoneId]
  return {
    minX: zone.minX - FLOOR_GRID.width / 2,
    maxX: zone.maxX - FLOOR_GRID.width / 2,
    minZ: zone.minZ - FLOOR_GRID.depth / 2,
    maxZ: zone.maxZ - FLOOR_GRID.depth / 2,
  }
}

function assertGridToWorld() {
  const [backLeftX, backLeftZ] = gridToWorld(0, 0)
  console.assert(
    Math.abs(backLeftX - (-11.5)) < 1e-6 && Math.abs(backLeftZ - (-7)) < 1e-6,
    `gridToWorld(0,0) expected (-11.5, -7), got (${backLeftX}, ${backLeftZ})`,
  )
  const [chatX, chatZ] = gridToWorld(3.125, 3.75)
  console.assert(
    Math.abs(chatX - (-8.375)) < 1e-6 && Math.abs(chatZ - (-3.25)) < 1e-6,
    `gridToWorld(3.125,3.75) expected (-8.375, -3.25), got (${chatX}, ${chatZ})`,
  )
  const [midX, midZ] = gridToWorld(X_MID, Z_MID)
  console.assert(
    Math.abs(midX - 0.5) < 1e-6 && Math.abs(midZ - 0.5) < 1e-6,
    `gridToWorld midline expected (0.5, 0.5), got (${midX}, ${midZ})`,
  )
}

assertGridToWorld()
