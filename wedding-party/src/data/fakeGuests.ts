import type { FaceId } from '../body/beanFace'
import type { Body } from '../types/body'

export type FakeGuest = {
  id: string
  name: string
  /** 臉型選擇 */
  face: FaceId
  /** 想說的一句話（chat 時用 Sprite 顯示） */
  say: string
  body: Body
}
