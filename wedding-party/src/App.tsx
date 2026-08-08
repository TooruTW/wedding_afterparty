import { useEffect, useRef, useState } from 'react'
import { ZoneActor } from './actors/ZoneActor'
import { GuestDialog } from './components/GuestDialog'
import type { GuestFormValues } from './components/GuestForm'
import type { RegisterFormValues } from './components/AuthForms'
import { SceneCanvas } from './scene/SceneCanvas'
import {
  accountToFormValues,
  charactersToGuests,
  fetchCharacters,
  postLogin,
  postRegisterWithCharacters,
  saveCharacters,
  type Account,
} from './data/accounts'
import type { FakeGuest } from './data/fakeGuests'
import { clearAuthSession, getAuthSession, saveAuthSession } from './lib/authSession'
import { WANDER_SPAWN_GRIDS, ZONE_SLOTS } from './scene/zones/zones'
import type { ZoneBehaviorConfig } from './scene/zones/useZoneBehavior'

const SAY_VISIBLE = 10
const SAY_ROTATE_MS = 5000
const SPLASH_MIN_MS = 1000
/** 場上固定格子數；角色隨機塞進格子，人少才不會全擠在前面的聊天／坐下區 */
const FLOOR_CAPACITY = 30
/** 遮罩起算點 = App 載入的時間；整支程式只有一個 App，不需要 per-instance */
const SPLASH_STARTED_AT = Date.now()

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

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

/** 把角色隨機撒進固定長度場地；超過容量就隨機捨棄多餘的 */
function scatterOntoFloor(guests: FakeGuest[], capacity = FLOOR_CAPACITY): (FakeGuest | null)[] {
  const floor: (FakeGuest | null)[] = Array.from({ length: capacity }, () => null)
  const indices = shuffleInPlace(Array.from({ length: capacity }, (_, i) => i))
  const placed = shuffleInPlace([...guests]).slice(0, capacity)
  for (let i = 0; i < placed.length; i++) floor[indices[i]!] = placed[i]!
  return floor
}

function pickSayIndices(count: number, floor: (FakeGuest | null)[]) {
  const occupied = floor.flatMap((g, i) => (g ? [i] : []))
  shuffleInPlace(occupied)
  return new Set(occupied.slice(0, Math.min(count, occupied.length)))
}

{
  const demo = scatterOntoFloor(
    Array.from({ length: 3 }, (_, i) => ({
      id: `t${i}`,
      name: `t${i}`,
      face: 'bars' as const,
      say: '',
      body: { face: 'bars' as const, headSize: 1 as const },
    })),
    30,
  )
  console.assert(demo.length === 30, 'floor is always capacity-long')
  console.assert(demo.filter(Boolean).length === 3, 'only real guests occupy cells')
}

function App() {
  const [guests, setGuests] = useState<(FakeGuest | null)[]>(() =>
    Array.from({ length: FLOOR_CAPACITY }, () => null),
  )
  // ponytail: 只存「自己」；別人的帳號不該進前端
  const [me, setMe] = useState<Account | null>(null)
  const [seedGuests, setSeedGuests] = useState<GuestFormValues[]>()
  const [saying, setSaying] = useState(() => new Set<number>())
  const [sceneReady, setSceneReady] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const splashTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  async function reloadFloor() {
    const characters = await fetchCharacters()
    const next = scatterOntoFloor(charactersToGuests(characters))
    setGuests(next)
    setSaying(pickSayIndices(SAY_VISIBLE, next))
  }

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

  async function handleRegister(values: RegisterFormValues) {
    const account = await postRegisterWithCharacters(values)
    const ownCharacters = applyOwnAccount(account)
    saveAuthSession(account.email)
    await reloadFloor()
    return ownCharacters
  }

  function handleLogout() {
    clearAuthSession()
    setMe(null)
    setSeedGuests(undefined)
  }

  /** 開啟前先抓完最新資料再翻開，dialog 才不會先閃一下舊角色 */
  async function handleDialogOpenChange(next: boolean) {
    if (!next) {
      setDialogOpen(false)
      return
    }
    const session = getAuthSession()
    try {
      await reloadFloor()
      if (session) applyOwnAccount(await postLogin({ email: session.email }))
    } catch (cause) {
      console.error(cause)
      if (session) handleLogout()
    }
    setDialogOpen(true)
  }

  async function handleSubmitGuests(values: GuestFormValues[]) {
    if (!me) throw new Error('請先登入或報名')
    await saveCharacters(me.id, values)
    await reloadFloor()
    const refreshed = await postLogin({ email: me.email })
    applyOwnAccount(refreshed)
    setDialogOpen(false)
  }

  function handleSceneReady() {
    // ponytail: 遮罩至少 SPLASH_MIN_MS；場景更晚就緒就等到就緒再關
    const remain = Math.max(0, SPLASH_MIN_MS - (Date.now() - SPLASH_STARTED_AT))
    clearTimeout(splashTimer.current)
    splashTimer.current = setTimeout(() => {
      setSceneReady(true)
      if (getAuthSession() === null) setDialogOpen(true)
    }, remain)
  }

  useEffect(() => () => clearTimeout(splashTimer.current), [])

  useEffect(() => {
    let cancelled = false
    // setState 發生在 await 之後的非同步回呼，不是同步 effect body；規則看不穿 async
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reloadFloor().catch((cause) => {
      if (!cancelled) console.error(cause)
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
      setSaying(pickSayIndices(SAY_VISIBLE, guests))
    }, SAY_ROTATE_MS)
    return () => clearInterval(id)
  }, [guests])

  return (
    <div className="app">
      <SceneCanvas venue="grassDay" paused={dialogOpen} onReady={handleSceneReady}>
        {guests.map((guest, index) =>
          guest ? (
            <ZoneActor
              key={guest.id}
              body={guest.body}
              name={guest.name}
              say={saying.has(index) ? guest.say : undefined}
              config={configForIndex(index)}
            />
          ) : null,
        )}
      </SceneCanvas>

      <GuestDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        onSubmit={handleSubmitGuests}
        onLogin={handleLogin}
        onRegister={handleRegister}
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
