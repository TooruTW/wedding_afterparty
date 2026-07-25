import { FACE_IDS, type FaceId } from '../body/beanFace'
import type { FakeGuest } from './fakeGuests'

export type Character = {
  id: string
  eyeStyle: FaceId
  headSize: number
  name: string
  message: string
}

export type Account = {
  id: string
  phone: string
  realName: string
  nickname: string
  drinks: boolean
  diet: string
  characters: Character[]
}

/** ponytail: 模擬 API；之後換成真實 endpoint 即可 */
export async function fetchAccounts(): Promise<Account[]> {
  await new Promise((r) => setTimeout(r, 200))
  const res = await fetch(new URL('./accounts.json', import.meta.url))
  if (!res.ok) throw new Error(`fetch accounts failed: ${res.status}`)
  return (await res.json()) as Account[]
}

/** 整組帳號 → 場上要渲染的角色陣列 */
export function charactersFromAccounts(accounts: Account[]): FakeGuest[] {
  return accounts.flatMap((account) =>
    account.characters.map((c) => ({
      id: c.id,
      name: c.name,
      face: c.eyeStyle,
      say: c.message,
      body: { face: c.eyeStyle, headSize: c.headSize },
    })),
  )
}

{
  const sample: Account = {
    id: 'x',
    phone: '09',
    realName: '',
    nickname: '',
    drinks: false,
    diet: '',
    characters: [
      {
        id: 'c',
        eyeStyle: 'bars',
        headSize: 1,
        name: '測',
        message: '試',
      },
    ],
  }
  const guests = charactersFromAccounts([sample])
  console.assert(guests.length === 1 && guests[0]!.face === 'bars', 'flatten keeps eyeStyle as face')
  console.assert(FACE_IDS.includes('bars'), 'eyeStyle must be a FaceId')
}
