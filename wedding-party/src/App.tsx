import { useEffect, useState } from 'react'
import { ZoneActor } from './actors/ZoneActor'
import { GuestDialog } from './components/GuestDialog'
import type { GuestFormValues } from './components/GuestForm'
import { SceneCanvas } from './scene/SceneCanvas'
import {
  accountsIndexFromAccounts,
  charactersFromAccounts,
  fetchAccounts,
  postLogin,
  type Account,
  type AccountIndex,
} from './data/accounts'
import type { FakeGuest } from './data/fakeGuests'
import { clearAuthSession, getAuthSession, saveAuthSession } from './lib/authSession'
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

function formValuesFromAccount(account: Account): GuestFormValues[] {
  return account.characters.map((character) => ({
    name: character.name,
    face: character.eyeStyle,
    say: character.message,
    body: { face: character.eyeStyle, headSize: character.headSize },
  }))
}

function App() {
  const [guests, setGuests] = useState<FakeGuest[]>([])
  const [, setAccountIndex] = useState<AccountIndex[]>([])
  const [seedGuests, setSeedGuests] = useState<GuestFormValues[]>()
  const [saying, setSaying] = useState(() => new Set<number>())
  const [dialogOpen, setDialogOpen] = useState(false)

  async function loadAccountsFor(phone: string) {
    const accounts = await fetchAccounts()
    const account = accounts.find((item) => item.phone === phone)
    if (!account) throw new Error('找不到這個手機號碼')

    const next = charactersFromAccounts(accounts)
    const ownCharacters = formValuesFromAccount(account)
    setGuests(next)
    setAccountIndex(accountsIndexFromAccounts(accounts))
    setSeedGuests(ownCharacters)
    setSaying(pickSayIndices(SAY_VISIBLE, next.length))
    return ownCharacters
  }

  async function handleLogin(phone: string) {
    await postLogin({ phone })
    const ownCharacters = await loadAccountsFor(phone)
    saveAuthSession(phone)
    return ownCharacters
  }

  useEffect(() => {
    const session = getAuthSession()
    if (!session) return
    let cancelled = false
    fetchAccounts()
      .then((accounts) => {
        if (cancelled) return
        const account = accounts.find((item) => item.phone === session.phone)
        if (!account) {
          clearAuthSession()
          return
        }
        const next = charactersFromAccounts(accounts)
        setGuests(next)
        setAccountIndex(accountsIndexFromAccounts(accounts))
        setSeedGuests(formValuesFromAccount(account))
        setSaying(pickSayIndices(SAY_VISIBLE, next.length))
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
        onLogin={handleLogin}
        seedGuests={seedGuests}
      />
    </div>
  )
}

export default App
