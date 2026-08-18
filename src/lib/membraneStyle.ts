import type { CSSProperties } from 'react'

// Three stacked passes approximating the visual spec's SVG rim-lit membrane
// using box-shadow (never backdrop-filter — nothing behind gets smeared,
// this is a lit panel, not glass). Shared by node surfaces and anything that
// should read as "the same material as a node" (the empty-state CTA).
export const membraneStyle: CSSProperties = {
  borderRadius: 3,
  background: 'rgba(245, 233, 210, 0.55)',
  border: '1px solid rgba(248, 237, 216, 0.70)',
  boxShadow: [
    '0 0 20px 2px rgba(127, 227, 196, 0.06)', // outer bloom
    '0 0 4px 1px rgba(248, 237, 216, 0.15)', // rim bleed, outward half
    'inset 0 0 4px 1px rgba(248, 237, 216, 0.15)', // rim bleed, inward half
  ].join(', '),
}

export const membraneSelectedStyle: CSSProperties = {
  borderRadius: 3,
  background: 'rgba(245, 233, 210, 0.62)',
  border: '1px solid rgba(127, 227, 196, 0.85)',
  boxShadow: [
    '0 0 24px 3px rgba(127, 227, 196, 0.12)',
    '0 0 4px 1px rgba(127, 227, 196, 0.35)',
    'inset 0 0 4px 1px rgba(127, 227, 196, 0.35)',
  ].join(', '),
}
