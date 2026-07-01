import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

function SpinningBox() {
  const ref = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.x += delta
    ref.current.rotation.y += delta * 0.7
  })

  return (
    <mesh ref={ref}>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
  )
}

function App() {
  return (
    <div className="app">
      <Canvas>
        <SpinningBox />
      </Canvas>
    </div>
  )
}

export default App
