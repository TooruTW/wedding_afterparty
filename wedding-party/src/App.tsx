import { BeanPerson } from './components/BeanPerson'
import { SceneCanvas } from './components/SceneCanvas'
import { DEFAULT_BODY } from './types/body'

function App() {
  return (
    <div className="app">
      <SceneCanvas>
        <BeanPerson body={DEFAULT_BODY} position={[-4, 0, 0]} walkStyle="normal" />
        <BeanPerson body={DEFAULT_BODY} position={[-2, 0, 0]} pose="chat" />
        <BeanPerson body={DEFAULT_BODY} position={[0, 0, 0]} pose="sit" />
        <BeanPerson body={DEFAULT_BODY} position={[2, 0, 0]} walkStyle="frenzy" />
        <BeanPerson body={DEFAULT_BODY} position={[4, 0, 0]} walkStyle="frenzy" />
      </SceneCanvas>
    </div>
  )
}

export default App
