import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useBootSequence } from './hooks/useBootSequence'
import { useTerminalAnimation, SCANLINE_POSITIONS } from './hooks/useTerminalAnimation'
import { TerminalHeader } from './TerminalHeader'
import { TerminalProgress } from './TerminalProgress'
import { TerminalBody } from './TerminalBody'
import { TerminalInput } from './TerminalInput'
import { TerminalFooter } from './TerminalFooter'
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

  // Boot sequence starts only after the open animation completes
  const { lines: bootLines, isBooting, progress } = useBootSequence(isFullyOpen)

  const [userLines, setUserLines] = useState<DisplayLine[]>([])

  // Reset user lines when terminal goes idle
  useEffect(() => {
    if (!isActive) setUserLines([])
  }, [isActive])

  // ESC always closes
  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isActive, onClose])

  const handleInput = useCallback((input: string) => {
    const echo: DisplayLine = { id: uid(), type: 'user', text: input }
    if (isBooting) {
      const reply: DisplayLine = { id: uid(), type: 'system', text: 'booting\u2026 one moment.' }
      setUserLines(prev => [...prev, echo, reply])
    } else {
      setUserLines(prev => [...prev, echo])
    }
  }, [isBooting])

  const lastTypingIdx = bootLines.reduce(
    (acc, l, i) => (l.revealedChars < l.fullText.length ? i : acc), -1
  )

  const displayLines: DisplayLine[] = [
    ...bootLines.map((l, i) => ({
      id: l.id,
      type: l.type,
      text: l.fullText.slice(0, l.revealedChars),
      showCursor: i === lastTypingIdx,
    })),
    ...userLines,
  ]

  const mode: Mode = isBooting ? 'boot' : 'guided'
  const displayProgress = isBooting ? progress : 1 / 5
  const progressLabel = isBooting ? 'BOOT' : '1/5'

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
                currentStep={0}
                label={progressLabel}
              />
              <TerminalBody lines={displayLines} />
              <TerminalInput mode={mode} hint="next" onSubmit={handleInput} shouldFocus={isFullyOpen} />
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
