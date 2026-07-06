import { OrbitControls, useTexture } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { ReactNode } from 'react'

type SceneCanvasProps = {
  children?: ReactNode
}

const SCENE_WIDTH = 25
const SCENE_DEPTH = 15
const TILE_SIZE = 1
const TILE_PX = 32
const TILE_BORDER_PX = 1

function createFloorTextureDataUrl() {
  const cols = SCENE_WIDTH / TILE_SIZE
  const rows = SCENE_DEPTH / TILE_SIZE
  const canvas = document.createElement('canvas')
  canvas.width = cols * TILE_PX
  canvas.height = rows * TILE_PX
  const ctx = canvas.getContext('2d')!
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const x = col * TILE_PX
      const y = row * TILE_PX
      ctx.fillStyle = '#000000'
      ctx.fillRect(x, y, TILE_PX, TILE_PX)
      ctx.fillStyle = '#333333'
      ctx.fillRect(
        x + TILE_BORDER_PX,
        y + TILE_BORDER_PX,
        TILE_PX - TILE_BORDER_PX * 2,
        TILE_PX - TILE_BORDER_PX * 2,
      )
    }
  }
  return canvas.toDataURL('image/png')
}

const FLOOR_TEXTURE_URL = createFloorTextureDataUrl()

function DanceFloor() {
  const map = useTexture(FLOOR_TEXTURE_URL)
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
      <planeGeometry args={[SCENE_WIDTH, SCENE_DEPTH]} />
      <meshBasicMaterial map={map} />
    </mesh>
  )
}

export function SceneCanvas({ children }: SceneCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 14, 22], fov: 45 }}
      style={{ background: '#0a0a0a' }}
    >
      <DanceFloor />
      <OrbitControls target={[0, 0, 0]} maxPolarAngle={Math.PI / 2.1} />
      {children}
    </Canvas>
  )
}
