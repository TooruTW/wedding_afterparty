import { useMemo } from 'react'
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'

const cache = new Map<string, { map: CanvasTexture; aspect: number }>()

function makeNameTexture(text: string) {
  const padX = 10
  const padY = 6
  const font = 'bold 24px "Microsoft JhengHei", "PingFang TC", sans-serif'

  const measure = document.createElement('canvas').getContext('2d')!
  measure.font = font
  const textW = Math.ceil(measure.measureText(text).width)

  const w = textW + padX * 2
  const h = 24 + padY * 2

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  ctx.font = font
  ctx.textBaseline = 'middle'
  ctx.lineWidth = 4
  ctx.strokeStyle = '#000000'
  ctx.fillStyle = '#ffffff'
  ctx.strokeText(text, padX, h / 2)
  ctx.fillText(text, padX, h / 2)

  const map = new CanvasTexture(canvas)
  map.colorSpace = SRGBColorSpace
  map.minFilter = map.magFilter = LinearFilter
  map.needsUpdate = true
  return { map, aspect: w / h }
}

function getNameTexture(text: string) {
  let entry = cache.get(text)
  if (!entry) {
    entry = makeNameTexture(text)
    cache.set(text, entry)
  }
  return entry
}

/** 對話框下方，常駐掛在頭上 */
export function NameSprite({
  name,
  headY,
  headR,
}: {
  name: string
  headY: number
  headR: number
}) {
  const { map, aspect } = useMemo(() => getNameTexture(name), [name])
  const height = 0.32
  return (
    <sprite position={[0, headY + headR * 1.25, 0]} scale={[height * aspect, height, 1]}>
      <spriteMaterial map={map} transparent depthTest={false} />
    </sprite>
  )
}

{
  const { aspect } = makeNameTexture('測')
  console.assert(aspect > 0, 'name texture aspect should be positive')
}
