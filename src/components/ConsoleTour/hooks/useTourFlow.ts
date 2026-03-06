import { useState, useCallback, useRef } from 'react'
import { STEPS, TOTAL_STEPS, INITIAL_GHOST_HINT } from '../config/steps'
import type { DisplayLine } from '../types'

let lineCounter = 0
const uid = () => `tf-${++lineCounter}`

export function useTourFlow(enabled: boolean) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [easterEggRevealed, setEasterEggRevealed] = useState(false)
  const [easterEggPhase, setEasterEggPhase] = useState<'none' | 'secret' | 'fun' | 'done'>('none')
  const [isComplete, setIsComplete] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const bootEndTimeRef = useRef<number | null>(null)

  // Record when tour becomes enabled (boot ends)
  if (enabled && bootEndTimeRef.current === null) {
    bootEndTimeRef.current = Date.now()
  }

  // Both bonus tabs always visible (locked until unlocked)
  const visibleTotal = TOTAL_STEPS + 2

  // Navigate to a config step (0-based index into STEPS)
  const navigateToStep = useCallback((index: number): DisplayLine[] => {
    const clamped = Math.max(0, Math.min(index, TOTAL_STEPS - 1))
    setCurrentStep(clamped)
    setHasInteracted(true)

    // Clone lines with fresh IDs so React keys are unique across navigations
    const step = STEPS[clamped]
    const lines = step.lines.map(l => ({ ...l, id: uid() }))

    // Last config step (whatever it is) reveals the easter egg tab
    if (clamped === TOTAL_STEPS - 1 && !easterEggRevealed) {
      setEasterEggRevealed(true)
    }

    return lines
  }, [easterEggRevealed])

  // Handle easter egg commands (secret / fun)
  const handleEasterEgg = useCallback((command: 'secret' | 'fun'): DisplayLine[] => {
    setHasInteracted(true)

    if (command === 'secret') {
      setEasterEggPhase('secret')
      // Reveal easter egg tab if not already (user might type secret before reaching contact)
      if (!easterEggRevealed) setEasterEggRevealed(true)
      // Lines handled by matrixMode in ConsoleTour — return empty
      return []
    }

    if (command === 'fun') {
      setEasterEggPhase('done')
      setIsComplete(true)
      // Game renderer handles display — return empty
      return []
    }

    return []
  }, [easterEggRevealed])

  // Current ghost hint based on tour position
  const ghostHint: string = (() => {
    if (!enabled) return ''
    if (currentStep === -1) return INITIAL_GHOST_HINT
    if (currentStep < TOTAL_STEPS) {
      const stepHint = STEPS[currentStep].ghostHint
      // Last step hints at easter egg — override with phase-aware hint
      if (currentStep === TOTAL_STEPS - 1) {
        if (easterEggPhase === 'none') return 'secret'
        if (easterEggPhase === 'secret') return 'fun'
        return '' // done
      }
      return stepHint
    }
    return ''
  })()

  const reset = useCallback(() => {
    setCurrentStep(-1)
    setEasterEggRevealed(false)
    setEasterEggPhase('none')
    setIsComplete(false)
    setHasInteracted(false)
    bootEndTimeRef.current = null
  }, [])

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    visibleTotal,
    ghostHint,
    navigateToStep,
    handleEasterEgg,
    easterEggRevealed,
    easterEggPhase,
    isComplete,
    hasInteracted,
    setHasInteracted,
    reset,
  }
}
