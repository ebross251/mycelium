import { useState, type CSSProperties, type ReactNode } from 'react'
import { useReactFlow } from '@xyflow/react'
import { chromeMembraneStyle } from '../lib/membraneStyle'

interface ChromeButtonProps {
  onClick: () => void
  label: string
  children: ReactNode
  divider?: boolean
  rounded?: 'top' | 'bottom' | 'all'
}

function ChromeButton({ onClick, label, children, divider, rounded = 'all' }: ChromeButtonProps) {
  const [hovered, setHovered] = useState(false)

  const radius =
    rounded === 'top'
      ? { borderTopLeftRadius: 7, borderTopRightRadius: 7 }
      : rounded === 'bottom'
        ? { borderBottomLeftRadius: 7, borderBottomRightRadius: 7 }
        : { borderRadius: 7 }

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={label}
      title={label}
      style={{
        width: 44,
        height: 44,
        color: hovered ? 'var(--live)' : 'var(--chrome)',
        borderTop: divider ? '1px solid rgba(248, 237, 216, 0.20)' : 'none',
        ...radius,
        transition: 'color 150ms ease',
      }}
      className="flex shrink-0 items-center justify-center"
    >
      {children}
    </button>
  )
}

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function ZoomInIcon() {
  return (
    <svg viewBox="0 0 20 20" width={19} height={19} {...strokeProps}>
      <path d="M10 4v12M4 10h12" />
    </svg>
  )
}

function ZoomOutIcon() {
  return (
    <svg viewBox="0 0 20 20" width={19} height={19} {...strokeProps}>
      <path d="M4 10h12" />
    </svg>
  )
}

function FitViewIcon() {
  return (
    <svg viewBox="0 0 20 20" width={19} height={19} {...strokeProps}>
      <path d="M3 7V3h4M17 7V3h-4M17 13v4h-4M3 13v4h4" />
    </svg>
  )
}

// Filled, deliberately heavier than the stroked zoom glyphs — the two "+"
// marks mean different things (add a concept vs. zoom in) and need more than
// proximity to tell apart.
function AddConceptIcon() {
  return (
    <svg viewBox="0 0 24 24" width={19} height={19} fill="currentColor">
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
    </svg>
  )
}

interface ViewportChromeProps {
  onAddConcept: () => void
}

/**
 * Persistent chrome beyond the search bar: an authoring cluster (add a
 * concept) stacked above the viewport cluster (zoom/fit), sharing one
 * membrane per cluster with hairline dividers between grouped buttons
 * rather than separate floating pills.
 */
export default function ViewportChrome({ onAddConcept }: ViewportChromeProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  const clusterStyle: CSSProperties = {
    ...chromeMembraneStyle,
    borderRadius: 8,
    overflow: 'hidden',
  }

  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 z-10 flex flex-col items-center gap-3">
      <div style={clusterStyle} className="flex flex-col">
        <ChromeButton onClick={onAddConcept} label="Add a concept">
          <AddConceptIcon />
        </ChromeButton>
      </div>

      <div style={clusterStyle} className="flex flex-col">
        <ChromeButton onClick={() => zoomIn()} label="Zoom in" rounded="top">
          <ZoomInIcon />
        </ChromeButton>
        <ChromeButton onClick={() => zoomOut()} label="Zoom out" divider>
          <ZoomOutIcon />
        </ChromeButton>
        <ChromeButton onClick={() => fitView()} label="Fit view" divider rounded="bottom">
          <FitViewIcon />
        </ChromeButton>
      </div>
    </div>
  )
}
