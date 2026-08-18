import { memo, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { BaseEdge, EdgeLabelRenderer, useInternalNode, type EdgeProps } from '@xyflow/react'
import { motion } from 'motion/react'
import type { AppEdge } from '../types'
import { elbowWaypoints, pointAtPathMidpoint, rectIntersection, roundedPolylinePath, type Box } from '../lib/geometry'
import { useCanvas } from '../store/CanvasContext'

const CORNER_RADIUS = 12

function FloatingEdge({ id, source, target, data, selected }: EdgeProps<AppEdge>) {
  const canvas = useCanvas()
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)

  const label = data?.label ?? null
  const isEditing = canvas.editingEdgeId === id
  const [draft, setDraft] = useState(label ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      setDraft(label ?? '')
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }, [isEditing, label])

  if (!sourceNode || !targetNode) return null

  const sourceBox: Box = {
    x: sourceNode.internals.positionAbsolute.x,
    y: sourceNode.internals.positionAbsolute.y,
    width: sourceNode.measured.width ?? 0,
    height: sourceNode.measured.height ?? 0,
  }
  const targetBox: Box = {
    x: targetNode.internals.positionAbsolute.x,
    y: targetNode.internals.positionAbsolute.y,
    width: targetNode.measured.width ?? 0,
    height: targetNode.measured.height ?? 0,
  }

  const sourceCenter = { x: sourceBox.x + sourceBox.width / 2, y: sourceBox.y + sourceBox.height / 2 }
  const targetCenter = { x: targetBox.x + targetBox.width / 2, y: targetBox.y + targetBox.height / 2 }

  const from = rectIntersection(sourceBox, targetCenter)
  const to = rectIntersection(targetBox, sourceCenter)

  const waypoints = elbowWaypoints(from.point, from.position, to.point, to.position)
  const path = roundedPolylinePath(waypoints, CORNER_RADIUS)
  const { x: labelX, y: labelY } = pointAtPathMidpoint(waypoints)

  const commit = () => canvas.commitEdgeLabel(id, draft)

  const openEditing = (event: MouseEvent) => {
    if (isEditing) return
    event.stopPropagation()
    canvas.setEditingEdgeId(id)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commit()
    }
    if (event.key === 'Escape') {
      // Stop this from also reaching React Flow's own global Escape
      // handler, which deselects everything — we only want to leave
      // label-edit mode, keeping the edge selected so Delete still works.
      event.stopPropagation()
      canvas.setEditingEdgeId(null)
    }
  }

  return (
    <>
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
        <BaseEdge
          id={id}
          path={path}
          markerEnd={label ? 'url(#mycelium-arrow-solid)' : 'url(#mycelium-arrow-dashed)'}
          style={{
            stroke: label ? '#CDE3D8' : '#7E948B',
            strokeWidth: label ? 1.4 : 1.3,
            strokeOpacity: selected ? 1 : label ? 0.8 : 0.5,
            strokeDasharray: label ? undefined : '5 6',
            transition: 'stroke 200ms ease, stroke-opacity 200ms ease, stroke-dasharray 200ms ease',
          }}
        />
      </motion.g>
      <EdgeLabelRenderer>
        <div
          onClick={openEditing}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {isEditing ? (
            <input
              ref={inputRef}
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commit}
              onKeyDown={handleKeyDown}
              onClick={(event) => event.stopPropagation()}
              style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: '#DCEBE3' }}
              className="min-w-[70px] border border-[#7FE3C4]/50 bg-[#0E1512]/90 px-2 py-1 text-center text-[13px] outline-none"
            />
          ) : label ? (
            <motion.div
              key="labeled"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 480, damping: 20 }}
              className="relative cursor-text whitespace-nowrap px-6 py-2"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-[-10px]"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(14,21,18,.97) 0%, rgba(14,21,18,.92) 45%, rgba(14,21,18,.55) 72%, rgba(14,21,18,0) 100%)',
                  filter: 'blur(4px)',
                }}
              />
              <span
                className="relative"
                style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: '#DCEBE3', fontSize: 13 }}
              >
                {label}
              </span>
            </motion.div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(FloatingEdge)
