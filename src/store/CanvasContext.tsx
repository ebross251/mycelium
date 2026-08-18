import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNodesState, useEdgesState, useReactFlow, type XYPosition } from '@xyflow/react'
import type { AppEdge, AppNode } from '../types'
import { clusterPositions } from '../lib/layout'

export interface ConnectingState {
  sourceId: string
}

interface CanvasContextValue {
  nodes: AppNode[]
  edges: AppEdge[]
  onNodesChange: ReturnType<typeof useNodesState<AppNode>>[2]
  onEdgesChange: ReturnType<typeof useEdgesState<AppEdge>>[2]

  connecting: ConnectingState | null
  cursorFlow: XYPosition | null
  startConnecting: (sourceId: string) => void
  completeConnecting: (targetId: string) => void
  completeConnectingToNewNode: (position: XYPosition) => void
  cancelConnecting: () => void

  editingNodeId: string | null
  setEditingNodeId: (id: string | null) => void
  commitNodeText: (id: string, text: string) => void

  editingEdgeId: string | null
  setEditingEdgeId: (id: string | null) => void
  commitEdgeLabel: (id: string, label: string) => void

  createNodeAt: (position: XYPosition) => string
  addTermNodes: (terms: string[], center: XYPosition) => void
}

const CanvasContext = createContext<CanvasContextValue | null>(null)

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([])
  const { screenToFlowPosition } = useReactFlow()

  const [connecting, setConnecting] = useState<ConnectingState | null>(null)
  const [cursorFlow, setCursorFlow] = useState<XYPosition | null>(null)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null)

  const startConnecting = useCallback((sourceId: string) => {
    setConnecting({ sourceId })
    setCursorFlow(null)
  }, [])

  const cancelConnecting = useCallback(() => {
    setConnecting(null)
    setCursorFlow(null)
  }, [])

  const completeConnecting = useCallback(
    (targetId: string) => {
      setConnecting((current) => {
        if (!current) return current
        if (current.sourceId === targetId) return null

        const newEdge: AppEdge = {
          id: crypto.randomUUID(),
          source: current.sourceId,
          target: targetId,
          type: 'floating',
          data: { label: null },
        }
        setEdges((eds) => [...eds, newEdge])
        setEditingEdgeId(newEdge.id)
        return null
      })
      setCursorFlow(null)
    },
    [setEdges],
  )

  const completeConnectingToNewNode = useCallback(
    (position: XYPosition) => {
      setConnecting((current) => {
        if (!current) return current

        const newNodeId = crypto.randomUUID()
        const newNode: AppNode = {
          id: newNodeId,
          type: 'concept',
          position,
          data: { text: '' },
          selected: true,
        }
        const newEdge: AppEdge = {
          id: crypto.randomUUID(),
          source: current.sourceId,
          target: newNodeId,
          type: 'floating',
          data: { label: null },
        }
        setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), newNode])
        setEdges((eds) => [...eds, newEdge])
        setEditingNodeId(newNodeId)
        return null
      })
      setCursorFlow(null)
    },
    [setNodes, setEdges],
  )

  // Live cursor tracking + Escape-to-cancel while a connection is in progress.
  useEffect(() => {
    if (!connecting) return

    const handleMove = (event: PointerEvent) => {
      setCursorFlow(screenToFlowPosition({ x: event.clientX, y: event.clientY }))
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancelConnecting()
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('keydown', handleKey)
    }
  }, [connecting, screenToFlowPosition, cancelConnecting])

  const commitNodeText = useCallback(
    (id: string, text: string) => {
      const trimmed = text.trim()
      setNodes((nds) => {
        if (trimmed === '') {
          return nds.filter((n) => n.id !== id)
        }
        return nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, text: trimmed } } : n))
      })
      setEditingNodeId(null)
    },
    [setNodes],
  )

  const commitEdgeLabel = useCallback(
    (id: string, label: string) => {
      const trimmed = label.trim()
      setEdges((eds) =>
        eds.map((e) => (e.id === id ? { ...e, data: { label: trimmed === '' ? null : trimmed } } : e)),
      )
      setEditingEdgeId(null)
    },
    [setEdges],
  )

  const createNodeAt = useCallback(
    (position: XYPosition) => {
      const id = crypto.randomUUID()
      const newNode: AppNode = {
        id,
        type: 'concept',
        position,
        data: { text: '' },
        selected: true,
      }
      setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), newNode])
      setEditingNodeId(id)
      return id
    },
    [setNodes],
  )

  const addTermNodes = useCallback(
    (terms: string[], center: XYPosition) => {
      if (terms.length === 0) return
      const positions = clusterPositions(terms.length, center)
      const newNodes: AppNode[] = terms.map((text, i) => ({
        id: crypto.randomUUID(),
        type: 'concept',
        position: positions[i],
        data: { text },
        selected: false,
      }))
      setNodes((nds) => [...nds, ...newNodes])
    },
    [setNodes],
  )

  const value = useMemo<CanvasContextValue>(
    () => ({
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      connecting,
      cursorFlow,
      startConnecting,
      completeConnecting,
      completeConnectingToNewNode,
      cancelConnecting,
      editingNodeId,
      setEditingNodeId,
      commitNodeText,
      editingEdgeId,
      setEditingEdgeId,
      commitEdgeLabel,
      createNodeAt,
      addTermNodes,
    }),
    [
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      connecting,
      cursorFlow,
      startConnecting,
      completeConnecting,
      completeConnectingToNewNode,
      cancelConnecting,
      editingNodeId,
      commitNodeText,
      editingEdgeId,
      commitEdgeLabel,
      createNodeAt,
      addTermNodes,
    ],
  )

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
}

export function useCanvas() {
  const ctx = useContext(CanvasContext)
  if (!ctx) throw new Error('useCanvas must be used within a CanvasProvider')
  return ctx
}
