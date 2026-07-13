import { ZoneActor } from './components/ZoneActor'
import { SceneCanvas } from './components/SceneCanvas'
import { DEFAULT_BODY } from './types/body'
import { WANDER_SPAWN_GRIDS, ZONE_SLOTS } from './zones/zones'

const DEMO_ACTORS = [
  ...ZONE_SLOTS.map((slot) => ({
    config: { kind: 'slot' as const, zoneId: slot.zoneId, slotId: slot.id },
  })),
  ...WANDER_SPAWN_GRIDS.map((spawnGrid) => ({
    config: {
      kind: 'wander' as const,
      walkStyle: 'frenzy' as const,
      spawnGrid,
    },
  })),
]

function App() {
  return (
    <div className="app">
      <SceneCanvas floorMode="zoneSplit">
        {DEMO_ACTORS.map((actor, index) => (
          <ZoneActor key={index} body={DEFAULT_BODY} config={actor.config} />
        ))}
      </SceneCanvas>
    </div>
  )
}

export default App
