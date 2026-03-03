import { useState, useCallback, useRef, useEffect } from 'react'
import { TIMING } from '../constants'
import type { DisplayLine } from '../types'

/**
 * Universal typewriter queue — ALL terminal output flows through this.
 * Lines are typed one at a time, character by character.
 * User echo lines (type 'user') and empty lines appear instantly.
 */
export function useTypewriterQueue(
  charMs: number = TIMING.typewriterMs,
  pauseMs: number = 100,
) {
  const queueRef = useRef<DisplayLine[]>([])
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

    const line = queueRef.current.shift()!

    // User echoes and empty lines appear instantly
    if (line.type === 'user' || line.text.length === 0) {
      setCompleted(prev => [...prev, line])
      if (queueRef.current.length > 0) {
        pauseRef.current = setTimeout(processNext, line.type === 'user' ? 0 : pauseMs)
      } else {
        processingRef.current = false
      }
      return
    }

    // Type line character by character
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
  }, [charMs, pauseMs])

  const enqueue = useCallback((lines: DisplayLine[]) => {
    if (lines.length === 0) return
    queueRef.current.push(...lines)
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
