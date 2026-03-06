import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
import { OnboardingOverlay } from './OnboardingOverlay'
import { MatrixDonutRenderer } from './MatrixDonutRenderer'
import { GameRenderer } from './GameRenderer'
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

  const bootResult = useBootSequence(isFullyOpen)
  const isBooting = bootResult.isBooting
  const progress = bootResult.progress
  const { execute } = useCommands()
  const { push: historyPush, up: historyUp, down: historyDown, reset: historyReset } = useCommandHistory()

  const tourEnabled = !isBooting && isFullyOpen
  const {
    currentStep, totalSteps, visibleTotal, ghostHint,
    navigateToStep, handleEasterEgg,
    easterEggRevealed, easterEggPhase, isComplete, hasInteracted, setHasInteracted,
    reset: tourReset,
  } = useTourFlow(tourEnabled)

  const queue = useTypewriterQueue()
  const bootEnqueuedRef = useRef(false)

  // Tutorial state: null=inactive, 0=continue, 1=tab+enter, 2=click-about, 3=farewell
  const [tutorialStep, setTutorialStep] = useState<number | null>(null)
  const [matrixMode, setMatrixMode] = useState(false)
  const [gameMode, setGameMode] = useState(false)
  const tutorialStartedRef = useRef(false)
  const pendingNavRef = useRef<number | null>(null)

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

  // Start interactive tutorial after boot completes
  useEffect(() => {
    if (!isBooting && isFullyOpen && !tutorialStartedRef.current) {
      tutorialStartedRef.current = true
      setTutorialStep(0) // immediately — so label shows INTRO, no "0/5" flash
    }
  }, [isBooting, isFullyOpen])

  // Clear boot text shortly after tutorial begins (separate effect for StrictMode compat)
  useEffect(() => {
    if (tutorialStep !== 0) return
    const timer = setTimeout(() => {
      queue.clear()
    }, TIMING.onboardingDelayMs)
    return () => clearTimeout(timer)
  }, [tutorialStep, queue.clear])

  // Farewell step 3: show message, then navigate, then dismiss
  useEffect(() => {
    if (tutorialStep !== 3) return
    const stepIndex = pendingNavRef.current

    // 1.8s: farewell visible on clean body
    // 1.8s: load content underneath (overlay still visible)
    // 2.5s: dismiss overlay — content revealed
    const navTimer = setTimeout(() => {
      if (stepIndex !== null) {
        setHasInteracted(true)
        const lines = navigateToStep(stepIndex)
        queue.clear()
        queue.enqueue(lines, 'stagger')
        queue.enqueue([
          { id: uid(), type: 'content', text: '' },
          { id: uid(), type: 'system', text: 'tip: tabs, Continue ▸, and commands — all three work.' },
        ], 'stagger')
        pendingNavRef.current = null
      }
    }, 1800)

    const dismissTimer = setTimeout(() => {
      setTutorialStep(null)
    }, 2500)

    return () => {
      clearTimeout(navTimer)
      clearTimeout(dismissTimer)
    }
  }, [tutorialStep, navigateToStep, queue.clear, queue.enqueue, setHasInteracted])

  // Reset all state when terminal goes idle
  useEffect(() => {
    if (!isActive) {
      queue.clear()
      historyReset()
      tourReset()
      bootEnqueuedRef.current = false
      setTutorialStep(null)
      tutorialStartedRef.current = false
      pendingNavRef.current = null
      setMatrixMode(false)
      setGameMode(false)
    }
  }, [isActive, queue.clear, historyReset, tourReset])

  // ESC closes terminal (unless game is active — GameRenderer handles ESC internally)
  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isActive, onClose, gameMode])

  // Handle tab click → navigate to step directly
  const handleTabClick = useCallback((stepIndex: number) => {
    // Block tab clicks during tutorial steps 0 and 1
    if (tutorialStep !== null && tutorialStep < 2) return

    // Tutorial step 2: show farewell, then navigate after delay
    if (tutorialStep === 2) {
      setTutorialStep(3)
      pendingNavRef.current = stepIndex
      queue.clear() // clear step feedback so farewell message is clean
      return
    }

    // Bonus tab: Donut (index === totalSteps)
    if (stepIndex === totalSteps) {
      setGameMode(false)
      setMatrixMode(true)
      queue.clear()
      return
    }

    // Bonus tab: Robo Hop (index === totalSteps + 1)
    if (stepIndex === totalSteps + 1) {
      setMatrixMode(false)
      setGameMode(true)
      queue.clear()
      return
    }

    // Regular tab — dismiss game/matrix mode
    setGameMode(false)
    setMatrixMode(false)
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
  }, [tutorialStep, navigateToStep, totalSteps, queue.clear, queue.enqueue, setHasInteracted])

  // Handle typed command input
  const handleInput = useCallback((input: string) => {
    // Tutorial step 1: intercept — don't navigate, just acknowledge
    if (tutorialStep === 1) {
      const echo: DisplayLine = { id: uid(), type: 'user', text: input }
      queue.clear()
      queue.enqueue([
        echo,
        { id: uid(), type: 'system', text: '✓ type commands to jump directly to any section.' },
      ], 'stagger')
      setTutorialStep(2)
      return
    }

    setHasInteracted(true)
    historyPush(input)
    const echo: DisplayLine = { id: uid(), type: 'user', text: input }

    if (isBooting) {
      queue.enqueue([echo, { id: uid(), type: 'system', text: 'booting\u2026 one moment.' }])
      return
    }

    const trimmed = input.toLowerCase().trim()

    // Easter egg commands → show transition message, then enter mode after delay
    if (trimmed === 'secret') {
      handleEasterEgg('secret')
      if (matrixMode) setMatrixMode(false)
      if (gameMode) setGameMode(false)
      queue.clear()
      queue.enqueue([
        echo,
        { id: uid(), type: 'system', text: 'Bonus section unlocked. Hello Neo, do you like donuts with your coffee?' },
      ])
      // 72 chars × 30ms + stagger + 1.2s reading pause
      setTimeout(() => setMatrixMode(true), 3800)
      return
    }

    // Dismiss matrix mode on any other input (including 'fun')
    if (matrixMode) {
      setMatrixMode(false)
    }

    if (trimmed === 'fun' || trimmed === 'game' || trimmed === 'play') {
      handleEasterEgg('fun')
      if (gameMode) setGameMode(false)
      queue.clear()
      queue.enqueue([
        echo,
        { id: uid(), type: 'system', text: 'booting up Robo Hop... beep boop' },
      ])
      // 34 chars × 30ms + stagger + 1s reading pause
      setTimeout(() => setGameMode(true), 2500)
      return
    }

    // Check if command maps to a tour step
    const stepIdx = resolveStepArg(trimmed)
    if (stepIdx >= 0) {
      setGameMode(false)
      setMatrixMode(false)
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
  }, [tutorialStep, isBooting, execute, historyPush, handleEasterEgg, navigateToStep, currentStep, totalSteps, queue.enqueue, queue.clear, setHasInteracted])

  // Handle [▸] play button
  const handlePlayClick = () => {
    // Tutorial step 0: acknowledge and advance
    if (tutorialStep === 0) {
      queue.clear()
      queue.enqueue([
        { id: uid(), type: 'system', text: '✓ Continue ▸ follows the guided tour step by step.' },
      ], 'stagger')
      setTutorialStep(1)
      return
    }

    if (!ghostHint) return
    handleInput(ghostHint)
  }

  // Handle game quit → show score, return to terminal
  const handleGameQuit = useCallback((score: number) => {
    setGameMode(false)
    const sec = Math.floor((score / 10) % 60)
    const min = Math.floor(score / 10 / 60)
    const timeStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    queue.enqueue([{ id: uid(), type: 'system', text: `game over — uptime: ${timeStr}` }], 'stagger')
  }, [queue.enqueue])

  // Derive display values — tutorial overrides
  const inTutorial = tutorialStep !== null && tutorialStep < 3
  const shouldPulse = tourEnabled && !hasInteracted && tutorialStep === null
  const effectiveGhostHint = tutorialStep === 1 ? 'about' : inTutorial ? '' : ghostHint

  // Unified progress: boot(2) + intro(3) + tour(visibleTotal) segments — no resets
  const BOOT_WEIGHT = 2
  const INTRO_STEPS = 3
  const totalSegments = BOOT_WEIGHT + INTRO_STEPS + visibleTotal
  const atEasterEgg = easterEggPhase === 'secret' || easterEggPhase === 'done'
  const inTutorialOrFarewell = tutorialStep !== null

  const displayProgress = isBooting
    ? progress * (BOOT_WEIGHT / totalSegments)
    : inTutorial
      ? (BOOT_WEIGHT + tutorialStep!) / totalSegments
      : easterEggPhase === 'done' || isComplete
        ? 1
        : easterEggPhase === 'secret'
          ? (BOOT_WEIGHT + INTRO_STEPS + visibleTotal - 1) / totalSegments
          : currentStep >= 0
            ? (BOOT_WEIGHT + INTRO_STEPS + currentStep + 1) / totalSegments
            : (BOOT_WEIGHT + INTRO_STEPS) / totalSegments

  // Simple phase labels — no numbers, progress bar tells the story
  const progressLabel = isBooting
    ? 'Boot'
    : inTutorialOrFarewell
      ? 'Intro'
      : atEasterEgg || isComplete
        ? 'Bonus'
        : 'Tour'

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
                easterEggPhase={easterEggPhase}
                isComplete={isComplete}
                shouldPulse={shouldPulse}
                tutorialStep={tutorialStep}
                onTabClick={handleTabClick}
                onPlayClick={handlePlayClick}
              />
              {gameMode ? <GameRenderer onQuit={handleGameQuit} /> : matrixMode ? <MatrixDonutRenderer /> : <TerminalBody lines={queue.displayLines} />}
              <TerminalInput
                isBooting={isBooting}
                hint={effectiveGhostHint}
                onSubmit={handleInput}
                shouldFocus={isFullyOpen && tutorialStep !== 0 && tutorialStep !== 2}
                shouldPulse={shouldPulse}
                disabled={gameMode || tutorialStep === 0 || tutorialStep === 2}
                onArrowUp={historyUp}
                onArrowDown={historyDown}
                onTabFill={() => {}}
              />
              <TerminalFooter />
            </div>

            {/* Tutorial callout overlay */}
            <AnimatePresence>
              {tutorialStep !== null && (
                <OnboardingOverlay step={tutorialStep} />
              )}
            </AnimatePresence>
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
