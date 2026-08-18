import { useInternalNode, useViewport } from '@xyflow/react'
import { elbowWaypoints, rectIntersection, roundedPolylinePath, type Box } from '../lib/geometry'
import { useCanvas } from '../store/CanvasContext'

const CORNER_RADIUS = 12

/**
 * The live line that follows the cursor between the first and second click
 * of a connection. Rendered as its own SVG layered over the pane, transformed
 * to match the current viewport so flow coordinates line up with screen
 * coordinates.
 */
export default function ConnectionOverlay() {
  const canvas = useCanvas()
  const viewport = useViewport()
  const sourceNode = useInternalNode(canvas.connecting?.sourceId ?? '')

  if (!canvas.connecting || !canvas.cursorFlow || !sourceNode) return null

  const box: Box = {
    x: sourceNode.internals.positionAbsolute.x,
    y: sourceNode.internals.positionAbsolute.y,
    width: sourceNode.measured.width ?? 0,
    height: sourceNode.measured.height ?? 0,
  }

  const from = rectIntersection(box, canvas.cursorFlow)
  // Zero-size "box" at the cursor: rectIntersection degenerates to a pure
  // dominant-axis test, giving the side the incoming line should enter from —
  // the same math a real edge uses for its target anchor, just with a point.
  const cursorBox: Box = { x: canvas.cursorFlow.x, y: canvas.cursorFlow.y, width: 0, height: 0 }
  const to = rectIntersection(cursorBox, from.point)

  const waypoints = elbowWaypoints(from.point, from.position, canvas.cursorFlow, to.position)
  const path = roundedPolylinePath(waypoints, CORNER_RADIUS)

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'visible',
        pointerEvents: 'none',
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        transformOrigin: '0 0',
      }}
    >
      <path d={path} fill="none" stroke="#7FE3C4" strokeOpacity={0.8} strokeWidth={1.5} strokeDasharray="4 5" />
    </svg>
  )
}
