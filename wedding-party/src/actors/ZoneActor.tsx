import { useFrame } from '@react-three/fiber'
import { useState } from 'react'
import type { Body } from '../types/body'
import { useZoneBehavior, type ZoneBehaviorConfig } from '../scene/zones/useZoneBehavior'
import { BeanPerson } from '../body/BeanPerson'

type ZoneActorProps = {
  body: Body
  name: string
  say?: string
  config: ZoneBehaviorConfig
}

export function ZoneActor({ body, name, say, config }: ZoneActorProps) {
  const { init, tick } = useZoneBehavior(config)
  const [frame, setFrame] = useState(init)

  useFrame((_, delta) => {
    setFrame(tick(delta))
  })

  return (
    <BeanPerson
      body={body}
      name={name}
      say={say}
      position={frame.position}
      rotationY={frame.rotationY}
      pose={frame.pose}
      walkStyle={frame.walkStyle}
    />
  )
}
