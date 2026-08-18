interface TermPanelProps {
  loading: boolean
  terms: string[]
  selected: Set<string>
  onToggle: (term: string) => void
  onCommit: () => void
  onDismiss: () => void
}

export default function TermPanel({ loading, terms, selected, onToggle, onCommit, onDismiss }: TermPanelProps) {
  return (
    <div
      style={{
        background: 'rgba(22, 33, 29, 0.75)',
        border: '1px solid rgba(143, 163, 155, 0.18)',
        borderRadius: 4,
        fontFamily: 'var(--sans)',
      }}
      className="pointer-events-auto mt-1 w-72 p-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px]" style={{ color: 'var(--chrome-dim)' }}>
          {loading ? 'Generating terms…' : `${terms.length} terms — select to add`}
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[12px] hover:!text-[var(--chrome)]"
          style={{ color: 'var(--chrome-dim)' }}
        >
          Dismiss
        </button>
      </div>

      {!loading && terms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {terms.map((term) => {
            const isSelected = selected.has(term)
            return (
              <button
                key={term}
                type="button"
                onClick={() => onToggle(term)}
                style={
                  isSelected
                    ? { background: 'var(--lichen)', borderColor: 'var(--lichen)', color: 'var(--ink)' }
                    : { background: 'transparent', borderColor: 'rgba(143, 163, 155, 0.3)', color: 'var(--chrome)' }
                }
                className="rounded-[3px] border px-2 py-1 text-[12px] transition-colors duration-150"
              >
                {term}
              </button>
            )
          })}
        </div>
      )}

      {!loading && terms.length === 0 && (
        <p className="text-[12px]" style={{ color: 'var(--chrome-dim)' }}>
          No terms generated. Try a different subject.
        </p>
      )}

      {!loading && terms.length > 0 && (
        <button
          type="button"
          onClick={onCommit}
          disabled={selected.size === 0}
          style={{ borderColor: 'var(--lichen)', color: 'var(--lichen)' }}
          className="mt-3 w-full rounded-[3px] border py-1.5 text-[12px] font-medium disabled:opacity-30"
        >
          Add {selected.size > 0 ? selected.size : ''} to canvas
        </button>
      )}
    </div>
  )
}
