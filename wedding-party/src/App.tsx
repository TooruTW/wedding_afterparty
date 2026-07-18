import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { ZoneActor } from './actors/ZoneActor'
import { Button } from './components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './components/ui/dialog'
import { EMPTY_GUEST_FORM, GuestForm, type GuestFormValues } from './components/GuestForm'
import { SceneCanvas } from './scene/SceneCanvas'
import { FAKE_GUESTS, type FakeGuest } from './data/fakeGuests'
import { WANDER_SPAWN_GRIDS, ZONE_SLOTS } from './scene/zones/zones'
import type { ZoneBehaviorConfig } from './scene/zones/useZoneBehavior'

const SAY_VISIBLE = 10
const SAY_ROTATE_MS = 5000

/** 先填 slot，多出來的進 wander（spawn 循環用） */
function configForIndex(index: number): ZoneBehaviorConfig {
  if (index < ZONE_SLOTS.length) {
    const slot = ZONE_SLOTS[index]!
    return { kind: 'slot', zoneId: slot.zoneId, slotId: slot.id }
  }
  const spawn =
    WANDER_SPAWN_GRIDS[(index - ZONE_SLOTS.length) % WANDER_SPAWN_GRIDS.length]!
  return { kind: 'wander', walkStyle: 'frenzy', spawnGrid: spawn }
}

function pickSayIndices(count: number, total: number) {
  const all = Array.from({ length: total }, (_, i) => i)
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j]!, all[i]!]
  }
  return new Set(all.slice(0, Math.min(count, total)))
}

function App() {
  // ponytail: 暫存於記憶體；重整即回 FAKE_GUESTS 種子
  const [guests, setGuests] = useState<FakeGuest[]>(() => [...FAKE_GUESTS])
  const [saying, setSaying] = useState(() => pickSayIndices(SAY_VISIBLE, FAKE_GUESTS.length))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<GuestFormValues>(EMPTY_GUEST_FORM)

  useEffect(() => {
    const id = setInterval(() => {
      setSaying(pickSayIndices(SAY_VISIBLE, guests.length))
    }, SAY_ROTATE_MS)
    return () => clearInterval(id)
  }, [guests.length])

  function addGuest(values: GuestFormValues) {
    const guest: FakeGuest = {
      id: `guest-${Date.now()}`,
      ...values,
    }
    setGuests((prev) => [...prev, guest])
    setDialogOpen(false)
  }

  return (
    <div className="app">
      <SceneCanvas venue="grassDay" paused={dialogOpen}>
        {guests.map((guest, index) => (
          <ZoneActor
            key={guest.id}
            body={guest.body}
            name={guest.name}
            say={saying.has(index) ? guest.say : undefined}
            config={configForIndex(index)}
          />
        ))}
      </SceneCanvas>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (open) setForm(EMPTY_GUEST_FORM)
        }}
      >
        <DialogTrigger asChild>
          <Button
            size="icon-lg"
            className="fixed right-4 bottom-4 z-40 size-12 rounded-full shadow-md"
            aria-label="開啟對話框"
          >
            <User className="size-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>加入賓客</DialogTitle>
          </DialogHeader>
          <GuestForm value={form} onChange={setForm} onSubmit={addGuest} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App
