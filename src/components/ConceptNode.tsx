import { memo, useEffect, useRef, useState, type MouseEvent } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { motion } from 'motion/react'
import type { AppNode } from '../types'
import { useCanvas } from '../store/CanvasContext'
import { membraneStyle, membraneSelectedStyle } from '../lib/membraneStyle'

// React Flow needs a registered Handle per direction to resolve edge
// endpoints internally, even though the visible anchor is computed by
// FloatingEdge's own geometry. These stay invisible and non-interactive —
// connections are started only through the affordance button below.
const hiddenHandleStyle = {
  opacity: 0,
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  transform: 'none',
  borderRadius: 0,
  border: 'none',
  pointerEvents: 'none' as const,
}

function ConceptNode({ id, data, selected }: NodeProps<AppNode>) {
  const canvas = useCanvas()
  const isEditing = canvas.editingNodeId === id
  const isConnectingSource = canvas.connecting?.sourceId === id

  const [draft, setDraft] = useState(data.text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      setDraft(data.text)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }, [isEditing, data.text])

  const commit = () => canvas.commitNodeText(id, draft)

  const handleClick = (event: MouseEvent) => {
    if (canvas.connecting) {
      event.stopPropagation()
      canvas.completeConnecting(id)
      return
    }
    if (selected && !isEditing) {
      event.stopPropagation()
      canvas.setEditingNodeId(id)
    }
  }

  const handleAffordanceClick = (event: MouseEvent) => {
    event.stopPropagation()
    if (isConnectingSource) {
      canvas.cancelConnecting()
    } else {
      canvas.startConnecting(id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onClick={handleClick}
      style={{
        ...(selected ? membraneSelectedStyle : membraneStyle),
        fontFamily: 'var(--serif)',
        color: 'var(--ink)',
        width: 'fit-content',
        maxWidth: 320,
        transition: 'background 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
      }}
      className={`relative select-none px-5 py-3.5 text-center text-[15px] leading-snug ${
        canvas.connecting && !isConnectingSource ? 'cursor-pointer' : ''
      }`}
    >
      <Handle type="source" position={Position.Top} isConnectable={false} style={hiddenHandleStyle} />
      <Handle type="target" position={Position.Top} isConnectable={false} style={hiddenHandleStyle} />
      {isEditing ? (
        <input
          ref={inputRef}
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit()
            }
            if (event.key === 'Escape') {
              event.stopPropagation()
              setDraft(data.text)
              canvas.setEditingNodeId(null)
            }
          }}
          style={{ fontFamily: 'inherit', color: 'inherit', fontSize: 'inherit' }}
          className="nodrag w-full min-w-[4ch] border-none bg-transparent p-0 text-center outline-none"
        />
      ) : (
        <span className="block whitespace-pre-wrap break-words">{data.text}</span>
      )}

      {selected && !isEditing && (
        <button
          type="button"
          onClick={handleAffordanceClick}
          aria-label="Connect this node to another"
          style={
            isConnectingSource
              ? { background: 'var(--live)', borderColor: 'var(--live)', color: 'var(--ink)' }
              : { background: 'var(--field)', borderColor: 'var(--chrome-dim)', color: 'var(--chrome)' }
          }
          className="nodrag absolute -bottom-[8px] left-1/2 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border transition-colors duration-150 hover:!border-[var(--live)] hover:!text-[var(--live)]"
        >
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M5 1v8M1 5h8" />
          </svg>
        </button>
      )}
    </motion.div>
  )
}

export default memo(ConceptNode)
