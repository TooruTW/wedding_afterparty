import { useEffect, useState } from 'react'
import { ZoneActor } from './components/ZoneActor'
import { SceneCanvas } from './components/SceneCanvas'
import { FAKE_GUESTS } from './data/fakeGuests'
import { WANDER_SPAWN_GRIDS, ZONE_SLOTS } from './zones/zones'
import type { ZoneBehaviorConfig } from './zones/useZoneBehavior'

/** 30 人：先填完 slot（20），剩下 10 人進 wander */
const SLOT_CONFIGS: ZoneBehaviorConfig[] = ZONE_SLOTS.map((slot) => ({
  kind: 'slot' as const,
  zoneId: slot.zoneId,
  slotId: slot.id,
}))

const WANDER_CONFIGS: ZoneBehaviorConfig[] = WANDER_SPAWN_GRIDS.slice(0, 10).map((spawnGrid) => ({
  kind: 'wander' as const,
  walkStyle: 'frenzy' as const,
  spawnGrid,
}))

const DEMO_CONFIGS = [...SLOT_CONFIGS, ...WANDER_CONFIGS]
const SAY_VISIBLE = 10
const SAY_ROTATE_MS = 5000

console.assert(
  DEMO_CONFIGS.length === FAKE_GUESTS.length,
  `configs ${DEMO_CONFIGS.length} != guests ${FAKE_GUESTS.length}`,
)

function pickSayIndices(count: number, total: number) {
  const all = Array.from({ length: total }, (_, i) => i)
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j]!, all[i]!]
  }
  return new Set(all.slice(0, Math.min(count, total)))
}

function App() {
  const [saying, setSaying] = useState(() => pickSayIndices(SAY_VISIBLE, FAKE_GUESTS.length))

  useEffect(() => {
    const id = setInterval(() => {
      setSaying(pickSayIndices(SAY_VISIBLE, FAKE_GUESTS.length))
    }, SAY_ROTATE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="app">
      <SceneCanvas floorMode="zoneSplit">
        {FAKE_GUESTS.map((guest, index) => (
          <ZoneActor
            key={guest.id}
            body={guest.body}
            say={saying.has(index) ? guest.say : undefined}
            config={DEMO_CONFIGS[index]!}
          />
        ))}
      </SceneCanvas>
    </div>
  )
}

export default App
