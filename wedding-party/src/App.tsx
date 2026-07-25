import { useEffect, useState } from 'react'
import { ZoneActor } from './actors/ZoneActor'
import { GuestDialog } from './components/GuestDialog'
import type { GuestFormValues } from './components/GuestForm'
import { SceneCanvas } from './scene/SceneCanvas'
import { charactersFromAccounts, fetchAccounts } from './data/accounts'
import type { FakeGuest } from './data/fakeGuests'
import { WANDER_SPAWN_GRIDS, ZONE_SLOTS } from './scene/zones/zones'
import type { ZoneBehaviorConfig } from './scene/zones/useZoneBehavior'

const SAY_VISIBLE = 10
const SAY_ROTATE_MS = 5000

/** ponytail: 假資料預覽多人角色編輯狀態；正式上線移除此常數與 seedGuests prop */
const FAKE_PARTY: GuestFormValues[] = [
  { name: '阿明', face: 'bars', say: '新婚快樂！', body: { face: 'bars', headSize: 0.85 } },
  { name: '小美', face: 'dots', say: '甜甜蜜蜜', body: { face: 'dots', headSize: 1.2 } },
  { name: '大偉', face: 'ovals', say: '舞池是我的', body: { face: 'ovals', headSize: 1.15 } },
]

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
  // ponytail: 種子改走 fetchAccounts；重整會再打一次模擬 API
  const [guests, setGuests] = useState<FakeGuest[]>([])
  const [saying, setSaying] = useState(() => new Set<number>())
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchAccounts().then((accounts) => {
      if (cancelled) return
      const next = charactersFromAccounts(accounts)
      setGuests(next)
      setSaying(pickSayIndices(SAY_VISIBLE, next.length))
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setSaying(pickSayIndices(SAY_VISIBLE, guests.length))
    }, SAY_ROTATE_MS)
    return () => clearInterval(id)
  }, [guests.length])

  function addGuests(values: GuestFormValues[]) {
    setGuests((prev) => [
      ...prev,
      ...values.map((v) => ({ id: crypto.randomUUID(), ...v })),
    ])
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

      <GuestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={addGuests}
        seedGuests={FAKE_PARTY}
      />
    </div>
  )
}

export default App
