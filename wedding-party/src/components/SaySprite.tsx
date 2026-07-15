import { useMemo } from 'react'
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'

const cache = new Map<string, { map: CanvasTexture; aspect: number }>()

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function makeSayTexture(text: string) {
  const padX = 18
  const padY = 12
  const tip = 10
  const font = 'bold 28px "Microsoft JhengHei", "PingFang TC", sans-serif'

  const measure = document.createElement('canvas').getContext('2d')!
  measure.font = font
  const textW = Math.ceil(measure.measureText(text).width)

  const w = textW + padX * 2
  const bodyH = 28 + padY * 2
  const h = bodyH + tip

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#ffffff'
  roundRect(ctx, 0, 0, w, bodyH, 14)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(w * 0.5 - 7, bodyH - 1)
  ctx.lineTo(w * 0.5 + 7, bodyH - 1)
  ctx.lineTo(w * 0.5, h)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#1a1a1a'
  ctx.font = font
  ctx.textBaseline = 'middle'
  ctx.fillText(text, padX, bodyH / 2)

  const map = new CanvasTexture(canvas)
  map.colorSpace = SRGBColorSpace
  map.minFilter = map.magFilter = LinearFilter
  map.needsUpdate = true
  return { map, aspect: w / h }
}

function getSayTexture(text: string) {
  let entry = cache.get(text)
  if (!entry) {
    entry = makeSayTexture(text)
    cache.set(text, entry)
  }
  return entry
}

export function SaySprite({
  text,
  headY,
  headR,
}: {
  text: string
  headY: number
  headR: number
}) {
  const { map, aspect } = useMemo(() => getSayTexture(text), [text])
  const height = 0.55
  return (
    <sprite position={[0, headY + headR * 1.9, 0]} scale={[height * aspect, height, 1]}>
      <spriteMaterial map={map} transparent depthTest={false} />
    </sprite>
  )
}

{
  const { aspect } = makeSayTexture('測')
  console.assert(aspect > 0, 'say texture aspect should be positive')
}
