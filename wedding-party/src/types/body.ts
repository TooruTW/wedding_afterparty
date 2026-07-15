import { DEFAULT_FACE, type FaceId } from '../components/beanFace'

/** 雛型：頭大小 + 臉型 */
export type Body = {
  headSize: number
  face: FaceId
}

export const DEFAULT_BODY: Body = {
  headSize: 1,
  face: DEFAULT_FACE,
}
