import { PARTY_SIZE_MAX } from './characterDrafts'
import type { FaceId } from '../body/beanFace'

export type InitialCharacter = {
  name: string
  face: FaceId
  say: string
  body: { face: FaceId; headSize: number }
}

const DEFAULT_FACE: FaceId = 'dots'

/**
 * 依出席人數產生初始角色草稿。
 * 第 1 隻：nickname 優先，否則 realName；第 2 隻起一律「家眷」。
 */
export function makeInitialCharacters(
  count: number,
  names: { nickname: string; realName: string },
): InitialCharacter[] {
  if (!Number.isInteger(count) || count < 1 || count > PARTY_SIZE_MAX) {
    throw new Error(`party size must be 1..${PARTY_SIZE_MAX}`)
  }
  const primary = names.nickname.trim() || names.realName.trim()
  console.assert(primary.length > 0, 'register requires nickname or realName')
  return Array.from({ length: count }, (_, i) => ({
    name: i === 0 ? primary : '家眷',
    face: DEFAULT_FACE,
    say: '我在說好聽話',
    body: { face: DEFAULT_FACE, headSize: 1 },
  }))
}

{
  const one = makeInitialCharacters(1, { nickname: '阿明', realName: '王小明' })
  console.assert(one.length === 1 && one[0]!.name === '阿明', 'nickname wins')
  const two = makeInitialCharacters(2, { nickname: '', realName: '王小明' })
  console.assert(two[0]!.name === '王小明' && two[1]!.name === '家眷', 'realName + 家眷')
  const three = makeInitialCharacters(3, { nickname: '小美', realName: 'x' })
  console.assert(
    three.map((c) => c.name).join(',') === '小美,家眷,家眷',
    'extras are 家眷',
  )
}
