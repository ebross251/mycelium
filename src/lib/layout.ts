export interface XY {
  x: number
  y: number
}

/**
 * Positions `count` items in a compact grid centered on `center`, with a
 * small jitter so a freshly committed batch reads as "clustered" rather than
 * a rigid table. Jitter is capped well under half the spacing so items never
 * overlap.
 */
export function clusterPositions(count: number, center: XY, spacing: XY = { x: 190, y: 90 }): XY[] {
  if (count <= 0) return []

  const cols = Math.max(1, Math.ceil(Math.sqrt(count)))
  const rows = Math.ceil(count / cols)
  const maxJitter = Math.min(spacing.x, spacing.y) * 0.2

  const positions: XY[] = []
  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const offsetX = (col - (cols - 1) / 2) * spacing.x
    const offsetY = (row - (rows - 1) / 2) * spacing.y

    positions.push({
      x: center.x + offsetX + (Math.random() - 0.5) * maxJitter,
      y: center.y + offsetY + (Math.random() - 0.5) * maxJitter,
    })
  }

  return positions
}
