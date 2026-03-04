import { useState, useCallback, useRef, useEffect } from 'react'
import { TIMING } from '../constants'
import type { DisplayLine } from '../types'

interface QueueItem {
  line: DisplayLine
  mode: 'typewriter' | 'stagger'
}

/**
 * Universal output queue — ALL terminal output flows through this.
 * Supports two modes:
 * - 'typewriter': per-character reveal (boot phase)
 * - 'stagger': whole lines appear with delay between them (post-boot)
 * User echo lines (type 'user') and empty lines always appear instantly.
 */
export function useTypewriterQueue(
  charMs: number = TIMING.typewriterMs,
  staggerMs: number = TIMING.lineStaggerMs,
  pauseMs: number = 100,
) {
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
    const { line, mode } = item

    // User echoes and empty lines appear instantly
    if (line.type === 'user' || line.text.length === 0) {
      setCompleted(prev => [...prev, line])
      if (queueRef.current.length > 0) {
        pauseRef.current = setTimeout(processNext, line.type === 'user' ? 0 : staggerMs)
      } else {
        processingRef.current = false
      }
      return
    }

    // Stagger mode: line appears whole instantly, then delay before next
    if (mode === 'stagger') {
      setCompleted(prev => [...prev, line])
      if (queueRef.current.length > 0) {
        pauseRef.current = setTimeout(processNext, staggerMs)
      } else {
        processingRef.current = false
      }
      return
    }

    // Typewriter mode: character by character
    let chars = 0
    setTyping({ line, chars: 0 })

    intervalRef.current = setInterval(() => {
      chars++
      if (chars >= line.text.length) {
        clearInterval(intervalRef.current!)
        intervalRef.current = null
        setTyping(null)
        setCompleted(prev => [...prev, line])
        if (queueRef.current.length > 0) {
          pauseRef.current = setTimeout(processNext, pauseMs)
        } else {
          processingRef.current = false
        }
      } else {
        setTyping({ line, chars })
      }
    }, charMs)
  }, [charMs, staggerMs, pauseMs])

  const enqueue = useCallback((lines: DisplayLine[], mode: 'typewriter' | 'stagger' = 'typewriter') => {
    if (lines.length === 0) return
    const items = lines.map(line => ({ line, mode }))
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
