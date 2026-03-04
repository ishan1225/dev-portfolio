import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useBootSequence } from './hooks/useBootSequence'
import { useCommands } from './hooks/useCommands'
import { useCommandHistory } from './hooks/useCommandHistory'
import { useTourFlow } from './hooks/useTourFlow'
import { useTypewriterQueue } from './hooks/useTypewriterQueue'
import { useTerminalAnimation, SCANLINE_POSITIONS } from './hooks/useTerminalAnimation'
import { TerminalHeader } from './TerminalHeader'
import { TerminalProgress } from './TerminalProgress'
import { TerminalBody } from './TerminalBody'
import { TerminalInput } from './TerminalInput'
import { TerminalFooter } from './TerminalFooter'
import { bootStory } from './data/bootStory'
import { CONTACT_EMAIL, resolveStepArg } from './data/steps'
import { TIMING } from './constants'
import type { DisplayLine } from './types'

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

  const tourEnabled = !isBooting && isFullyOpen
  const {
    currentStep, totalSteps, visibleTotal, ghostHint,
    navigateToStep, handleEasterEgg,
    easterEggRevealed, isComplete, hasInteracted, setHasInteracted,
    reset: tourReset,
  } = useTourFlow(tourEnabled)

  const queue = useTypewriterQueue()
  const bootEnqueuedRef = useRef(false)

  // Enqueue boot lines when terminal fully opens
  useEffect(() => {
    if (isFullyOpen && !bootEnqueuedRef.current) {
      bootEnqueuedRef.current = true
      const lines: DisplayLine[] = bootStory.map((entry, i) => ({
        id: `boot-${i}`,
        type: entry.type,
        text: entry.text,
      }))
      queue.enqueue(lines) // typewriter mode (default) for boot
    }
  }, [isFullyOpen, queue.enqueue])

  // Reset all state when terminal goes idle
  useEffect(() => {
    if (!isActive) {
      queue.clear()
      historyReset()
      tourReset()
      bootEnqueuedRef.current = false
    }
  }, [isActive, queue.clear, historyReset, tourReset])

  // ESC always closes
  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isActive, onClose])

  // Handle tab click → navigate to step directly
  const handleTabClick = useCallback((stepIndex: number) => {
    setHasInteracted(true)
    const lines = navigateToStep(stepIndex)
    queue.clear()
    queue.enqueue(lines, 'stagger')

    // Contact step → copy email
    if (stepIndex === totalSteps - 1) {
      navigator.clipboard.writeText(CONTACT_EMAIL).then(
        () => queue.enqueue([{ id: uid(), type: 'system', text: `\u2713 copied ${CONTACT_EMAIL}` }], 'stagger'),
        () => {},
      )
    }
  }, [navigateToStep, totalSteps, queue.clear, queue.enqueue, setHasInteracted])

  // Handle typed command input
  const handleInput = useCallback((input: string) => {
    setHasInteracted(true)
    historyPush(input)
    const echo: DisplayLine = { id: uid(), type: 'user', text: input }

    if (isBooting) {
      queue.enqueue([echo, { id: uid(), type: 'system', text: 'booting\u2026 one moment.' }])
      return
    }

    const trimmed = input.toLowerCase().trim()

    // Easter egg commands → handleEasterEgg for content + state
    if (trimmed === 'secret' || trimmed === 'fun') {
      const lines = handleEasterEgg(trimmed)
      queue.clear()
      queue.enqueue([echo, ...lines], 'stagger')
      return
    }

    // Check if command maps to a tour step
    const stepIdx = resolveStepArg(trimmed)
    if (stepIdx >= 0) {
      const lines = navigateToStep(stepIdx)
      queue.clear()
      queue.enqueue([echo, ...lines], 'stagger')

      // Contact step → copy email
      if (stepIdx === totalSteps - 1) {
        navigator.clipboard.writeText(CONTACT_EMAIL).then(
          () => queue.enqueue([{ id: uid(), type: 'system', text: `\u2713 copied ${CONTACT_EMAIL}` }], 'stagger'),
          () => {},
        )
      }
      return
    }

    // Regular command
    const ctx = { currentStep, totalSteps }
    const result = execute(input, ctx)

    queue.clear()
    queue.enqueue([echo, ...result.lines], 'stagger')

    // Handle side effects
    if (result.sideEffect === 'copy-email') {
      navigator.clipboard.writeText(CONTACT_EMAIL).then(
        () => queue.enqueue([{ id: uid(), type: 'system', text: `\u2713 copied ${CONTACT_EMAIL}` }], 'stagger'),
        () => {},
      )
    }
  }, [isBooting, execute, historyPush, handleEasterEgg, navigateToStep, currentStep, totalSteps, queue.enqueue, queue.clear, setHasInteracted])

  // Handle [▸] play button → submit ghost hint as command
  const handlePlayClick = () => {
    if (!ghostHint) return
    handleInput(ghostHint)
  }

  // Derive display values
  const shouldPulse = tourEnabled && !hasInteracted

  const displayProgress = isBooting
    ? progress
    : currentStep >= 0
      ? (currentStep + 1) / visibleTotal
      : 0

  const progressLabel = isBooting
    ? 'BOOT'
    : currentStep >= 0
      ? `${currentStep + 1}/${visibleTotal}`
      : `0/${visibleTotal}`

  return (
    <>
      {/* Backdrop */}
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
              <TerminalHeader onClose={onClose} />
              <TerminalProgress
                progress={displayProgress}
                label={progressLabel}
                isBooting={isBooting}
                currentStep={currentStep}
                totalSteps={visibleTotal}
                easterEggRevealed={easterEggRevealed}
                isComplete={isComplete}
                shouldPulse={shouldPulse}
                onTabClick={handleTabClick}
                onPlayClick={handlePlayClick}
              />
              <TerminalBody lines={queue.displayLines} />
              <TerminalInput
                isBooting={isBooting}
                hint={ghostHint}
                onSubmit={handleInput}
                shouldFocus={isFullyOpen}
                shouldPulse={shouldPulse}
                onArrowUp={historyUp}
                onArrowDown={historyDown}
              />
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
