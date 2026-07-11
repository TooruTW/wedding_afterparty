import { gridToWorld, ZONE_SLOTS, type ZoneId, type ZoneSlot } from './zones'

const occupied = new Set<string>()

type SlotZoneId = Extract<ZoneId, 'chat' | 'sit'>

export function claimSlot(zoneId: SlotZoneId, slotId?: string): ZoneSlot | null {
  const slots = ZONE_SLOTS.filter((slot) => slot.zoneId === zoneId)

  if (slotId) {
    const slot = slots.find((entry) => entry.id === slotId)
    if (!slot || occupied.has(slot.id)) return null
    occupied.add(slot.id)
    return slot
  }

  for (const slot of slots) {
    if (!occupied.has(slot.id)) {
      occupied.add(slot.id)
      return slot
    }
  }
  return null
}

export function releaseSlot(slotId: string): void {
  occupied.delete(slotId)
}

export function getSlotWorld(slot: ZoneSlot): [number, number, number] {
  const [x, z] = gridToWorld(slot.gridX, slot.gridZ)
  return [x, 0, z]
}
