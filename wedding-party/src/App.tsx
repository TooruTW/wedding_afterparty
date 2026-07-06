import { BeanPerson } from './components/BeanPerson'
import { SceneCanvas } from './components/SceneCanvas'
import { DEFAULT_BODY } from './types/body'

function App() {
  return (
    <div className="app">
      <SceneCanvas>
        <BeanPerson body={DEFAULT_BODY} position={[-4, 0, 0]} walkSpeed={4} walkStyle="normal" />
        <BeanPerson body={DEFAULT_BODY} position={[-2, 0, 0]} walkSpeed={5} walkStyle="normal" />
        <BeanPerson body={DEFAULT_BODY} position={[0, 0, 0]} pose="sit" />
        <BeanPerson body={DEFAULT_BODY} position={[2, 0, 0]} walkSpeed={7} walkStyle="frenzy" />
        <BeanPerson body={DEFAULT_BODY} position={[4, 0, 0]} walkSpeed={9} walkStyle="frenzy" />
      </SceneCanvas>
    </div>
  )
}

export default App
