import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
import { BOOT_LINES, BOOT_DURATION_MS, EASTER_EGGS, OPEN_ANIMATION, CLOSE_ANIMATION } from './config/flow'
import { CONTACT_EMAIL, CONTACT_STEP_INDEX, resolveStepArg } from './config/steps'
import { PROGRESS } from './config/constants'
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

  const { execute } = useCommands()
  const { push: historyPush, up: historyUp, down: historyDown, reset: historyReset } = useCommandHistory()

  const [isBooting, setIsBooting] = useState(true)
  const [bootProgress, setBootProgress] = useState(0)
  const bootStartRef = useRef<number>(0)

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
  const [transitioning, setTransitioning] = useState(false)
  const pendingNavRef = useRef<number | null>(null)

  // Enqueue boot lines — queue's onComplete is the single source of truth for "boot done"
  useEffect(() => {
    if (isFullyOpen && !bootEnqueuedRef.current) {
      bootEnqueuedRef.current = true
      bootStartRef.current = Date.now()
      const lines: DisplayLine[] = BOOT_LINES.map((entry, i) => ({
        id: `boot-${i}`,
        type: entry.type,
        text: entry.text,
        ...(entry.pauseAfterMs != null && { pauseAfterMs: entry.pauseAfterMs }),
      }))
      queue.enqueue(lines, 'typewriter', () => {
        // Boot finished (including last line's pauseAfterMs) — clear and start tutorial
        queue.clear()
        setIsBooting(false)
        setTutorialStep(0)
      })
    }
  }, [isFullyOpen, queue.enqueue])

  // Boot progress bar animation (cosmetic — driven by BOOT_DURATION_MS estimate)
  useEffect(() => {
    if (!isFullyOpen || !isBooting) return
    const interval = setInterval(() => {
      setBootProgress(Math.min((Date.now() - bootStartRef.current) / BOOT_DURATION_MS, 1))
    }, 50)
    return () => clearInterval(interval)
  }, [isFullyOpen, isBooting])

  // Reset all state when terminal goes idle
  useEffect(() => {
    if (!isActive) {
      queue.clear()
      historyReset()
      tourReset()
      bootEnqueuedRef.current = false
      setIsBooting(true)
      setBootProgress(0)
      setTutorialStep(null)
      pendingNavRef.current = null
      setMatrixMode(false)
      setGameMode(false)
      setTransitioning(false)
    }
  }, [isActive, queue.clear, historyReset, tourReset])

  // ESC closes terminal (unless game is active — GameRenderer handles ESC internally)
  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isActive, onClose, gameMode])

  // Handle typed command input
  const handleInput = useCallback((input: string) => {
    // Tutorial step 1: run the command normally (help), then advance
    if (tutorialStep === 1) {
      const echo: DisplayLine = { id: uid(), type: 'user', text: input }
      const result = execute(input, { currentStep, totalSteps: visibleTotal })
      queue.clear()
      queue.enqueue([echo, ...result.lines], 'stagger')
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

    // Easter egg commands → set mode immediately (tabs highlight), delay renderer
    if (easterEggRevealed && EASTER_EGGS.secret.triggers.includes(trimmed)) {
      handleEasterEgg('secret')
      setGameMode(false)
      setMatrixMode(true)
      setTransitioning(true)
      queue.clear()
      queue.enqueue([
        echo,
        { id: uid(), type: 'system', text: EASTER_EGGS.secret.message, pauseAfterMs: EASTER_EGGS.secret.pauseAfterMs },
      ], 'typewriter', () => setTransitioning(false))
      return
    }

    // Dismiss matrix mode on any other input (including 'fun')
    if (matrixMode) {
      setMatrixMode(false)
    }

    if (easterEggRevealed && EASTER_EGGS.fun.triggers.includes(trimmed)) {
      handleEasterEgg('fun')
      setMatrixMode(false)
      setGameMode(true)
      setTransitioning(true)
      queue.clear()
      queue.enqueue([
        echo,
        { id: uid(), type: 'system', text: EASTER_EGGS.fun.message, pauseAfterMs: EASTER_EGGS.fun.pauseAfterMs },
      ], 'typewriter', () => setTransitioning(false))
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
      if (stepIdx === CONTACT_STEP_INDEX) {
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
  }, [tutorialStep, isBooting, execute, historyPush, handleEasterEgg, navigateToStep, currentStep, totalSteps, queue.enqueue, queue.clear, setHasInteracted, matrixMode, gameMode])

  // Handle tab click → navigate to step directly
  const handleTabClick = useCallback((stepIndex: number) => {
    // Block tab clicks during tutorial steps 0 and 1
    if (tutorialStep !== null && tutorialStep < 2) return

    // Tutorial step 2: type farewell into terminal, navigate after pauseAfterMs
    if (tutorialStep === 2) {
      setTutorialStep(3) // blocks tabs/input during farewell
      pendingNavRef.current = stepIndex
      queue.clear()
      queue.enqueue([
        { id: uid(), type: 'system', text: "you're all set — navigate however you like.", pauseAfterMs: 1500 },
      ], 'typewriter', () => {
        // Farewell finished — navigate to the saved step
        setTutorialStep(null)
        const idx = pendingNavRef.current
        if (idx !== null) {
          setHasInteracted(true)
          const lines = navigateToStep(idx)
          queue.clear()
          queue.enqueue(lines, 'stagger')
          pendingNavRef.current = null
        }
      })
      return
    }

    // Bonus tab: Donut (index === totalSteps)
    if (stepIndex === totalSteps) {
      // ??? state → run through handleInput for full transition ceremony
      if (easterEggPhase === 'none') { handleInput('secret'); return }
      // Already revealed → direct mode switch
      setGameMode(false)
      setMatrixMode(true)
      queue.clear()
      return
    }

    // Bonus tab: Robo Hop (index === totalSteps + 1)
    if (stepIndex === totalSteps + 1) {
      // ??? state → run through handleInput for full transition ceremony
      if (easterEggPhase === 'secret') { handleInput('fun'); return }
      // Already revealed → direct mode switch
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
    if (stepIndex === CONTACT_STEP_INDEX) {
      navigator.clipboard.writeText(CONTACT_EMAIL).then(
        () => queue.enqueue([{ id: uid(), type: 'system', text: `\u2713 copied ${CONTACT_EMAIL}` }], 'stagger'),
        () => {},
      )
    }
  }, [tutorialStep, navigateToStep, totalSteps, queue.clear, queue.enqueue, setHasInteracted, handleInput, easterEggPhase])

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
  const effectiveGhostHint = tutorialStep === 1 ? 'help' : tutorialStep !== null ? '' : ghostHint

  // Unified progress: boot + onboarding + tour segments — no resets
  const totalSegments = PROGRESS.bootWeight + PROGRESS.onboardingSteps + visibleTotal
  const atEasterEgg = easterEggPhase === 'secret' || easterEggPhase === 'done'
  const inTutorialOrFarewell = tutorialStep !== null

  const { bootWeight, onboardingSteps } = PROGRESS
  const displayProgress = isBooting
    ? bootProgress * (bootWeight / totalSegments)
    : inTutorial
      ? (bootWeight + tutorialStep!) / totalSegments
      : easterEggPhase === 'done' || isComplete
        ? 1
        : easterEggPhase === 'secret'
          ? (bootWeight + onboardingSteps + visibleTotal - 1) / totalSegments
          : currentStep >= 0
            ? (bootWeight + onboardingSteps + currentStep + 1) / totalSegments
            : (bootWeight + onboardingSteps) / totalSegments

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
                matrixMode={matrixMode}
                gameMode={gameMode}
                tutorialStep={tutorialStep}
                onTabClick={handleTabClick}
                onPlayClick={handlePlayClick}
              />
              {!transitioning && gameMode ? <GameRenderer onQuit={handleGameQuit} /> : !transitioning && matrixMode ? <MatrixDonutRenderer /> : <TerminalBody lines={queue.displayLines} />}
              <TerminalInput
                isBooting={isBooting}
                hint={effectiveGhostHint}
                onSubmit={handleInput}
                shouldFocus={isFullyOpen && !gameMode && tutorialStep !== 0 && tutorialStep !== 2}
                shouldPulse={shouldPulse}
                disabled={tutorialStep === 0 || tutorialStep === 2 || tutorialStep === 3}
                inputGlow={tutorialStep === 1}
                onArrowUp={historyUp}
                onArrowDown={historyDown}
                onTabFill={() => {}}
              />
              <TerminalFooter />
            </div>

            {/* Tutorial callout overlay */}
            <AnimatePresence>
              {tutorialStep !== null && tutorialStep < 3 && (
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
                  transition={{ duration: OPEN_ANIMATION.scanMs / 1000, delay: i * 0.07, ease: 'easeInOut' }}
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
              transition={{ duration: CLOSE_ANIMATION.dotMs / 1000 }}
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
