import { useState, useEffect } from 'react'
import { bootStory } from '../data/bootStory'
import { TIMING } from '../constants'
import type { BootLine } from '../types'

/**
 * Orchestrates the boot phase animation.
 * @param enabled - starts (and resets) the sequence when true; resets state when false
 */
export function useBootSequence(enabled: boolean) {
  const [lines, setLines] = useState<BootLine[]>([])
  const [isBooting, setIsBooting] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setLines([])
      setIsBooting(true)
      setProgress(0)
      return
    }

    const startTime = Date.now()
    const allTimeouts: ReturnType<typeof setTimeout>[] = []
    const allIntervals: ReturnType<typeof setInterval>[] = []
    let cancelled = false

    // Track progress 0→1 over the boot duration
    const progressInterval = setInterval(() => {
      if (cancelled) return
      setProgress(Math.min((Date.now() - startTime) / TIMING.bootDurationMs, 1))
    }, 50)
    allIntervals.push(progressInterval)

    // Schedule each boot story line
    bootStory.forEach((entry, index) => {
      const t = setTimeout(() => {
        if (cancelled) return
        const id = `boot-${index}`

        setLines(prev => [
          ...prev,
          { id, type: entry.type, fullText: entry.text, revealedChars: 0 },
        ])

        let charIndex = 0
        const iv = setInterval(() => {
          if (cancelled) {
            clearInterval(iv)
            return
          }
          charIndex++
          setLines(prev =>
            prev.map(l => (l.id === id ? { ...l, revealedChars: charIndex } : l))
          )
          if (charIndex >= entry.text.length) clearInterval(iv)
        }, TIMING.typewriterMs)
        allIntervals.push(iv)
      }, entry.delay)
      allTimeouts.push(t)
    })

    // Transition to guided after boot duration
    const endTimeout = setTimeout(() => {
      if (cancelled) return
      clearInterval(progressInterval)
      setProgress(1)
      setIsBooting(false)
    }, TIMING.bootDurationMs)
    allTimeouts.push(endTimeout)

    return () => {
      cancelled = true
      allTimeouts.forEach(clearTimeout)
      allIntervals.forEach(clearInterval)
    }
  }, [enabled])

  return { lines, isBooting, progress }
}
