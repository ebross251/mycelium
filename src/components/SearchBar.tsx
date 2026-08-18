import { useState, type KeyboardEvent } from 'react'

interface SearchBarProps {
  onSubmit: (query: string) => void
  loading: boolean
  inputRef?: React.RefObject<HTMLInputElement>
}

export default function SearchBar({ onSubmit, loading, inputRef }: SearchBarProps) {
  const [value, setValue] = useState('')

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || loading) return
    onSubmit(trimmed)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') submit()
  }

  return (
    <div
      style={{ fontFamily: 'var(--sans)' }}
      className="pointer-events-auto flex w-72 items-center gap-2 rounded border border-[rgba(143,163,155,0.18)] bg-[rgba(22,33,29,0.75)] px-3 py-2 transition-[border-color,box-shadow] duration-200 focus-within:border-[rgba(127,227,196,0.55)] focus-within:shadow-[0_0_0_3px_rgba(127,227,196,0.12)]"
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a subject to seed the map..."
        style={{ color: 'var(--chrome)' }}
        className="w-full border-none bg-transparent text-[13px] outline-none placeholder:text-[var(--chrome-dim)]"
      />
      <button
        type="button"
        onClick={submit}
        disabled={loading || !value.trim()}
        style={{ color: 'var(--live)' }}
        className="shrink-0 text-[13px] disabled:opacity-30"
      >
        {loading ? '…' : 'Generate'}
      </button>
    </div>
  )
}
