import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  makeGame,
  stepGame,
  renderGame,
  handleSpaceDown,
  handleSpaceUp,
  type GameState,
  type GameFrame,
} from './utils/asciiRunner'

interface Props {
  onQuit: (score: number) => void
}

const FONT_SIZE = '16px'
const LINE_HEIGHT = '20px'

export function GameRenderer({ onQuit }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const probeRef = useRef<HTMLSpanElement>(null)
  const gameRef = useRef<GameState | null>(null)
  const gridDirtyRef = useRef(true)
  const colsRef = useRef(80)
  const rowsRef = useRef(30)

  const [frame, setFrame] = useState<GameFrame>({ teal: '', warmGray: '', silver: '', amber: '' })
  const [fontReady, setFontReady] = useState(false)

  const motionOK = useMemo(() => {
    if (typeof window === 'undefined') return true
    return !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  }, [])

  useEffect(() => {
    document.fonts.ready.then(() => setFontReady(true))
  }, [])

  // ResizeObserver marks grid as dirty
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => { gridDirtyRef.current = true })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Animation loop
  useEffect(() => {
    if (!motionOK || !fontReady) return

    const measureGrid = () => {
      const el = wrapRef.current
      const probe = probeRef.current
      if (!el || !probe) return

      const rect = el.getBoundingClientRect()
      const prect = probe.getBoundingClientRect()
      const charW = Math.max(prect.width, 1)
      const charH = Math.max(prect.height, 1)

      colsRef.current = Math.max(40, Math.floor(rect.width / charW))
      rowsRef.current = Math.max(12, Math.floor(rect.height / charH))
    }

    measureGrid()
    gridDirtyRef.current = false
    gameRef.current = makeGame(colsRef.current, rowsRef.current)

    let raf = 0
    let lastT = 0
    let lastContainerW = 0
    let lastContainerH = 0

    const tick = (t: number) => {
      if (!lastT) lastT = t
      const dt = Math.min(0.035, (t - lastT) / 1000)
      lastT = t

      const el = wrapRef.current
      if (el) {
        const w = el.clientWidth
        const h = el.clientHeight
        if (w !== lastContainerW || h !== lastContainerH) {
          lastContainerW = w
          lastContainerH = h
          gridDirtyRef.current = true
        }
      }

      if (gridDirtyRef.current) {
        gridDirtyRef.current = false
        measureGrid()
      }

      const g = gameRef.current
      if (g) {
        stepGame(g, dt, colsRef.current, rowsRef.current)
        setFrame(renderGame(g, colsRef.current, rowsRef.current))
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [motionOK, fontReady])

  // Keyboard — capture phase + stopImmediatePropagation to prevent ConsoleTour ESC
  useEffect(() => {
    if (!motionOK || !fontReady) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        e.stopImmediatePropagation()
        const g = gameRef.current
        if (g) handleSpaceDown(g, colsRef.current, rowsRef.current)
      } else if (e.key.toLowerCase() === 'p') {
        e.stopImmediatePropagation()
        const g = gameRef.current
        if (g && g.started && !g.gameOver) g.paused = !g.paused
      } else if (e.key.toLowerCase() === 'q') {
        e.stopImmediatePropagation()
        e.preventDefault()
        const g = gameRef.current
        onQuit(g ? g.score : 0)
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        e.stopImmediatePropagation()
        const g = gameRef.current
        if (g) handleSpaceUp(g)
      }
    }

    window.addEventListener('keydown', onKeyDown, { capture: true })
    window.addEventListener('keyup', onKeyUp, { capture: true })
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true })
      window.removeEventListener('keyup', onKeyUp, { capture: true })
    }
  }, [motionOK, fontReady, onQuit])

  const handleMouseDown = () => {
    const g = gameRef.current
    if (g) handleSpaceDown(g, colsRef.current, rowsRef.current)
  }
  const handleMouseUp = () => {
    const g = gameRef.current
    if (g) handleSpaceUp(g)
  }

  if (!motionOK) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-matrix-green text-sm">
        ascii runner paused (prefers-reduced-motion)
      </div>
    )
  }

  const preBase: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    margin: 0,
    fontFamily: 'inherit',
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    whiteSpace: 'pre',
    userSelect: 'none',
    overflow: 'hidden',
    pointerEvents: 'none',
  }

  return (
    <div
      ref={wrapRef}
      className="flex-1 relative overflow-hidden font-mono"
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {/* Hidden probe for measuring character cell size */}
      <span
        ref={probeRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'pre',
          fontFamily: 'inherit',
          fontSize: FONT_SIZE,
          lineHeight: LINE_HEIGHT,
        }}
      >
        M
      </span>

      {/* Teal layer: ceiling + floor lines */}
      <pre style={{ ...preBase, color: 'var(--color-deep-teal)' }}>
        {frame.teal}
      </pre>

      {/* WarmGray layer: HUD, instructions, pause text */}
      <pre style={{ ...preBase, color: 'var(--color-warm-gray)' }}>
        {frame.warmGray}
      </pre>

      {/* Silver layer: robot */}
      <pre style={{ ...preBase, color: 'var(--color-silver)' }}>
        {frame.silver}
      </pre>

      {/* Amber layer: viruses + death message */}
      <pre style={{ ...preBase, color: 'var(--color-amber)' }}>
        {frame.amber}
      </pre>
    </div>
  )
}
