import { FACE_IDS, type FaceId } from '../body/beanFace'
import type { FakeGuest } from './fakeGuests'

export type Character = {
  id: string
  eyeStyle: FaceId
  headSize: number
  name: string
  message: string
}

/** 帳號本體；characters 只在「自己的帳號」回應裡出現，不會塞別人的 email */
export type Account = {
  id: string
  email: string
  realName: string
  nickname: string
  drinks: boolean
  diet: string
  characters: Character[]
}

/** 公開場資料：後端 JOIN characters 即可，不含帳號個資 */
export async function fetchCharacters(): Promise<Character[]> {
  await new Promise((r) => setTimeout(r, 200))
  const res = await fetch(new URL('./characters.json', import.meta.url))
  if (!res.ok) throw new Error(`fetch characters failed: ${res.status}`)
  return (await res.json()) as Character[]
}

/**
 * ponytail: 模擬 POST /login → 只回自己的 Account。
 * 正式版後端用 email 查一筆；mock 仍讀 accounts.json，勿當成可公開下載。
 */
export async function postLogin(payload: { email: string }): Promise<Account> {
  await new Promise((r) => setTimeout(r, 200))
  const res = await fetch(new URL('./accounts.json', import.meta.url))
  if (!res.ok) throw new Error(`login failed: ${res.status}`)
  const accounts = (await res.json()) as Account[]
  const account = accounts.find((item) => item.email === payload.email)
  if (!account) throw new Error('找不到這個 Email')
  return account
}

export function charactersToGuests(characters: Character[]): FakeGuest[] {
  return characters.map((c) => ({
    id: c.id,
    name: c.name,
    face: c.eyeStyle,
    say: c.message,
    body: { face: c.eyeStyle, headSize: c.headSize },
  }))
}

export function accountToFormValues(account: Account) {
  return account.characters.map((c) => ({
    name: c.name,
    face: c.eyeStyle,
    say: c.message,
    body: { face: c.eyeStyle, headSize: c.headSize },
  }))
}

{
  const sample: Character = {
    id: 'c',
    eyeStyle: 'bars',
    headSize: 1,
    name: '測',
    message: '試',
  }
  const guests = charactersToGuests([sample])
  console.assert(guests.length === 1 && guests[0]!.face === 'bars', 'character maps to guest face')
  console.assert(FACE_IDS.includes('bars'), 'eyeStyle must be a FaceId')
}
