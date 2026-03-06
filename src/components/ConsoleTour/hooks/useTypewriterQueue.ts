import { useState, useCallback, useRef, useEffect } from 'react'
import { TIMING } from '../config/constants'
import type { DisplayLine } from '../types'

interface QueueItem {
  line: DisplayLine
  mode: 'typewriter' | 'stagger'
  onComplete?: () => void
}

/**
 * Universal output queue — ALL terminal output flows through this.
 * Two modes:
 * - 'typewriter': per-character reveal (boot phase, easter egg messages)
 * - 'stagger': whole lines appear instantly (post-boot step content)
 *
 * After each line, waits line.pauseAfterMs (if set) or TIMING.linePauseMs.
 * User echo lines (type 'user') appear with zero delay.
 * Optional onComplete callback fires after the last line's pause elapses.
 */
export function useTypewriterQueue() {
  const charMs = TIMING.typewriterMs
  const defaultPause = TIMING.linePauseMs

  const queueRef = useRef<QueueItem[]>([])
  const [completed, setCompleted] = useState<DisplayLine[]>([])
  const [typing, setTyping] = useState<{ line: DisplayLine; chars: number } | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pauseRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const processingRef = useRef(false)

  const stopTimers = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    if (pauseRef.current) { clearTimeout(pauseRef.current); pauseRef.current = null }
  }, [])

  const processNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      processingRef.current = false
      setTyping(null)
      return
    }

    const item = queueRef.current.shift()!
    const { line, mode, onComplete } = item
    const pause = line.pauseAfterMs ?? defaultPause

    const advance = (delay: number) => {
      if (queueRef.current.length > 0) {
        pauseRef.current = setTimeout(processNext, delay)
      } else if (delay > 0 && onComplete) {
        // Last line with callback — wait for pause then fire
        pauseRef.current = setTimeout(() => {
          processingRef.current = false
          onComplete()
        }, delay)
      } else {
        processingRef.current = false
        onComplete?.()
      }
    }

    // User echoes and empty lines appear instantly
    if (line.type === 'user' || line.text.length === 0) {
      setCompleted(prev => [...prev, line])
      advance(line.type === 'user' ? 0 : pause)
      return
    }

    // Stagger mode: whole line appears, then pause
    if (mode === 'stagger') {
      setCompleted(prev => [...prev, line])
      advance(pause)
      return
    }

    // Typewriter mode: character by character, then pause
    let chars = 0
    setTyping({ line, chars: 0 })

    intervalRef.current = setInterval(() => {
      chars++
      if (chars >= line.text.length) {
        clearInterval(intervalRef.current!)
        intervalRef.current = null
        setTyping(null)
        setCompleted(prev => [...prev, line])
        advance(pause)
      } else {
        setTyping({ line, chars })
      }
    }, charMs)
  }, [charMs, defaultPause])

  const enqueue = useCallback((
    lines: DisplayLine[],
    mode: 'typewriter' | 'stagger' = 'typewriter',
    onComplete?: () => void,
  ) => {
    if (lines.length === 0) return
    const items: QueueItem[] = lines.map(line => ({ line, mode }))
    // Attach onComplete to the last item so it fires after its pause
    if (onComplete) {
      items[items.length - 1].onComplete = onComplete
    }
    queueRef.current.push(...items)
    if (!processingRef.current) {
      processingRef.current = true
      processNext()
    }
  }, [processNext])

  const clear = useCallback(() => {
    stopTimers()
    queueRef.current = []
    processingRef.current = false
    setCompleted([])
    setTyping(null)
  }, [stopTimers])

  // Cleanup on unmount
  useEffect(() => stopTimers, [stopTimers])

  const displayLines: DisplayLine[] = [
    ...completed,
    ...(typing ? [{
      ...typing.line,
      text: typing.line.text.slice(0, typing.chars),
      showCursor: true,
    }] : []),
  ]

  const isTyping = typing !== null || queueRef.current.length > 0

  return { displayLines, enqueue, clear, isTyping }
}
