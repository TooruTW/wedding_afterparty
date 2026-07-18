import { FLOOR_GRID } from '../floorModes'
import type { Pose } from '../../types/pose'

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

/** 聊天區：4 人圍聊置中；3 組 2 人對看分散在四周；坐下區：兩排共 10 格、略錯位 */
export const ZONE_SLOTS: ZoneSlot[] = [
  // 4 人圍聊（聊天區中央）
  { id: 'chat-g4-a', zoneId: 'chat', ...slotFromLegacy(4, 0.5), rotationY: 0, pose: 'chat' },
  { id: 'chat-g4-b', zoneId: 'chat', ...slotFromLegacy(4, 1.6), rotationY: Math.PI, pose: 'listen' },
  { id: 'chat-g4-c', zoneId: 'chat', ...slotFromLegacy(3.4, 1), rotationY: Math.PI / 2, pose: 'chat' },
  { id: 'chat-g4-d', zoneId: 'chat', ...slotFromLegacy(4.6, 1), rotationY: -Math.PI / 2, pose: 'listen' },
  // 對看組：北
  { id: 'chat-p1-a', zoneId: 'chat', ...slotFromLegacy(8, 1.5), rotationY: Math.PI / 4, pose: 'chat' },
  { id: 'chat-p1-b', zoneId: 'chat', ...slotFromLegacy(8.7, 2.2), rotationY: -Math.PI / 1.5, pose: 'listen' },
  // 對看組：西
  { id: 'chat-p2-a', zoneId: 'chat', ...slotFromLegacy(1.6, 2.1), rotationY: 0, pose: 'chat' },
  { id: 'chat-p2-b', zoneId: 'chat', ...slotFromLegacy(1.6, 2.9), rotationY: Math.PI, pose: 'listen' },
  // 對看組：南
  { id: 'chat-p3-a', zoneId: 'chat', ...slotFromLegacy(5.4, 3.2), rotationY: Math.PI / 2, pose: 'chat' },
  { id: 'chat-p3-b', zoneId: 'chat', ...slotFromLegacy(6.6, 3.2), rotationY: -Math.PI / 2, pose: 'listen' },
  // 坐下區：後排 5 格
  { id: 'sit-1', zoneId: 'sit', ...slotFromLegacy(13, 1.3), rotationY: 0, pose: 'sit' },
  { id: 'sit-2', zoneId: 'sit', ...slotFromLegacy(15.8, 1.7), rotationY: 0.15, pose: 'sit' },
  { id: 'sit-3', zoneId: 'sit', ...slotFromLegacy(18.2, 1.5), rotationY: -0.1, pose: 'sit' },
  { id: 'sit-4', zoneId: 'sit', ...slotFromLegacy(16.5, 2.1), rotationY: 0.08, pose: 'sit' },
  { id: 'sit-5', zoneId: 'sit', ...slotFromLegacy(14.2, 1.9), rotationY: -0.12, pose: 'sit' },
  // 坐下區：前排 5 格（略錯位）
  { id: 'sit-6', zoneId: 'sit', ...slotFromLegacy(12.5, 3.6), rotationY: 0.05, pose: 'sit' },
  { id: 'sit-7', zoneId: 'sit', ...slotFromLegacy(16.2, 3.1), rotationY: -0.18, pose: 'sit' },
  { id: 'sit-8', zoneId: 'sit', ...slotFromLegacy(17.8, 3.8), rotationY: 0.1, pose: 'sit' },
  { id: 'sit-9', zoneId: 'sit', ...slotFromLegacy(14.8, 3), rotationY: -0.05, pose: 'sit' },
  { id: 'sit-10', zoneId: 'sit', ...slotFromLegacy(18.5, 3.5), rotationY: 0.2, pose: 'sit' },
]

/** 亂跑區出生點：5×4 格分散 */
const WANDER_SPAWN_COLS = 5
const WANDER_SPAWN_ROWS = 4

function buildWanderSpawnGrids(): [number, number][] {
  const minX = 2
  const maxX = FLOOR_GRID.width - 2
  const minZ = Z_MID + 1
  const maxZ = FLOOR_GRID.depth - 1
  const grids: [number, number][] = []
  for (let row = 0; row < WANDER_SPAWN_ROWS; row++) {
    for (let col = 0; col < WANDER_SPAWN_COLS; col++) {
      grids.push([
        minX + ((col + 0.5) / WANDER_SPAWN_COLS) * (maxX - minX),
        minZ + ((row + 0.5) / WANDER_SPAWN_ROWS) * (maxZ - minZ),
      ])
    }
  }
  return grids
}

export const WANDER_SPAWN_GRIDS = buildWanderSpawnGrids()

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

function assertZoneSlots() {
  const chat = ZONE_SLOTS.filter((s) => s.zoneId === 'chat')
  const sit = ZONE_SLOTS.filter((s) => s.zoneId === 'sit')
  console.assert(chat.length === 10, `chat slots expected 10, got ${chat.length}`)
  console.assert(sit.length === 10, `sit slots expected 10, got ${sit.length}`)
  for (const slot of ZONE_SLOTS) {
    console.assert(
      pointInZone(slot.gridX, slot.gridZ, slot.zoneId),
      `${slot.id} at (${slot.gridX}, ${slot.gridZ}) outside ${slot.zoneId}`,
    )
  }
}

function assertWanderSpawns() {
  console.assert(
    WANDER_SPAWN_GRIDS.length === WANDER_SPAWN_COLS * WANDER_SPAWN_ROWS,
    `wander spawns expected ${WANDER_SPAWN_COLS * WANDER_SPAWN_ROWS}, got ${WANDER_SPAWN_GRIDS.length}`,
  )
  for (const [gridX, gridZ] of WANDER_SPAWN_GRIDS) {
    console.assert(
      pointInZone(gridX, gridZ, 'wander'),
      `wander spawn at (${gridX}, ${gridZ}) outside wander`,
    )
  }
}

assertGridToWorld()
assertZoneSlots()
assertWanderSpawns()
