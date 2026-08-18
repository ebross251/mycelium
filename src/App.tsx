import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import Canvas from './components/Canvas'
import { CanvasProvider } from './store/CanvasContext'

export default function App() {
  return (
    <ReactFlowProvider>
      <CanvasProvider>
        <Canvas />
      </CanvasProvider>
    </ReactFlowProvider>
  )
}
