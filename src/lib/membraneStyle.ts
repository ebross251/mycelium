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

// A subtle preview of the selected treatment — same rim-brightening logic,
// about a third of the way there, so hover reads as "about to be selected"
// rather than a distinct third material.
export const membraneHoverStyle: CSSProperties = {
  borderRadius: 3,
  background: 'rgba(245, 233, 210, 0.57)',
  border: '1px solid rgba(160, 220, 200, 0.78)',
  boxShadow: [
    '0 0 20px 2px rgba(127, 227, 196, 0.08)',
    '0 0 4px 1px rgba(180, 230, 215, 0.2)',
    'inset 0 0 4px 1px rgba(180, 230, 215, 0.2)',
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

// Chrome (toolbar) buttons use the same membrane material at reduced
// intensity — fill 40%, no outer bloom, crisp rim only — so persistent
// controls sit quieter on the field than actual map content.
export const chromeMembraneStyle: CSSProperties = {
  background: 'rgba(245, 233, 210, 0.40)',
  border: '1px solid rgba(248, 237, 216, 0.70)',
}
