import { useState, useRef, useEffect } from 'react'
import { useAnimation } from 'framer-motion'
import { TIMING } from '../constants'

export type AnimPhase = 'idle' | 'flash' | 'scan' | 'open' | 'compress' | 'line' | 'dot'

export const SCANLINE_POSITIONS = [8, 22, 38, 54, 68, 84] // % from top

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

/**
 * Drives the terminal open ("signal acquisition") and close ("CRT power-off") animations.
 * Responds to changes in `isOpen` from the parent.
 */
export function useTerminalAnimation(isOpen: boolean) {
  const [phase, _setPhase] = useState<AnimPhase>('idle')
  const phaseRef = useRef<AnimPhase>('idle')
  const setPhase = (p: AnimPhase) => { phaseRef.current = p; _setPhase(p) }

  const termCtrl = useAnimation()
  const backdropCtrl = useAnimation()

  useEffect(() => {
    if (isOpen && phaseRef.current === 'idle') {
      runOpen()
    } else if (!isOpen) {
      const p = phaseRef.current
      if (p === 'open') {
        runClose()
      } else if (p === 'flash' || p === 'scan') {
        // Closed before open animation finished — snap to idle immediately
        termCtrl.stop()
        backdropCtrl.stop()
        termCtrl.set({ opacity: 0, scale: 1, scaleX: 1, scaleY: 1, filter: 'brightness(1)', x: 0 })
        backdropCtrl.set({ opacity: 0 })
        setPhase('idle')
      }
    }
  }, [isOpen])

  async function runOpen() {
    termCtrl.set({ opacity: 0, scale: 0.97, scaleX: 1, scaleY: 1, filter: 'brightness(1)', x: 0 })
    backdropCtrl.set({ opacity: 0 })

    // 1. Flash — scale overshoot, opacity 0→1
    setPhase('flash')
    termCtrl.start({ opacity: 1, scale: [0.97, 1.003, 1.0], transition: { duration: TIMING.openFlash / 1000, times: [0, 0.6, 1] } })
    backdropCtrl.start({ opacity: 1, transition: { duration: (TIMING.openFlash / 1000) * 0.5 } })
    await sleep(TIMING.openFlash)

    // 2. Scanlines — glitch lines + horizontal jitter
    setPhase('scan')
    termCtrl.start({
      x: [0, -3, 2, -2, 3, -1, 2, -1, 0],
      transition: { duration: TIMING.openScan / 1000, times: [0, 0.1, 0.25, 0.38, 0.52, 0.65, 0.78, 0.9, 1], ease: 'linear' },
    })
    await sleep(TIMING.openScan)

    // 3. Visible
    termCtrl.set({ x: 0 })
    setPhase('open')
  }

  async function runClose() {
    // 1. Compress — squish vertically, brightness spikes
    setPhase('compress')
    termCtrl.start({
      scaleY: 0.003, scaleX: 1.01, filter: 'brightness(3)',
      transition: { duration: TIMING.closeCompress / 1000, ease: [0.7, 0, 1, 0.3] },
    })
    backdropCtrl.start({ opacity: 0, transition: { duration: (TIMING.closeCompress / 1000) * 0.8 } })
    await sleep(TIMING.closeCompress)

    // 2. Line — thin glowing bar (visual applied in component via phase check)
    setPhase('line')
    await sleep(TIMING.closeLine)

    // 3. Dot — line collapses to zero width, afterglow fades
    setPhase('dot')
    termCtrl.start({ scaleX: 0, opacity: 0, transition: { duration: (TIMING.closeDot * 0.65) / 1000, ease: 'easeIn' } })
    await sleep(TIMING.closeDot)

    // Reset for next open
    setPhase('idle')
    termCtrl.set({ opacity: 0, scale: 1, scaleX: 1, scaleY: 1, filter: 'brightness(1)', x: 0 })
    backdropCtrl.set({ opacity: 0 })
  }

  return {
    phase,
    termCtrl,
    backdropCtrl,
    isActive:      phase !== 'idle',
    isFullyOpen:   phase === 'open',
    isClosingVisual: phase === 'line' || phase === 'dot',
  }
}
