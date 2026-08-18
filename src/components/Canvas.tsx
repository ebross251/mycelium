import { useCallback, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { ReactFlow, useReactFlow } from '@xyflow/react'
import { AnimatePresence, motion } from 'motion/react'
import ConceptNode from './ConceptNode'
import FloatingEdge from './FloatingEdge'
import ConnectionOverlay from './ConnectionOverlay'
import FieldBackground from './FieldBackground'
import SearchBar from './SearchBar'
import TermPanel from './TermPanel'
import EmptyState from './EmptyState'
import ViewportChrome from './ViewportChrome'
import { useCanvas } from '../store/CanvasContext'
import type { AppEdge } from '../types'

const nodeTypes = { concept: ConceptNode }
const edgeTypes = { floating: FloatingEdge }

function EdgeMarkerDefs() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden>
      <defs>
        <marker
          id="mycelium-arrow-dashed"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#7E948B" fillOpacity={0.5} />
        </marker>
        <marker
          id="mycelium-arrow-solid"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#CDE3D8" fillOpacity={0.8} />
        </marker>
      </defs>
    </svg>
  )
}

export default function Canvas() {
  const canvas = useCanvas()
  const instance = useReactFlow()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [terms, setTerms] = useState<string[]>([])
  const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set())
  const [panelOpen, setPanelOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const viewportCenter = useCallback(() => {
    const bounds = document.querySelector('.react-flow')?.getBoundingClientRect()
    const centerScreen = bounds
      ? { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    return instance.screenToFlowPosition(centerScreen)
  }, [instance])

  const handleGenerate = useCallback(async (query: string) => {
    setLoading(true)
    setPanelOpen(true)
    setSelectedTerms(new Set())
    try {
      const res = await fetch('/api/generate-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const json = await res.json()
      setTerms(Array.isArray(json.terms) ? json.terms : [])
    } catch {
      setTerms([])
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleTerm = (term: string) => {
    setSelectedTerms((prev) => {
      const next = new Set(prev)
      if (next.has(term)) next.delete(term)
      else next.add(term)
      return next
    })
  }

  const commitTerms = () => {
    canvas.addTermNodes(Array.from(selectedTerms), viewportCenter())
    setTerms((prev) => prev.filter((t) => !selectedTerms.has(t)))
    setSelectedTerms(new Set())
  }

  const handlePaneClick = (event: ReactMouseEvent) => {
    if (canvas.connecting) {
      const position = instance.screenToFlowPosition({ x: event.clientX, y: event.clientY })
      canvas.completeConnectingToNewNode(position)
      return
    }
    canvas.cancelConnecting()
  }

  const handleDoubleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (!target.classList.contains('react-flow__pane')) return
    const position = instance.screenToFlowPosition({ x: event.clientX, y: event.clientY })
    canvas.createNodeAt(position)
  }

  const handleEdgeClick = (_event: ReactMouseEvent, edge: AppEdge) => {
    if (canvas.connecting) return
    canvas.setEditingEdgeId(edge.id)
  }

  const hasNodes = canvas.nodes.length > 0

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: 'var(--field)' }}>
      <ReactFlow
        nodes={canvas.nodes}
        edges={canvas.edges}
        onNodesChange={canvas.onNodesChange}
        onEdgesChange={canvas.onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onPaneClick={handlePaneClick}
        onDoubleClick={handleDoubleClick}
        onEdgeClick={handleEdgeClick}
        deleteKeyCode={['Backspace', 'Delete']}
        zoomOnDoubleClick={false}
        panOnDrag={hasNodes}
        colorMode="dark"
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <FieldBackground />
        <EdgeMarkerDefs />
        <ConnectionOverlay />
      </ReactFlow>

      <AnimatePresence>
        {hasNodes && (
          <motion.div
            key="viewport-chrome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <ViewportChrome onAddConcept={() => canvas.createNodeAt(viewportCenter())} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!hasNodes && (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <EmptyState
              onPlaceConcept={() => canvas.createNodeAt(viewportCenter())}
              onGenerateInstead={() => searchInputRef.current?.focus()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col">
        <SearchBar onSubmit={handleGenerate} loading={loading} inputRef={searchInputRef} />
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              key="term-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <TermPanel
                loading={loading}
                terms={terms}
                selected={selectedTerms}
                onToggle={toggleTerm}
                onCommit={commitTerms}
                onDismiss={() => setPanelOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
