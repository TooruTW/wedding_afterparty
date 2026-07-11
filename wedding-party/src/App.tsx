import { ZoneActor } from './components/ZoneActor'
import { SceneCanvas } from './components/SceneCanvas'
import { DEFAULT_BODY } from './types/body'
import { WANDER_SPAWN_GRIDS } from './zones/zones'

const DEMO_ACTORS = [
  { config: { kind: 'slot' as const, zoneId: 'chat' as const, slotId: 'chat-a' } },
  { config: { kind: 'slot' as const, zoneId: 'chat' as const, slotId: 'chat-b' } },
  { config: { kind: 'slot' as const, zoneId: 'sit' as const, slotId: 'sit-a' } },
  { config: { kind: 'slot' as const, zoneId: 'sit' as const, slotId: 'sit-b' } },
  { config: { kind: 'wander' as const, walkStyle: 'normal' as const, spawnGrid: WANDER_SPAWN_GRIDS[0] } },
  { config: { kind: 'wander' as const, walkStyle: 'frenzy' as const, spawnGrid: WANDER_SPAWN_GRIDS[1] } },
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
