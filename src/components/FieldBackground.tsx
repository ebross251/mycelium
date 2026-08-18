import { useMemo } from 'react'
import { useViewport } from '@xyflow/react'

// A tiled feTurbulence data URI — grain that reads through the translucent
// node membranes above it. Generated once; the pattern itself never changes.
const GRAIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" result="t"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#n)"/>
</svg>`
const GRAIN_URL = `url("data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}")`

/**
 * The field: dark gradient ground plus a grain overlay, sitting behind the
 * node/edge layer (same z-index: -1 treatment React Flow's own <Background>
 * uses, so it's unaffected by DOM order). Nothing here is drawn per-pan —
 * instead the whole layer is oversized and translated at ~0.3x the node
 * layer's pan offset, the one place in this spec where something moves.
 */
export default function FieldBackground() {
  const { x, y } = useViewport()

  const layerStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      inset: '-60%',
      background: [
        'radial-gradient(1100px 520px at 22% -12%, #1D2E27 0%, rgba(29,46,39,0) 62%)',
        'radial-gradient(760px 460px at 88% 108%, #14231E 0%, rgba(20,35,30,0) 60%)',
        'var(--field)',
      ].join(', '),
    }),
    [],
  )

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          ...layerStyle,
          transform: `translate3d(${x * 0.3}px, ${y * 0.3}px, 0)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: GRAIN_URL,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
            opacity: 0.24,
            mixBlendMode: 'overlay',
          }}
        />
      </div>
    </div>
  )
}
