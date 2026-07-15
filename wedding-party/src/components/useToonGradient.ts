import { useTexture } from '@react-three/drei'
import { useLayoutEffect } from 'react'

// ponytail: 3-band cel gradient via canvas — upgrade: per-character tone maps
const TOON_GRADIENT_URL = (() => {
  const canvas = document.createElement('canvas')
  canvas.width = 3
  canvas.height = 1
  const ctx = canvas.getContext('2d')!
  for (const [x, color] of [
    [0, '#000000'],
    [1, '#808080'],
    [2, '#ffffff'],
  ] as const) {
    ctx.fillStyle = color
    ctx.fillRect(x, 0, 1, 1)
  }
  return canvas.toDataURL()
})()

export function useToonGradient() {
  const map = useTexture(TOON_GRADIENT_URL)
  useLayoutEffect(() => {
    map.minFilter = map.magFilter = 1003 // NearestFilter
    map.needsUpdate = true
  }, [map])
  return map
}
