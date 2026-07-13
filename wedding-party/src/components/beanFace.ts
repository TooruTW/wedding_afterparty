import { CanvasTexture, NearestFilter, SRGBColorSpace } from 'three'

/** 平面貼紙 UV：兩條豎向粗長方、中間分開、透明底、無嘴 */
function paintEyesSticker(ctx: CanvasRenderingContext2D, size: number) {
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

function makeEyesFaceTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  paintEyesSticker(canvas.getContext('2d')!, size)
  const map = new CanvasTexture(canvas)
  map.colorSpace = SRGBColorSpace
  map.generateMipmaps = false
  map.minFilter = map.magFilter = NearestFilter
  map.needsUpdate = true
  return map
}

export const EYES_FACE_MAP = makeEyesFaceTexture()

// ponytail: 固定兩眼；之後多臉就換成 FaceId → 共用 map
{
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  paintEyesSticker(c.getContext('2d')!, size)
  const data = c.getContext('2d')!.getImageData(0, 0, size, size).data
  const at = (u: number, v: number) => {
    const x = Math.floor(u * (size - 1))
    const y = Math.floor(v * (size - 1))
    const i = (y * size + x) * 4
    return { r: data[i]!, a: data[i + 3]! }
  }
  const left = at(0.5 - 0.22, 0.5)
  const mid = at(0.5, 0.5)
  console.assert(left.r === 0 && left.a === 255, 'left eye should be opaque black')
  console.assert(mid.a === 0, 'gap between eyes should be transparent')
}
