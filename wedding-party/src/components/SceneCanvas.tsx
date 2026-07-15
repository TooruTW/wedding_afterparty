import { OrbitControls, useTexture } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect, useLayoutEffect, type ReactNode } from 'react'
import { NearestFilter } from 'three'
import {
  FLOOR_CANVAS_GRID,
  FLOOR_GRID,
  FLOOR_MODES,
  makePixelGrassDataUrl,
  type FloorModeId,
} from './floorModes'
import { Starfield } from './Starfield'
import { DaySun } from './DaySun'
import { DEFAULT_VENUE, VENUE_THEMES, type VenueThemeId } from './venueThemes'

type SceneCanvasProps = {
  children?: ReactNode
  venue?: VenueThemeId
}

function createFloorCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = FLOOR_CANVAS_GRID.cols * FLOOR_CANVAS_GRID.tilePx
  canvas.height = FLOOR_CANVAS_GRID.rows * FLOOR_CANVAS_GRID.tilePx
  return canvas
}

const floorCanvas = createFloorCanvas()
const FLOOR_TEXTURE_URL = floorCanvas.toDataURL('image/png')
/** 1 world unit／格（約豆人大小）；400 場對應 400×400 格 */
const PIXEL_GRASS_URL = makePixelGrassDataUrl(400, 400, 2)

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
    if (mode.intervalMs === null) return
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

function HorizonGround({ size, color }: { size: number; color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

/** 大片像素草地：斑塊布滿遠景，不限舞池 */
function PixelGrassField({ size }: { size: number }) {
  const map = useTexture(PIXEL_GRASS_URL)
  useLayoutEffect(() => {
    map.magFilter = map.minFilter = NearestFilter
    map.generateMipmaps = false
    map.needsUpdate = true
  }, [map])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={map} />
    </mesh>
  )
}

export function SceneCanvas({
  children,
  venue = DEFAULT_VENUE,
}: SceneCanvasProps) {
  const theme = VENUE_THEMES[venue]
  const wideGrass =
    theme.floorMode === 'pixelGrass' && theme.horizonGround.enabled

  return (
    <Canvas
      camera={{ position: [0, 14, 22], fov: 45 }}
      style={{ background: theme.canvasBackground }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 12, 4]} intensity={1.1} />
      {theme.starfield.enabled ? <Starfield config={theme.starfield} /> : null}
      {theme.sun.enabled ? (
        <DaySun
          position={theme.sun.position}
          color={theme.sun.color}
          radius={theme.sun.radius}
        />
      ) : null}
      {wideGrass ? (
        <PixelGrassField size={theme.horizonGround.size} />
      ) : (
        <>
          {theme.horizonGround.enabled ? (
            <HorizonGround size={theme.horizonGround.size} color={theme.horizonGround.color} />
          ) : null}
          <DanceFloor modeId={theme.floorMode} />
        </>
      )}
      <OrbitControls target={[0, 0, 0]} maxPolarAngle={Math.PI / 2.1} />
      {children}
    </Canvas>
  )
}
