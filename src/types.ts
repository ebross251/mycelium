import type { Node, Edge } from '@xyflow/react'

export type ConceptNodeData = {
  text: string
}

export type ConceptEdgeData = {
  label: string | null
}

export type AppNode = Node<ConceptNodeData, 'concept'>
export type AppEdge = Edge<ConceptEdgeData, 'floating'>
