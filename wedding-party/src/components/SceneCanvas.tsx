import { OrbitControls, useTexture } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect, type ReactNode } from 'react'
import {
  DEFAULT_FLOOR_MODE,
  FLOOR_CANVAS_GRID,
  FLOOR_GRID,
  FLOOR_MODES,
  type FloorModeId,
} from './floorModes'

type SceneCanvasProps = {
  children?: ReactNode
  floorMode?: FloorModeId
}

function createFloorCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = FLOOR_CANVAS_GRID.cols * FLOOR_CANVAS_GRID.tilePx
  canvas.height = FLOOR_CANVAS_GRID.rows * FLOOR_CANVAS_GRID.tilePx
  return canvas
}

const floorCanvas = createFloorCanvas()
const FLOOR_TEXTURE_URL = floorCanvas.toDataURL('image/png')

function DanceFloor({ modeId }: { modeId: FloorModeId }) {
  const mode = FLOOR_MODES[modeId]
  const map = useTexture(FLOOR_TEXTURE_URL)

  useEffect(() => {
    const ctx = floorCanvas.getContext('2d')!
    let frame = 0
    map.image = floorCanvas

    const tick = () => {
      mode.paint(ctx, frame, FLOOR_CANVAS_GRID)
      map.needsUpdate = true
      frame += 1
    }

    tick()
    const id = setInterval(tick, mode.intervalMs)
    return () => clearInterval(id)
  }, [map, mode])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
      <planeGeometry args={[FLOOR_GRID.width, FLOOR_GRID.depth]} />
      <meshBasicMaterial map={map} />
    </mesh>
  )
}

export function SceneCanvas({
  children,
  floorMode = DEFAULT_FLOOR_MODE,
}: SceneCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 14, 22], fov: 45 }}
      style={{ background: '#0a0a0a' }}
    >
      <DanceFloor modeId={floorMode} />
      <OrbitControls target={[0, 0, 0]} maxPolarAngle={Math.PI / 2.1} />
      {children}
    </Canvas>
  )
}
