import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { ZoneActor } from './actors/ZoneActor'
import { Button } from './components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from './components/ui/dialog'
import { SceneCanvas } from './scene/SceneCanvas'
import { FAKE_GUESTS } from './data/fakeGuests'
import { WANDER_SPAWN_GRIDS, ZONE_SLOTS } from './scene/zones/zones'
import type { ZoneBehaviorConfig } from './scene/zones/useZoneBehavior'

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
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setSaying(pickSayIndices(SAY_VISIBLE, FAKE_GUESTS.length))
    }, SAY_ROTATE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="app">
      <SceneCanvas venue="grassDay" paused={dialogOpen}>
        {FAKE_GUESTS.map((guest, index) => (
          <ZoneActor
            key={guest.id}
            body={guest.body}
            name={guest.name}
            say={saying.has(index) ? guest.say : undefined}
            config={DEMO_CONFIGS[index]!}
          />
        ))}
      </SceneCanvas>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon-lg"
            className="fixed right-4 bottom-4 z-40 size-12 rounded-full shadow-md"
            aria-label="開啟對話框"
          >
            <User className="size-6" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle asChild>
            <h1>這是 dialog</h1>
          </DialogTitle>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App
