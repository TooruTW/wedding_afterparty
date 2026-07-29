import { FACE_IDS, type FaceId } from '../body/beanFace'
import { makeInitialCharacters } from '../lib/initialCharacters'
import { getSupabase } from '../lib/supabase'
import type { FakeGuest } from './fakeGuests'

export type Character = {
  id: string
  eyeStyle: FaceId
  headSize: number
  name: string
  message: string
}

/** 帳號本體；characters 只在「自己的帳號」回應裡出現 */
export type Account = {
  id: string
  email: string
  realName: string
  nickname: string
  drinks: boolean
  diet: string
  characters: Character[]
}

export type RegisterPayload = {
  realName: string
  nickname: string
  email: string
  drinks: boolean
  diet: string
}

export type CharacterInput = {
  name: string
  face: FaceId
  say: string
  body: { face: FaceId; headSize: number }
}

type RpcAccount = {
  id: string
  email: string
  realName: string
  nickname: string
  drinks: boolean
  diet: string
  characters: Array<{
    id: string
    name: string
    eyeStyle: string
    headSize: number | string
    message: string
  }> | null
}

type CharacterRow = {
  id: string
  name: string
  eye_style: string
  head_size: number | string
  message: string
}

function asFaceId(raw: string): FaceId {
  if ((FACE_IDS as readonly string[]).includes(raw)) return raw as FaceId
  throw new Error(`未知的 eye_style: ${raw}`)
}

function rowToCharacter(row: {
  id: string
  name: string
  eyeStyle?: string
  eye_style?: string
  headSize?: number | string
  head_size?: number | string
  message: string
}): Character {
  const eye = row.eyeStyle ?? row.eye_style
  const head = row.headSize ?? row.head_size
  if (eye == null || head == null) throw new Error('character 缺 eye/head')
  return {
    id: row.id,
    name: row.name,
    eyeStyle: asFaceId(eye),
    headSize: Number(head),
    message: row.message,
  }
}

function parseAccount(raw: RpcAccount): Account {
  return {
    id: raw.id,
    email: raw.email,
    realName: raw.realName,
    nickname: raw.nickname,
    drinks: raw.drinks,
    diet: raw.diet,
    characters: (raw.characters ?? []).map(rowToCharacter),
  }
}

/** 公開場：characters 全表可讀（RLS） */
export async function fetchCharacters(): Promise<Character[]> {
  const { data, error } = await getSupabase()
    .from('characters')
    .select('id, name, eye_style, head_size, message')
    .order('created_at')
  if (error) throw new Error(error.message)
  return ((data ?? []) as CharacterRow[]).map(rowToCharacter)
}

/** 登入：rpc，找不到回「找不到這個 Email」 */
export async function postLogin(payload: { email: string }): Promise<Account> {
  const { data, error } = await getSupabase().rpc('get_account_by_email', {
    p_email: payload.email,
  })
  if (error) throw new Error(error.message)
  if (data == null) throw new Error('找不到這個 Email')
  return parseAccount(data as RpcAccount)
}

/**
 * 報名：只 insert，不 .select()。
 * accounts 刻意無 SELECT policy（防掃 email）；insert+returning 會踩 RLS。
 * 建完改走 get_account_by_email。
 */
export async function postRegister(values: RegisterPayload): Promise<Account> {
  const email = values.email.trim()
  const { error } = await getSupabase().from('accounts').insert({
    email,
    real_name: values.realName,
    nickname: values.nickname,
    drinks: values.drinks,
    diet: values.diet,
  })

  if (error) {
    if (error.code === '23505') throw new Error('這個 Email 已經報名過了，請直接登入')
    throw new Error(error.message)
  }

  return postLogin({ email })
}

/** 報名並依出席人數寫入初始角色 */
export async function postRegisterWithCharacters(
  values: RegisterPayload & { partySize: number },
): Promise<Account> {
  const account = await postRegister(values)
  await saveCharacters(account.id, makeInitialCharacters(values.partySize, values))
  return postLogin({ email: account.email })
}

/**
 * ponytail: 整批覆蓋（先刪再建）。上限靠 DB trigger；之後若要編輯單隻再改 upsert。
 */
export async function saveCharacters(accountId: string, guests: CharacterInput[]): Promise<void> {
  const db = getSupabase()
  const { error: delError } = await db.from('characters').delete().eq('account_id', accountId)
  if (delError) throw new Error(delError.message)

  if (guests.length === 0) return

  const { error: insError } = await db.from('characters').insert(
    guests.map((g) => ({
      account_id: accountId,
      name: g.name,
      eye_style: g.face,
      head_size: g.body.headSize,
      message: g.say,
    })),
  )
  if (insError) throw new Error(insError.message)
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

export function accountToFormValues(account: Account): CharacterInput[] {
  return account.characters.map((c) => ({
    name: c.name,
    face: c.eyeStyle,
    say: c.message,
    body: { face: c.eyeStyle, headSize: c.headSize },
  }))
}

{
  const guests = charactersToGuests([
    { id: 'c', eyeStyle: 'bars', headSize: 1, name: '測', message: '試' },
  ])
  console.assert(guests.length === 1 && guests[0]!.face === 'bars', 'character maps to guest face')
  console.assert(FACE_IDS.includes('bars'), 'eyeStyle must be a FaceId')
}
