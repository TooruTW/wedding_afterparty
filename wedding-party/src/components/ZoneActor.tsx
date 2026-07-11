import { useFrame } from '@react-three/fiber'
import { useState } from 'react'
import type { Body } from '../types/body'
import { useZoneBehavior, type ZoneBehaviorConfig } from '../zones/useZoneBehavior'
import { BeanPerson } from './BeanPerson'

type ZoneActorProps = {
  body: Body
  config: ZoneBehaviorConfig
}

export function ZoneActor({ body, config }: ZoneActorProps) {
  const { init, tick } = useZoneBehavior(config)
  const [frame, setFrame] = useState(init)

  useFrame((_, delta) => {
    setFrame(tick(delta))
  })

  return (
    <BeanPerson
      body={body}
      position={frame.position}
      rotationY={frame.rotationY}
      pose={frame.pose}
      walkStyle={frame.walkStyle}
    />
  )
}
