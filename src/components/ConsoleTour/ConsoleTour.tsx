import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useBootSequence } from './hooks/useBootSequence'
import { useCommands } from './hooks/useCommands'
import { useCommandHistory } from './hooks/useCommandHistory'
import { useGuidedFlow } from './hooks/useGuidedFlow'
import { useTypewriterQueue } from './hooks/useTypewriterQueue'
import { useTerminalAnimation, SCANLINE_POSITIONS } from './hooks/useTerminalAnimation'
import { TerminalHeader } from './TerminalHeader'
import { TerminalProgress } from './TerminalProgress'
import { TerminalBody } from './TerminalBody'
import { TerminalInput } from './TerminalInput'
import { TerminalFooter } from './TerminalFooter'
import { bootStory } from './data/bootStory'
import { CONTACT_EMAIL } from './data/steps'
import { TIMING } from './constants'
import type { DisplayLine, Mode } from './types'

interface Props {
  isOpen: boolean
  onClose: () => void
}

let lineCounter = 0
const uid = () => `line-${++lineCounter}`

export function ConsoleTour({ isOpen, onClose }: Props) {
  const { phase, termCtrl, backdropCtrl, isActive, isFullyOpen, isClosingVisual } =
    useTerminalAnimation(isOpen)

  const { isBooting, progress } = useBootSequence(isFullyOpen)
  const { execute } = useCommands()
  const { push: historyPush, up: historyUp, down: historyDown, reset: historyReset } = useCommandHistory()

  const isGuided = !isBooting && isFullyOpen
  const guidedFlow = useGuidedFlow(isGuided)
  const queue = useTypewriterQueue()

  const bootEnqueuedRef = useRef(false)
  const [pendingAutoExit, setPendingAutoExit] = useState(false)

  // Enqueue boot lines when terminal fully opens
  useEffect(() => {
    if (isFullyOpen && !bootEnqueuedRef.current) {
      bootEnqueuedRef.current = true
      const lines: DisplayLine[] = bootStory.map((entry, i) => ({
        id: `boot-${i}`,
        type: entry.type,
        text: entry.text,
      }))
      queue.enqueue(lines)
    }
  }, [isFullyOpen, queue.enqueue])

  // Reset all state when terminal goes idle
  useEffect(() => {
    if (!isActive) {
      queue.clear()
      historyReset()
      guidedFlow.reset()
      bootEnqueuedRef.current = false
      setPendingAutoExit(false)
    }
  }, [isActive, queue.clear, historyReset, guidedFlow.reset])

  // Mark pending auto-exit when tour completes
  useEffect(() => {
    if (guidedFlow.isComplete) setPendingAutoExit(true)
  }, [guidedFlow.isComplete])

  // Auto-exit after outro finishes typing
  useEffect(() => {
    if (!pendingAutoExit || queue.isTyping) return
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [pendingAutoExit, queue.isTyping, onClose])

  // ESC always closes
  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isActive, onClose])

  const mode: Mode = isBooting ? 'boot' : 'guided'

  const handleNavigate = useCallback((targetStep: number) => {
    setPendingAutoExit(false)
    queue.clear()
    const introLines = guidedFlow.navigateToStep(targetStep)
    queue.enqueue(introLines)
  }, [queue.clear, queue.enqueue, guidedFlow.navigateToStep])

  const handleInput = useCallback((input: string) => {
    setPendingAutoExit(false)
    historyPush(input)
    const echo: DisplayLine = { id: uid(), type: 'user', text: input }

    if (isBooting) {
      queue.enqueue([echo, { id: uid(), type: 'system', text: 'booting\u2026 one moment.' }])
      return
    }

    const ctx = { mode, currentStep: guidedFlow.currentStep, totalSteps: guidedFlow.totalSteps }
    const result = execute(input, ctx)

    if (result.sideEffect === 'clear') {
      queue.clear()
      return
    }
    if (result.sideEffect === 'exit') {
      onClose()
      return
    }
    if (result.sideEffect === 'navigate' && result.navigateTo != null) {
      queue.clear()
      const introLines = guidedFlow.navigateToStep(result.navigateTo)
      queue.enqueue([echo, ...introLines])
      return
    }
    if (result.sideEffect === 'copy-email') {
      navigator.clipboard.writeText(CONTACT_EMAIL).then(
        () => queue.enqueue([echo, { id: uid(), type: 'system', text: `\u2713 copied ${CONTACT_EMAIL} to clipboard` }]),
        () => queue.enqueue([echo, { id: uid(), type: 'error', text: 'clipboard write failed \u2014 copy manually' }]),
      )
      return
    }

    queue.enqueue([echo, ...result.lines])
  }, [isBooting, mode, execute, historyPush, onClose, guidedFlow.currentStep, guidedFlow.totalSteps, guidedFlow.navigateToStep, queue.enqueue, queue.clear])

  const displayProgress = isBooting ? progress : (guidedFlow.currentStep + 1) / guidedFlow.totalSteps
  const progressLabel = isBooting ? 'BOOT' : `${guidedFlow.currentStep + 1}/${guidedFlow.totalSteps}`

  return (
    <>
      {/* Backdrop — always in DOM, visibility toggled via CSS to avoid mount flash */}
      <motion.div
        animate={backdropCtrl}
        className="fixed inset-0 bg-void/70 backdrop-blur-sm z-40 pointer-events-none"
        style={{ visibility: isActive ? 'visible' : 'hidden' }}
      />

      {/* Terminal */}
      <div
        className="fixed inset-0 hidden sm:flex items-center justify-center z-50"
        style={{
          visibility: isActive ? 'visible' : 'hidden',
          pointerEvents: isFullyOpen ? 'auto' : 'none',
        }}
      >
        <div className="relative w-[85vw] max-w-[1200px] h-[80vh]">

          {/* Main terminal wrapper */}
          <motion.div
            animate={termCtrl}
            className="w-full h-full border border-deep-teal rounded-xl overflow-hidden flex flex-col font-mono"
            style={{
              transformOrigin: 'center center',
              background: isClosingVisual
                ? 'linear-gradient(90deg, transparent 0%, var(--color-matrix-green) 30%, var(--color-mint-glow) 50%, var(--color-matrix-green) 70%, transparent 100%)'
                : 'var(--color-deep-space)',
              boxShadow: isClosingVisual
                ? '0 0 16px var(--color-matrix-green), 0 0 32px var(--color-mint-glow)'
                : 'none',
            }}
          >
            {/* Hide terminal chrome during compress/line/dot phases */}
            <div className="flex flex-col flex-1 min-h-0" style={{ opacity: phase === 'compress' || isClosingVisual ? 0 : 1 }}>
              <TerminalHeader mode={mode} onClose={onClose} />
              <TerminalProgress
                progress={displayProgress}
                mode={mode}
                currentStep={guidedFlow.currentStep}
                label={progressLabel}
                onTabClick={handleNavigate}
              />
              <TerminalBody lines={queue.displayLines} />
              <TerminalInput mode={mode} hint={isGuided ? guidedFlow.stepHint : 'help'} onSubmit={handleInput} shouldFocus={isFullyOpen} onArrowUp={historyUp} onArrowDown={historyDown} />
              <TerminalFooter />
            </div>
          </motion.div>

          {/* Scanlines overlay — open animation phase 2 */}
          {phase === 'scan' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              {SCANLINE_POSITIONS.map((top, i) => (
                <motion.div
                  key={i}
                  className="absolute left-0 right-0"
                  style={{
                    top: `${top}%`,
                    height: `${i % 2 === 0 ? 1 : 2}px`,
                    background: 'linear-gradient(90deg, transparent, var(--color-matrix-green), var(--color-mint-glow), var(--color-matrix-green), transparent)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.9, 0.2, 0.8, 0] }}
                  transition={{ duration: TIMING.openScan / 1000, delay: i * 0.07, ease: 'easeInOut' }}
                />
              ))}
            </div>
          )}

          {/* Afterglow — close animation phase 3 */}
          {phase === 'dot' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 0 }}
              transition={{ duration: TIMING.closeDot / 1000 }}
            >
              <div
                style={{
                  width: '50%',
                  height: '8px',
                  background: 'radial-gradient(ellipse at center, var(--color-mint-glow) 0%, var(--color-matrix-green) 40%, transparent 70%)',
                  filter: 'blur(4px)',
                }}
              />
            </motion.div>
          )}

        </div>
      </div>
    </>
  )
}
