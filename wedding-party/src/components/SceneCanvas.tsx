import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { ReactNode } from 'react'

type SceneCanvasProps = {
  children?: ReactNode
}

export function SceneCanvas({ children }: SceneCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 2.2, 7], fov: 50 }}
      style={{ background: '#0a0a0a' }}
    >
      <gridHelper args={[12, 24, '#333', '#222']} />
      <OrbitControls />
      {children}
    </Canvas>
  )
}
