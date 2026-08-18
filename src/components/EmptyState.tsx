import { membraneStyle } from '../lib/membraneStyle'

interface EmptyStateProps {
  onPlaceConcept: () => void
  onGenerateInstead: () => void
}

/**
 * Typographic only — type, spacing, and the field's own atmosphere carry it.
 * The primary action places a concept directly (same membrane material as a
 * node, previewing what you're about to make); AI generation is a quieter
 * link beneath it.
 */
export default function EmptyState({ onPlaceConcept, onGenerateInstead }: EmptyStateProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="pointer-events-auto flex flex-col items-center gap-5 text-center">
        <p
          style={{ fontFamily: 'var(--serif)', color: 'var(--chrome)' }}
          className="text-[17px] italic"
        >
          A concept map is a sentence waiting to happen.
        </p>

        <button
          type="button"
          onClick={onPlaceConcept}
          style={{
            ...membraneStyle,
            fontFamily: 'var(--serif)',
            color: 'var(--ink)',
          }}
          className="px-5 py-3.5 text-[15px]"
        >
          + Place a concept
        </button>

        <button
          type="button"
          onClick={onGenerateInstead}
          style={{ fontFamily: 'var(--sans)', color: 'var(--live)' }}
          className="text-[13px] opacity-90 hover:opacity-100"
        >
          or generate terms from a subject
        </button>
      </div>
    </div>
  )
}
