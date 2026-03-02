import { useState, useEffect } from 'react'
import { TIMING } from '../constants'

/**
 * Reveals a string one character at a time.
 * Re-runs whenever `text` changes.
 */
export function useTypewriter(text: string, speedMs = TIMING.typewriterMs) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    if (!text) {
      setDone(true)
      return
    }

    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speedMs)

    return () => clearInterval(interval)
  }, [text, speedMs])

  return { displayed, done }
}
