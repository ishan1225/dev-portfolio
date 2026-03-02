import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { TIMING } from '../components/ConsoleTour/constants'

// Timings come from constants.ts — tweak them there to affect both this test and the real site
const FLASH_DURATION    = TIMING.openFlash
const SCANLINE_DURATION = TIMING.openScan
const COMPRESS_DURATION = TIMING.closeCompress
const LINE_DURATION     = TIMING.closeLine
const DOT_DURATION      = TIMING.closeDot

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

const SCANLINE_POSITIONS = [8, 22, 38, 54, 68, 84] // % from top

type Phase = 'idle' | 'flash' | 'scan' | 'open' | 'compress' | 'line' | 'dot'

// ------------------------------------------------------------
// Static terminal placeholder — real terminal uses typewriter boot sequence
// ------------------------------------------------------------
function TerminalContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="bg-deep-teal/40 border-b border-deep-teal px-3.5 py-2 flex items-center gap-2.5">
        <span className="text-mint-glow font-bold text-[13px] tracking-[2px] flex-1">CONSOLE TOUR</span>
        <span className="bg-warm-gray text-deep-space text-[9px] font-bold tracking-[1px] px-[7px] py-0.5 rounded-[3px]">
          BOOTING
        </span>
        <button
          onClick={onClose}
          className="bg-transparent border-0 text-warm-gray text-sm font-bold cursor-pointer px-0.5 leading-none hover:text-near-white transition-colors outline-none"
        >
          ×
        </button>
      </div>

      <div className="px-3.5 pt-2 pb-1.5 border-b border-deep-teal">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="flex-1 h-1 bg-deep-teal rounded-sm overflow-hidden">
            <div className="h-full w-[30%] bg-gradient-to-r from-matrix-green to-mint-glow rounded-sm" />
          </div>
          <span className="text-warm-gray text-[9px]">BOOT</span>
        </div>
        <div className="flex gap-1">
          {['About', 'Project 1', 'Project 2', 'Project 3', 'Contact'].map(tab => (
            <span key={tab} className="px-2 py-[3px] rounded-[3px] text-[9px] font-semibold bg-deep-teal/50 text-muted-purple opacity-40">
              {tab}
            </span>
          ))}
        </div>
      </div>

      <div className="px-3.5 py-3 min-h-[160px] text-xs">
        {[
          { prefix: 'sys', text: 'initializing console\u2026', border: 'var(--color-warm-gray)', prefixCls: 'text-matrix-green min-w-7', textCls: 'text-warm-gray' },
          { prefix: 'sys', text: 'loading portfolio data\u2026', border: 'var(--color-warm-gray)', prefixCls: 'text-matrix-green min-w-7', textCls: 'text-warm-gray' },
          { prefix: '\u2192', text: 'hello there.', border: 'var(--color-mint-glow)', prefixCls: 'text-mint-glow min-w-4', textCls: 'text-silver' },
          { prefix: '\u2192', text: 'you found something most people skip.', border: 'var(--color-mint-glow)', prefixCls: 'text-mint-glow min-w-4', textCls: 'text-silver' },
        ].map((line, i) => (
          <div key={i} className="flex gap-2.5 leading-[1.7] pl-2.5 mb-0.5" style={{ borderLeft: `3px solid ${line.border}` }}>
            <span className={`${line.prefixCls} font-semibold shrink-0`}>{line.prefix}</span>
            <span className={line.textCls}>{line.text}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3.5 py-2 bg-deep-teal/20 border-t border-deep-teal">
        <span className="text-matrix-green font-bold text-sm leading-none">›</span>
        <span className="text-muted-purple text-xs italic">booting\u2026</span>
      </div>

      <div className="border-t border-deep-teal px-3.5 py-[5px] text-center text-muted-purple text-[9px] tracking-[1px]">
        ESC exit · TAB fill · ENTER run
      </div>
    </>
  )
}

// ------------------------------------------------------------
// Main page
// ------------------------------------------------------------
export function AnimationTest() {
  // Use refs alongside state so async callbacks always see current values
  const [phase, _setPhase] = useState<Phase>('idle')
  const phaseRef = useRef<Phase>('idle')
  function setPhase(p: Phase) { phaseRef.current = p; _setPhase(p) }

  const [animating, _setAnimating] = useState(false)
  const animatingRef = useRef(false)
  function setAnimating(v: boolean) { animatingRef.current = v; _setAnimating(v) }

  const termCtrl = useAnimation()
  const backdropCtrl = useAnimation()

  const isActive = phase !== 'idle'
  const isClosingVisual = phase === 'line' || phase === 'dot'

  // ESC to close — stable handler via refs, no stale closure issues
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phaseRef.current === 'open' && !animatingRef.current) {
        triggerClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  async function runOpen() {
    // Reset controller before starting so there's no stale end-state from a previous close
    termCtrl.set({ opacity: 0, scale: 0.97, scaleX: 1, scaleY: 1, filter: 'brightness(1)', x: 0 })
    backdropCtrl.set({ opacity: 0 })

    // 1. Flash — scale overshoot, opacity 0→1
    setPhase('flash')
    termCtrl.start({ opacity: 1, scale: [0.97, 1.003, 1.0], transition: { duration: FLASH_DURATION / 1000, times: [0, 0.6, 1] } })
    backdropCtrl.start({ opacity: 1, transition: { duration: (FLASH_DURATION / 1000) * 0.5 } })
    await sleep(FLASH_DURATION)

    // 2. Scanlines — glitch lines flicker + content jitters horizontally
    setPhase('scan')
    termCtrl.start({
      x: [0, -3, 2, -2, 3, -1, 2, -1, 0],
      transition: { duration: SCANLINE_DURATION / 1000, times: [0, 0.1, 0.25, 0.38, 0.52, 0.65, 0.78, 0.9, 1], ease: 'linear' },
    })
    await sleep(SCANLINE_DURATION)

    // 3. Visible
    termCtrl.set({ x: 0 })
    setPhase('open')
    setAnimating(false)
  }

  async function runClose() {
    // 1. Compress — squish vertically, slight horizontal stretch, brightness spikes
    setPhase('compress')
    termCtrl.start({
      scaleY: 0.003, scaleX: 1.01, filter: 'brightness(3)',
      transition: { duration: COMPRESS_DURATION / 1000, ease: [0.7, 0, 1, 0.3] },
    })
    backdropCtrl.start({ opacity: 0, transition: { duration: (COMPRESS_DURATION / 1000) * 0.8 } })
    await sleep(COMPRESS_DURATION)

    // 2. Line — thin glowing gradient bar (applied via React state, see terminal style below)
    setPhase('line')
    await sleep(LINE_DURATION)

    // 3. Dot — line collapses width to 0, afterglow fades
    setPhase('dot')
    termCtrl.start({ scaleX: 0, opacity: 0, transition: { duration: (DOT_DURATION * 0.65) / 1000, ease: 'easeIn' } })
    await sleep(DOT_DURATION)

    // Done
    setPhase('idle')
    setAnimating(false)
  }

  function triggerOpen() {
    if (animatingRef.current || phaseRef.current !== 'idle') return
    setAnimating(true)
    runOpen()
  }

  function triggerClose() {
    if (animatingRef.current || phaseRef.current !== 'open') return
    setAnimating(true)
    runClose()
  }

  function handleToggle() {
    if (phase === 'idle') triggerOpen()
    else if (phase === 'open') triggerClose()
  }

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center font-mono">

      {/* Phase debug label */}
      <div className="fixed top-4 left-4 z-[100] text-[10px] tracking-widest">
        <span className="text-warm-gray">phase: </span>
        <span className="text-matrix-green">{phase}</span>
      </div>

      {/* Toggle button — always on top and interactable */}
      <p className="text-warm-gray text-[11px] tracking-[2px] mb-8 relative z-[100]">ANIMATION TEST</p>
      <button
        onClick={handleToggle}
        disabled={animating}
        className="relative z-[100] bg-transparent border border-matrix-green text-matrix-green font-mono text-[13px] font-semibold tracking-[1px] px-7 py-3 rounded-md cursor-pointer hover:bg-matrix-green/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {phase === 'idle' ? 'open terminal' : 'close terminal'}
      </button>

      {/* ── Backdrop ── always in DOM, hidden via CSS when idle to avoid mount flash */}
      <motion.div
        animate={backdropCtrl}
        className="fixed inset-0 bg-void/70 backdrop-blur-sm z-40 pointer-events-none"
        style={{ visibility: isActive ? 'visible' : 'hidden' }}
      />

      {/* ── Terminal ── always in DOM for same reason */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 px-4"
        style={{
          visibility: isActive ? 'visible' : 'hidden',
          // Allow clicks through to the page button unless terminal is fully open
          pointerEvents: phase === 'open' ? 'auto' : 'none',
        }}
      >
        <div className="relative w-full" style={{ maxWidth: '780px' }}>

          {/* Main terminal wrapper */}
          <motion.div
            animate={termCtrl}
            className="w-full border border-deep-teal rounded-xl overflow-hidden flex flex-col font-mono"
            style={{
              transformOrigin: 'center center',
              // In line/dot phases: becomes a glowing gradient bar
              background: isClosingVisual
                ? 'linear-gradient(90deg, transparent 0%, var(--color-matrix-green) 30%, var(--color-mint-glow) 50%, var(--color-matrix-green) 70%, transparent 100%)'
                : 'var(--color-deep-space)',
              boxShadow: isClosingVisual
                ? '0 0 16px var(--color-matrix-green), 0 0 32px var(--color-mint-glow)'
                : 'none',
            }}
          >
            {/* Fade out content as terminal starts compressing */}
            <div style={{ opacity: phase === 'compress' || isClosingVisual ? 0 : 1 }}>
              <TerminalContent onClose={triggerClose} />
            </div>
          </motion.div>

          {/* Scanlines overlay */}
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
                  transition={{ duration: SCANLINE_DURATION / 1000, delay: i * 0.07, ease: 'easeInOut' }}
                />
              ))}
            </div>
          )}

          {/* Afterglow — radial glow that lingers after the dot collapses */}
          {phase === 'dot' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 0 }}
              transition={{ duration: DOT_DURATION / 1000 }}
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
    </div>
  )
}
