import { BeanPerson } from './components/BeanPerson'
import { SceneCanvas } from './components/SceneCanvas'
import { DEFAULT_BODY } from './types/body'

function App() {
  return (
    <div className="app">
      <SceneCanvas>
        <BeanPerson body={DEFAULT_BODY} position={[-4, 0, 0]} pose="listen" rotationY={Math.PI / 2} />
        <BeanPerson body={DEFAULT_BODY} position={[-2, 0, 0]} pose="chat" rotationY={-Math.PI / 2} />
        <BeanPerson body={DEFAULT_BODY} position={[0, 0, 0]} pose="sit" />
        <BeanPerson body={DEFAULT_BODY} position={[2, 0, 0]} walkStyle="normal" />
        <BeanPerson body={DEFAULT_BODY} position={[4, 0, 0]} walkStyle="frenzy" />
      </SceneCanvas>
    </div>
  )
}

export default App
