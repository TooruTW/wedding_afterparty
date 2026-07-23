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

const WRAP_AT = 10

/** ponytail: 固定每 10 字硬換行（中文為主）；不做量寬斷詞 */
function wrapText(text: string) {
  const chars = [...text]
  const lines: string[] = []
  for (let i = 0; i < chars.length; i += WRAP_AT) {
    lines.push(chars.slice(i, i + WRAP_AT).join(''))
  }
  return lines.length ? lines : ['']
}

function makeSayTexture(text: string) {
  const padX = 18
  const padY = 12
  const tip = 10
  const lineH = 34
  const font = 'bold 28px "Microsoft JhengHei", "PingFang TC", sans-serif'

  const lines = wrapText(text)

  const measure = document.createElement('canvas').getContext('2d')!
  measure.font = font
  const textW = Math.ceil(Math.max(...lines.map((line) => measure.measureText(line).width)))

  const w = textW + padX * 2
  const bodyH = lineH * lines.length + padY * 2
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
  ctx.textAlign = 'center'
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, padY + lineH * (i + 0.5))
  })

  const map = new CanvasTexture(canvas)
  map.colorSpace = SRGBColorSpace
  map.minFilter = map.magFilter = LinearFilter
  map.needsUpdate = true
  return { map, aspect: w / h, lines: lines.length }
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
  const { map, aspect, lines } = useMemo(() => getSayTexture(text), [text])
  const height = 0.55 * (1 + (lines - 1) * 0.5)
  return (
    <sprite position={[0, headY + headR * 2.6, 0]} scale={[height * aspect, height, 1]}>
      <spriteMaterial map={map} transparent depthTest={false} />
    </sprite>
  )
}

{
  const single = makeSayTexture('測')
  console.assert(single.aspect > 0 && single.lines === 1, 'single line say texture')
  const double = makeSayTexture('一二三四五六七八九十十一')
  console.assert(double.lines === 2, `expected 2 lines, got ${double.lines}`)
  console.assert(wrapText('一二三四五六七八九十').length === 1, 'exactly 10 chars stays one line')
}
