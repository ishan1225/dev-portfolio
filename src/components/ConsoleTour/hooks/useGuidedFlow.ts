import { useState, useCallback, useRef } from 'react'
import { STEPS, TOTAL_STEPS, CONTACT_EMAIL } from '../data/steps'
import type { DisplayLine } from '../types'

let lineCounter = 0
const uid = () => `gf-${++lineCounter}`

function buildStepIntro(stepIndex: number): DisplayLine[] {
  const step = STEPS[stepIndex]
  return [
    { id: uid(), type: 'system', text: 'section loaded' },
    { id: uid(), type: 'content', text: `── ${step.title} ──` },
    ...step.description.map(d => ({ id: uid(), type: 'content' as const, text: d })),
    { id: uid(), type: 'hint', text: `type ${step.hint} or press Tab → Enter` },
  ]
}

function buildOutro(timeStr: string): DisplayLine[] {
  return [
    { id: uid(), type: 'content', text: '' },
    { id: uid(), type: 'system', text: `✓ tour complete — ${timeStr}` },
    { id: uid(), type: 'content', text: '' },
    { id: uid(), type: 'content', text: 'thanks for the time.' },
    { id: uid(), type: 'content', text: 'hope something here caught your eye.' },
    { id: uid(), type: 'content', text: '' },
    { id: uid(), type: 'content', text: `→ ${CONTACT_EMAIL}` },
    { id: uid(), type: 'hint', text: 'signal lost — closing connection...' },
  ]
}

export function useGuidedFlow(isGuided: boolean) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [isComplete, setIsComplete] = useState(false)
  const bootEndTimeRef = useRef<number | null>(null)
  const completedOnceRef = useRef(false)

  // Record when guided mode first starts (boot ends)
  if (isGuided && bootEndTimeRef.current === null) {
    bootEndTimeRef.current = Date.now()
  }

  const navigateToStep = useCallback((index: number): DisplayLine[] => {
    const clamped = Math.max(0, Math.min(index, TOTAL_STEPS - 1))
    setCurrentStep(clamped)

    const introLines = buildStepIntro(clamped)

    // Completion when reaching Contact (last step) — only first time
    if (clamped === TOTAL_STEPS - 1 && bootEndTimeRef.current !== null && !completedOnceRef.current) {
      completedOnceRef.current = true
      const elapsed = Date.now() - bootEndTimeRef.current
      const minutes = Math.floor(elapsed / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)
      const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`
      introLines.push(...buildOutro(timeStr))
      setIsComplete(true)
    }

    return introLines
  }, [])

  const stepHint = currentStep === -1 ? 'next' : (STEPS[currentStep]?.hint ?? 'help')

  const reset = useCallback(() => {
    setCurrentStep(-1)
    setIsComplete(false)
    completedOnceRef.current = false
    bootEndTimeRef.current = null
  }, [])

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    stepHint,
    navigateToStep,
    isComplete,
    reset,
  }
}
