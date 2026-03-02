import { useState, useRef, useCallback } from 'react'

export function useCommandHistory() {
  const [history, setHistory] = useState<string[]>([])
  const pointerRef = useRef<number>(-1)

  const push = useCallback((cmd: string) => {
    setHistory(prev => {
      const next = [...prev, cmd]
      pointerRef.current = next.length
      return next
    })
  }, [])

  const up = useCallback((): string | null => {
    if (history.length === 0) return null
    const next = pointerRef.current - 1
    if (next < 0) return null
    pointerRef.current = next
    return history[next]
  }, [history])

  const down = useCallback((): string | null => {
    if (history.length === 0) return null
    const next = pointerRef.current + 1
    if (next >= history.length) {
      pointerRef.current = history.length
      return ''
    }
    pointerRef.current = next
    return history[next]
  }, [history])

  const reset = useCallback(() => {
    setHistory([])
    pointerRef.current = -1
  }, [])

  return { push, up, down, reset }
}
