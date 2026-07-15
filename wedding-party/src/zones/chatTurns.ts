import type { Pose } from '../types/pose'
import { ZONE_SLOTS } from './zones'

/** 每組輪流說話間隔 */
export const CHAT_TURN_MS = 3000

function groupIdOf(slotId: string) {
  // chat-g4-a → chat-g4；chat-p1-b → chat-p1
  return slotId.replace(/-[^-]+$/, '')
}

const CHAT_GROUPS: Map<string, string[]> = (() => {
  const map = new Map<string, string[]>()
  for (const slot of ZONE_SLOTS) {
    if (slot.zoneId !== 'chat') continue
    const groupId = groupIdOf(slot.id)
    const members = map.get(groupId)
    if (members) members.push(slot.id)
    else map.set(groupId, [slot.id])
  }
  return map
})()

/** 依共用時鐘決定該 slot 當下是說話還是聽 */
export function liveChatPose(slotId: string, nowMs = performance.now()): Pose {
  const members = CHAT_GROUPS.get(groupIdOf(slotId))
  if (!members || members.length === 0) return 'listen'
  const speaker = members[Math.floor(nowMs / CHAT_TURN_MS) % members.length]
  return speaker === slotId ? 'chat' : 'listen'
}

function assertChatTurns() {
  for (const [groupId, members] of CHAT_GROUPS) {
    console.assert(members.length >= 2, `${groupId} needs ≥2 members for turn-taking`)
    const speakers = members.filter((id) => liveChatPose(id, 0) === 'chat')
    console.assert(
      speakers.length === 1,
      `${groupId} at t=0 expected 1 speaker, got ${speakers.length}`,
    )
    const next = members.filter((id) => liveChatPose(id, CHAT_TURN_MS) === 'chat')
    console.assert(
      next.length === 1 && next[0] !== speakers[0],
      `${groupId} should rotate speaker after ${CHAT_TURN_MS}ms`,
    )
  }
}

assertChatTurns()
