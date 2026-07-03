import { BeanPerson } from './components/BeanPerson'
import { SceneCanvas } from './components/SceneCanvas'
import { DEFAULT_BODY } from './types/body'

function App() {
  return (
    <div className="app">
      <SceneCanvas>
        <BeanPerson body={DEFAULT_BODY} />
      </SceneCanvas>
    </div>
  )
}

export default App
