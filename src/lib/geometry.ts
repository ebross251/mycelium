import { Position } from '@xyflow/react'

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export interface Point {
  x: number
  y: number
}

export function boxCenter(box: Box): Point {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

/**
 * Intersection of the ray from `box`'s center toward `toward` with `box`'s
 * rectangular boundary. Also reports which side of the box was hit, so a
 * floating edge can pick sourcePosition/targetPosition for getSmoothStepPath.
 */
export function rectIntersection(box: Box, toward: Point): { point: Point; position: Position } {
  const center = boxCenter(box)
  const dx = toward.x - center.x
  const dy = toward.y - center.y

  if (dx === 0 && dy === 0) {
    return { point: center, position: Position.Right }
  }

  const halfW = Math.max(box.width / 2, 1)
  const halfH = Math.max(box.height / 2, 1)

  const scale = 1 / Math.max(Math.abs(dx) / halfW, Math.abs(dy) / halfH)
  const point = { x: center.x + dx * scale, y: center.y + dy * scale }

  const position =
    Math.abs(dx) / halfW > Math.abs(dy) / halfH
      ? dx > 0
        ? Position.Right
        : Position.Left
      : dy > 0
        ? Position.Bottom
        : Position.Top

  return { point, position }
}

function isHorizontal(position: Position): boolean {
  return position === Position.Left || position === Position.Right
}

/**
 * Waypoints for an orthogonal elbow route between a floating source anchor
 * and target anchor. One bend when the anchors exit on perpendicular sides
 * (the common diagonal case); two bends — a Z — when they exit on the same
 * axis but aren't aligned on it.
 */
export function elbowWaypoints(from: Point, fromPosition: Position, to: Point, toPosition: Position): Point[] {
  const fromHorizontal = isHorizontal(fromPosition)
  const toHorizontal = isHorizontal(toPosition)

  if (fromHorizontal !== toHorizontal) {
    const bend = fromHorizontal ? { x: to.x, y: from.y } : { x: from.x, y: to.y }
    return [from, bend, to]
  }

  if (fromHorizontal) {
    const midX = (from.x + to.x) / 2
    return [from, { x: midX, y: from.y }, { x: midX, y: to.y }, to]
  }

  const midY = (from.y + to.y) / 2
  return [from, { x: from.x, y: midY }, { x: to.x, y: midY }, to]
}

/**
 * Renders a polyline as an SVG path with every interior corner rounded off
 * via a quadratic curve — straight segments with rounded pivots, Mycelium's
 * signature edge shape. `radius` is clamped per-corner so it never exceeds
 * half of either adjoining segment (avoids overshoot on short segments).
 */
export function roundedPolylinePath(points: Point[], radius: number): string {
  if (points.length < 2) return ''
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  }

  let d = `M ${points[0].x} ${points[0].y}`

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]

    const inLen = Math.hypot(curr.x - prev.x, curr.y - prev.y)
    const outLen = Math.hypot(next.x - curr.x, next.y - curr.y)
    const r = Math.min(radius, inLen / 2, outLen / 2)

    const inRatio = inLen === 0 ? 0 : r / inLen
    const outRatio = outLen === 0 ? 0 : r / outLen

    const a = { x: curr.x - (curr.x - prev.x) * inRatio, y: curr.y - (curr.y - prev.y) * inRatio }
    const c = { x: curr.x + (next.x - curr.x) * outRatio, y: curr.y + (next.y - curr.y) * outRatio }

    d += ` L ${a.x} ${a.y} Q ${curr.x} ${curr.y} ${c.x} ${c.y}`
  }

  const last = points[points.length - 1]
  d += ` L ${last.x} ${last.y}`
  return d
}

/** The point at half the total length of a polyline — used to place an edge label. */
export function pointAtPathMidpoint(points: Point[]): Point {
  const segments: number[] = []
  let total = 0
  for (let i = 0; i < points.length - 1; i++) {
    const len = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y)
    segments.push(len)
    total += len
  }

  let remaining = total / 2
  for (let i = 0; i < segments.length; i++) {
    if (remaining <= segments[i]) {
      const t = segments[i] === 0 ? 0 : remaining / segments[i]
      const p0 = points[i]
      const p1 = points[i + 1]
      return { x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t }
    }
    remaining -= segments[i]
  }

  return points[points.length - 1]
}
