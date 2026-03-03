import { useState, useEffect } from 'react'
import { TIMING } from '../constants'

/**
 * Tracks boot phase timing only — progress bar fill and isBooting flag.
 * Typewriter output is handled by useTypewriterQueue in ConsoleTour.
 */
export function useBootSequence(enabled: boolean) {
  const [isBooting, setIsBooting] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setIsBooting(true)
      setProgress(0)
      return
    }

    const start = Date.now()

    const progressInterval = setInterval(() => {
      setProgress(Math.min((Date.now() - start) / TIMING.bootDurationMs, 1))
    }, 50)

    const endTimer = setTimeout(() => {
      clearInterval(progressInterval)
      setProgress(1)
      setIsBooting(false)
    }, TIMING.bootDurationMs)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(endTimer)
    }
  }, [enabled])

  return { isBooting, progress }
}
