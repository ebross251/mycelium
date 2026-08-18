interface MeasureOptions {
  minWidth: number
  maxWidth: number
  fontFamily: string
  fontSize: number
  paddingX: number
  paddingY: number
  borderWidth: number
}

let mirror: HTMLDivElement | null = null

function getMirror(): HTMLDivElement {
  if (mirror) return mirror
  mirror = document.createElement('div')
  Object.assign(mirror.style, {
    position: 'fixed',
    top: '-9999px',
    left: '-9999px',
    visibility: 'hidden',
    pointerEvents: 'none',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    boxSizing: 'border-box',
    display: 'inline-block',
    width: 'fit-content',
  } satisfies Partial<CSSStyleDeclaration>)
  document.body.appendChild(mirror)
  return mirror
}

/**
 * Measures the natural rendered width some text would take at a given
 * font/padding/border, wrapped and capped exactly like the real element —
 * a single shared off-screen mirror node, reused across calls, so a node
 * with an animated (rather than CSS `fit-content`) width has a real number
 * to tween toward.
 */
export function measureNaturalWidth(text: string, options: MeasureOptions): number {
  const el = getMirror()
  el.style.fontFamily = options.fontFamily
  el.style.fontSize = `${options.fontSize}px`
  el.style.padding = `${options.paddingY}px ${options.paddingX}px`
  el.style.border = `${options.borderWidth}px solid transparent`
  el.style.maxWidth = `${options.maxWidth}px`
  el.textContent = text
  const natural = el.getBoundingClientRect().width
  return Math.min(Math.max(natural, options.minWidth), options.maxWidth)
}
