/** 雛型：目前只開放腿長、頭部大小 */
export type Body = {
  legHeight: number
  headSize: number
}

export const DEFAULT_BODY: Body = {
  legHeight: 1.15,
  headSize: 1,
}
