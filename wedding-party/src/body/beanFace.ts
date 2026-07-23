import { CanvasTexture, NearestFilter, SRGBColorSpace, type Texture } from 'three'

export type FaceId = 'bars' | 'dots' | 'ovals'

type FacePainter = (ctx: CanvasRenderingContext2D, size: number) => void

/** 現在這張：兩條豎向粗長方、中間分開 */
const paintBars: FacePainter = (ctx, size) => {
  ctx.clearRect(0, 0, size, size)
  const spread = Math.round(size * 0.22)
  const w = Math.max(1, Math.round(size * 0.1))
  const h = Math.max(1, Math.round(size * 0.48))
  const cx = Math.round(size / 2)
  const cy = Math.round(size / 2)
  ctx.fillStyle = '#000000'
  for (const side of [-1, 1]) {
    ctx.fillRect(cx + side * spread - Math.floor(w / 2), cy - Math.floor(h / 2), w, h)
  }
}

/** 兩顆實心圓點 */
const paintDots: FacePainter = (ctx, size) => {
  ctx.clearRect(0, 0, size, size)
  const spread = Math.round(size * 0.2)
  const r = Math.max(1, Math.round(size * 0.1))
  const cx = Math.round(size / 2)
  const cy = Math.round(size / 2)
  ctx.fillStyle = '#000000'
  for (const side of [-1, 1]) {
    ctx.beginPath()
    ctx.arc(cx + side * spread, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** 兩顆豎橢圓 */
const paintOvals: FacePainter = (ctx, size) => {
  ctx.clearRect(0, 0, size, size)
  const spread = Math.round(size * 0.2)
  const rx = Math.max(1, Math.round(size * 0.07))
  const ry = Math.max(1, Math.round(size * 0.22))
  const cx = Math.round(size / 2)
  const cy = Math.round(size / 2)
  ctx.fillStyle = '#000000'
  for (const side of [-1, 1]) {
    ctx.beginPath()
    ctx.ellipse(cx + side * spread, cy, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

const FACE_PAINTERS: Record<FaceId, FacePainter> = {
  bars: paintBars,
  dots: paintDots,
  ovals: paintOvals,
}

export const FACE_IDS = Object.keys(FACE_PAINTERS) as FaceId[]

function makeFaceTexture(paint: FacePainter) {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  paint(canvas.getContext('2d')!, size)
  const map = new CanvasTexture(canvas)
  map.colorSpace = SRGBColorSpace
  map.generateMipmaps = false
  map.minFilter = map.magFilter = NearestFilter
  map.needsUpdate = true
  return map
}

/** 共用貼圖：每人只換參考，不重建 */
export const FACE_MAPS: Record<FaceId, Texture> = {
  bars: makeFaceTexture(paintBars),
  dots: makeFaceTexture(paintDots),
  ovals: makeFaceTexture(paintOvals),
}

export const DEFAULT_FACE: FaceId = 'bars'

{
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  paintBars(c.getContext('2d')!, size)
  const data = c.getContext('2d')!.getImageData(0, 0, size, size).data
  const at = (u: number, v: number) => {
    const x = Math.floor(u * (size - 1))
    const y = Math.floor(v * (size - 1))
    const i = (y * size + x) * 4
    return { r: data[i]!, a: data[i + 3]! }
  }
  const left = at(0.5 - 0.22, 0.5)
  const mid = at(0.5, 0.5)
  console.assert(left.r === 0 && left.a === 255, 'bars: left eye should be opaque black')
  console.assert(mid.a === 0, 'bars: gap between eyes should be transparent')
  console.assert(FACE_IDS.length >= 2, 'need at least two faces to pick from')
}
