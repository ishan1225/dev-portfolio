import { useState, useEffect, useRef } from 'react'

interface Props {
  isBooting: boolean
  hint?: string
  onSubmit: (value: string) => void
  shouldFocus?: boolean
  shouldPulse?: boolean
  disabled?: boolean
  onArrowUp?: () => string | null
  onArrowDown?: () => string | null
  onTabFill?: () => void
}

export function TerminalInput({ isBooting, hint, onSubmit, shouldFocus, shouldPulse, disabled, onArrowUp, onArrowDown, onTabFill }: Props) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (shouldFocus) inputRef.current?.focus()
  }, [shouldFocus])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value.trim())
      setValue('')
    }
    if (e.key === 'Tab' && hint && !value && !isBooting && !disabled) {
      e.preventDefault()
      setValue(hint)
      onTabFill?.()
    }
    if (e.key === 'ArrowUp' && onArrowUp) {
      e.preventDefault()
      const v = onArrowUp()
      if (v !== null) setValue(v)
    }
    if (e.key === 'ArrowDown' && onArrowDown) {
      e.preventDefault()
      const v = onArrowDown()
      if (v !== null) setValue(v)
    }
  }

  return (
    <div data-onboard="input" className="flex items-center gap-2 lg:gap-2.5 xl:gap-3 px-3.5 lg:px-5 xl:px-6 py-2 lg:py-2.5 xl:py-3 bg-deep-teal/20 border-t border-matrix-green/30 input-glow">
      <span className={`text-matrix-green font-bold text-base lg:text-lg xl:text-xl leading-none ${shouldPulse ? 'prompt-pulse' : ''}`}>
        ›
      </span>

      <div className="flex-1 relative">
        {!value && (
          <span
            className={`absolute top-1/2 -translate-y-1/2 text-sm lg:text-base pointer-events-none select-none ${
              isBooting ? 'text-muted-purple italic' : 'text-silver'
            }`}
          >
            {isBooting ? 'booting\u2026' : hint ? `${hint}  \u21E5` : ''}
          </span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={40}
          className="w-full bg-transparent border-0 outline-none text-near-white text-sm lg:text-base caret-matrix-green font-mono disabled:opacity-50"
        />
      </div>
    </div>
  )
}
