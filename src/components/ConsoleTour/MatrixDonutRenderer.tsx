import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { MatrixDonutDebug } from './MatrixDonutDebug'
import {
  clamp,
  mixHex,
  bufferToString,
  ensureMatrixState,
  makeMatrixLayers,
  makeDonutBuffer,
  DEFAULT_CONFIG,
  type MatrixState,
  type MatrixDonutConfig,
} from './utils/matrixDonut'
import { FONT_SIZES } from './config/constants'

interface Grid {
  cols: number
  rows: number
  charW: number
  charH: number
}

// Continuous responsive donut scale based on terminal column count.
function responsiveDonutScale(cols: number): number {
  return clamp(0.58 + cols * 0.001, 0.62, 0.75)
}

export function MatrixDonutRenderer() {
  const [config, setConfig] = useState<MatrixDonutConfig>({ ...DEFAULT_CONFIG })
  const [showDebug, setShowDebug] = useState(false)
  const manualScaleRef = useRef(false)

  const wrapRef = useRef<HTMLDivElement>(null)
  const probeRef = useRef<HTMLSpanElement>(null)

  // Grid lives in a ref — updated inside the animation tick for zero-lag sync.
  // State copy is only for React render (debug panel display).
  const gridRef = useRef<Grid>({ cols: 110, rows: 32, charW: 8, charH: 14 })
  const [grid, setGrid] = useState<Grid>(gridRef.current)
  const gridDirtyRef = useRef(true) // true = needs re-measurement

  const [matrixText, setMatrixText] = useState('')
  const [matrixNearText, setMatrixNearText] = useState('')
  const [matrixHeadText, setMatrixHeadText] = useState('')
  const [donutText, setDonutText] = useState('')

  const matrixStateRef = useRef<MatrixState | null>(null)

  const configRef = useRef(config)
  configRef.current = config

  const motionOK = useMemo(() => {
    if (typeof window === 'undefined') return true
    return !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  }, [])

  // Wait for web font before measuring charW — fallback fonts have different widths.
  const [fontReady, setFontReady] = useState(false)
  useEffect(() => {
    document.fonts.ready.then(() => setFontReady(true))
  }, [])

  const effectiveDonutScale = manualScaleRef.current
    ? config.donutScale
    : responsiveDonutScale(grid.cols)

  const handleConfigChange = (newConfig: MatrixDonutConfig) => {
    if (newConfig.donutScale !== config.donutScale) {
      manualScaleRef.current = true
    }
    if (newConfig.donutScale === DEFAULT_CONFIG.donutScale) {
      manualScaleRef.current = false
    }
    setConfig(newConfig)
  }

  // Ctrl+Shift+D toggles debug overlay
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        setShowDebug(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ResizeObserver just marks grid as dirty. Actual measurement happens
  // inside the animation tick (RAF) to guarantee same-frame synchronization.
  // Browser frame order: RAF → Style/Layout → ResizeObserver → Paint
  // So ResizeObserver fires AFTER our RAF. By marking dirty here, the NEXT
  // RAF tick will re-measure before generating text — zero lag.
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const ro = new ResizeObserver(() => {
      gridDirtyRef.current = true
    })
    ro.observe(el)

    return () => ro.disconnect()
  }, [])

  // Animation loop — starts only after font is loaded for accurate charW measurement.
  useEffect(() => {
    if (!motionOK || !fontReady) return

    let raf = 0
    let lastT = 0
    let lastFrameT = 0
    let A = 0
    let B = 0

    const measureGrid = (): Grid => {
      const el = wrapRef.current
      const probe = probeRef.current
      if (!el || !probe) return gridRef.current

      const rect = el.getBoundingClientRect()
      const prect = probe.getBoundingClientRect()

      const charW = Math.max(prect.width, 1)
      const charH = Math.max(prect.height, 1)

      const cols = clamp(((rect.width) / charW) | 0, 40, 260)
      const rows = clamp(((rect.height) / charH) | 0, 12, 140)

      return { cols, rows, charW, charH }
    }

    // Initial measurement
    gridRef.current = measureGrid()
    gridDirtyRef.current = false

    // Track last known container size to detect changes even without RO
    let lastContainerW = 0
    let lastContainerH = 0

    const tick = (t: number) => {
      if (!lastT) lastT = t
      const dtSec = Math.min(0.05, (t - lastT) / 1000)
      lastT = t

      // Check container size every frame — catches resizes that
      // ResizeObserver hasn't reported yet (RO fires after RAF).
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
        const g = measureGrid()
        gridRef.current = g
        setGrid(g)
      }

      const cfg = configRef.current
      const frameMs = 1000 / Math.max(10, cfg.fpsCap)
      if (t - lastFrameT >= frameMs) {
        lastFrameT = t

        const { cols, rows, charW, charH } = gridRef.current

        const ms = ensureMatrixState(matrixStateRef, cols, rows)
        const layers = makeMatrixLayers({
          cols,
          rows,
          matrixState: ms,
          dtSec,
          nowMs: t,
          rainSpeed: cfg.rainSpeed,
          trailLen: cfg.trailLen,
          shimmer: cfg.shimmer,
          stickyHeads: cfg.stickyHeads,
          headFlickerHz: cfg.headFlickerHz,
        })

        setMatrixText(bufferToString(layers.base, cols, rows))
        setMatrixNearText(bufferToString(layers.near, cols, rows))
        setMatrixHeadText(bufferToString(layers.head, cols, rows))

        A += dtSec * 1.8 * cfg.donutSpin
        B += dtSec * 1.1 * cfg.donutSpin
        // Compute scale directly from current cols — no React state lag
        const scale = manualScaleRef.current ? cfg.donutScale : responsiveDonutScale(cols)
        const donutBuf = makeDonutBuffer(A, B, cols, rows, charW, charH, scale)
        setDonutText(bufferToString(donutBuf, cols, rows))
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [motionOK, fontReady])

  const fontSize = FONT_SIZES.matrixFontSize
  const lineHeight = FONT_SIZES.matrixLineHeight
  const nearColor = mixHex(config.matrixColor, '#ffffff', clamp(config.nearMixToWhite, 0, 1))

  const preBase: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    margin: 0,
    fontFamily: 'inherit',
    fontSize,
    lineHeight,
    whiteSpace: 'pre',
    userSelect: 'none',
    overflow: 'hidden',
  }

  if (!motionOK) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-matrix-green text-sm">
        matrix donut animation paused (prefers-reduced-motion)
      </div>
    )
  }

  return (
    <div ref={wrapRef} className="flex-1 relative overflow-hidden font-mono">
      {/* Hidden probe for measuring character cell size */}
      <span
        ref={probeRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'pre',
          fontFamily: 'inherit',
          fontSize,
          lineHeight,
        }}
      >
        M
      </span>

      {/* Base matrix rain */}
      <pre style={{ ...preBase, color: config.matrixColor }}>
        {matrixText}
      </pre>

      {/* Near-head layer */}
      <pre
        style={{
          ...preBase,
          color: nearColor,
          pointerEvents: 'none',
          textShadow: '0 0 10px rgba(255,255,255,0.10)',
          opacity: 0.98,
        }}
      >
        {matrixNearText}
      </pre>

      {/* Head layer */}
      <pre
        style={{
          ...preBase,
          color: '#ffffff',
          pointerEvents: 'none',
          textShadow: config.headGlow
            ? '0 0 14px rgba(255,255,255,0.35), 0 0 28px rgba(255,255,255,0.18)'
            : 'none',
          opacity: 0.98,
        }}
      >
        {matrixHeadText}
      </pre>

      {/* Donut layer */}
      <pre
        style={{
          ...preBase,
          color: config.donutColor,
          pointerEvents: 'none',
          textShadow: '0 0 10px rgba(242,243,255,0.22)',
          opacity: 0.98,
        }}
      >
        {donutText}
      </pre>

      {/* Debug overlay (Ctrl+Shift+D) */}
      {showDebug && (
        <MatrixDonutDebug
          config={{ ...config, donutScale: effectiveDonutScale }}
          onChange={handleConfigChange}
        />
      )}
    </div>
  )
}
