import { useEffect, useRef, useState } from 'react'
import { ZoneActor } from './actors/ZoneActor'
import { GuestDialog } from './components/GuestDialog'
import type { GuestFormValues } from './components/GuestForm'
import { SceneCanvas } from './scene/SceneCanvas'
import {
  accountToFormValues,
  charactersToGuests,
  fetchCharacters,
  postLogin,
  type Account,
} from './data/accounts'
import type { FakeGuest } from './data/fakeGuests'
import { clearAuthSession, getAuthSession, saveAuthSession } from './lib/authSession'
import { WANDER_SPAWN_GRIDS, ZONE_SLOTS } from './scene/zones/zones'
import type { ZoneBehaviorConfig } from './scene/zones/useZoneBehavior'

const SAY_VISIBLE = 10
const SAY_ROTATE_MS = 5000
const SPLASH_MIN_MS = 1000

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
  const [guests, setGuests] = useState<FakeGuest[]>([])
  // ponytail: 只存「自己」；別人的帳號不該進前端
  const [, setMe] = useState<Account | null>(null)
  const [seedGuests, setSeedGuests] = useState<GuestFormValues[]>()
  const [saying, setSaying] = useState(() => new Set<number>())
  const [sceneReady, setSceneReady] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const splashStartedAt = useRef(Date.now())
  const splashTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  function applyOwnAccount(account: Account) {
    const ownCharacters = accountToFormValues(account)
    setMe(account)
    setSeedGuests(ownCharacters)
    return ownCharacters
  }

  async function handleLogin(email: string) {
    const account = await postLogin({ email })
    const ownCharacters = applyOwnAccount(account)
    saveAuthSession(email)
    return ownCharacters
  }

  function handleLogout() {
    clearAuthSession()
    setMe(null)
    setSeedGuests(undefined)
  }

  function handleSceneReady() {
    // ponytail: 遮罩至少 SPLASH_MIN_MS；場景更晚就緒就等到就緒再關
    const remain = Math.max(0, SPLASH_MIN_MS - (Date.now() - splashStartedAt.current))
    clearTimeout(splashTimer.current)
    splashTimer.current = setTimeout(() => {
      setSceneReady(true)
      if (getAuthSession() === null) setDialogOpen(true)
    }, remain)
  }

  useEffect(() => () => clearTimeout(splashTimer.current), [])

  useEffect(() => {
    let cancelled = false
    fetchCharacters().then((characters) => {
      if (cancelled) return
      const next = charactersToGuests(characters)
      setGuests(next)
      setSaying(pickSayIndices(SAY_VISIBLE, next.length))
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const session = getAuthSession()
    if (!session) return
    let cancelled = false
    postLogin({ email: session.email })
      .then((account) => {
        if (!cancelled) applyOwnAccount(account)
      })
      .catch(() => {
        if (!cancelled) clearAuthSession()
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
      <SceneCanvas venue="grassDay" paused={dialogOpen} onReady={handleSceneReady}>
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
        onLogin={handleLogin}
        onLogout={handleLogout}
        seedGuests={seedGuests}
      />

      {!sceneReady ? (
        <div className="fixed inset-0 z-50 bg-white" aria-hidden />
      ) : null}
    </div>
  )
}

export default App
