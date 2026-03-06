// Pure math/utility functions for the matrix rain + spinning donut animation.
// Extracted from MATRIX_DONUT_REFERENCE.jsx and typed for TypeScript.

export interface Rgb {
  r: number
  g: number
  b: number
}

export interface MatrixState {
  cols: number
  drops: Float32Array
  baseSpeeds: Float32Array
  headChar: string[]
  nearChar: string[]
  lastCharUpdateMs: number
}

export interface MatrixLayerParams {
  cols: number
  rows: number
  matrixState: MatrixState
  dtSec: number
  nowMs: number
  rainSpeed: number
  trailLen: number
  shimmer: number
  stickyHeads: boolean
  headFlickerHz: number
}

export interface MatrixLayers {
  base: string[]
  near: string[]
  head: string[]
}

export interface MatrixDonutConfig {
  donutScale: number
  donutSpin: number
  rainSpeed: number
  fpsCap: number
  stickyHeads: boolean
  headFlickerHz: number
  nearMixToWhite: number
  headGlow: boolean
  shimmer: number
  trailLen: number
  matrixColor: string
  donutColor: string
}

// Half-width Katakana (U+FF71-FF89) — renders at the same cell width as ASCII
// in monospace fonts. Full-width Katakana (アイウ...) is 2x wider and breaks
// the character grid since the probe measures ASCII "M" width.
export const MATRIX_ALPHABET =
  'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const DONUT_SHADE = '.,-~:;=!*#$@'

export const DEFAULT_CONFIG: MatrixDonutConfig = {
  donutScale: 0.34,
  donutSpin: 1.0,
  rainSpeed: 1.0,
  fpsCap: 30,
  stickyHeads: true,
  headFlickerHz: 9,
  nearMixToWhite: 0.55,
  headGlow: true,
  shimmer: 0.85,
  trailLen: 14,
  matrixColor: '#65DC98',
  donutColor: '#E8E8F0',
}

export function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n))
}

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '').trim()
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const n = parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const to = (v: number) => v.toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

export function mixHex(a: string, b: string, t: number): string {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  return rgbToHex({
    r: Math.round(A.r + (B.r - A.r) * t),
    g: Math.round(A.g + (B.g - A.g) * t),
    b: Math.round(A.b + (B.b - A.b) * t),
  })
}

export function bufferToString(buf: string[], cols: number, rows: number): string {
  let s = ''
  for (let y = 0; y < rows; y++) {
    const start = y * cols
    s += buf.slice(start, start + cols).join('') + '\n'
  }
  return s
}

export function ensureMatrixState(
  stateRef: { current: MatrixState | null },
  cols: number,
  rows: number,
): MatrixState {
  const s = stateRef.current
  if (!s || s.cols !== cols) {
    const drops = new Float32Array(cols)
    const baseSpeeds = new Float32Array(cols)
    const headChar = new Array<string>(cols)
    const nearChar = new Array<string>(cols)

    // Preserve existing columns on resize (avoids rain gaps)
    const preserve = s ? Math.min(s.cols, cols) : 0
    for (let i = 0; i < preserve; i++) {
      drops[i] = s!.drops[i]
      baseSpeeds[i] = s!.baseSpeeds[i]
      headChar[i] = s!.headChar[i]
      nearChar[i] = s!.nearChar[i]
    }

    // New columns: scatter within visible area so rain appears immediately
    for (let i = preserve; i < cols; i++) {
      drops[i] = Math.random() * rows
      baseSpeeds[i] = 8 + Math.random() * 28
      headChar[i] = MATRIX_ALPHABET[(Math.random() * MATRIX_ALPHABET.length) | 0]
      nearChar[i] = MATRIX_ALPHABET[(Math.random() * MATRIX_ALPHABET.length) | 0]
    }

    stateRef.current = {
      cols, drops, baseSpeeds, headChar, nearChar,
      lastCharUpdateMs: s?.lastCharUpdateMs ?? 0,
    }
  }
  return stateRef.current!
}

export function maybeUpdateStickyChars(
  matrixState: MatrixState,
  nowMs: number,
  stickyHeads: boolean,
  headFlickerHz: number,
): void {
  if (!stickyHeads) return

  const intervalMs = 1000 / Math.max(0.1, headFlickerHz)
  if (nowMs - matrixState.lastCharUpdateMs < intervalMs) return

  matrixState.lastCharUpdateMs = nowMs

  for (let x = 0; x < matrixState.cols; x++) {
    if (Math.random() < 0.7) {
      matrixState.headChar[x] = MATRIX_ALPHABET[(Math.random() * MATRIX_ALPHABET.length) | 0]
    }
    if (Math.random() < 0.55) {
      matrixState.nearChar[x] = MATRIX_ALPHABET[(Math.random() * MATRIX_ALPHABET.length) | 0]
    }
  }
}

export function makeMatrixLayers(params: MatrixLayerParams): MatrixLayers {
  const { cols, rows, matrixState, dtSec, nowMs, rainSpeed, trailLen, shimmer, stickyHeads, headFlickerHz } = params
  const size = cols * rows
  const base = new Array<string>(size).fill(' ')
  const near = new Array<string>(size).fill(' ')
  const head = new Array<string>(size).fill(' ')

  maybeUpdateStickyChars(matrixState, nowMs, stickyHeads, headFlickerHz)

  for (let x = 0; x < cols; x++) {
    matrixState.drops[x] += matrixState.baseSpeeds[x] * rainSpeed * dtSec
    const headY = matrixState.drops[x] | 0

    for (let t = 0; t < trailLen; t++) {
      const y = headY - t
      if (y < 0 || y >= rows) continue

      const idx = x + y * cols

      let ch: string
      if (t === 0 && stickyHeads) {
        ch = matrixState.headChar[x]
        if (Math.random() < shimmer * 0.08) {
          ch = MATRIX_ALPHABET[(Math.random() * MATRIX_ALPHABET.length) | 0]
        }
      } else if (t === 1 && stickyHeads) {
        ch = matrixState.nearChar[x]
        if (Math.random() < shimmer * 0.06) {
          ch = MATRIX_ALPHABET[(Math.random() * MATRIX_ALPHABET.length) | 0]
        }
      } else {
        ch = MATRIX_ALPHABET[(Math.random() * MATRIX_ALPHABET.length) | 0]
      }

      base[idx] = ch
      if (t === 0) head[idx] = ch
      else if (t === 1) near[idx] = ch
    }

    // respawn
    if (matrixState.drops[x] - trailLen > rows && Math.random() < 0.06) {
      matrixState.drops[x] = -Math.random() * rows
      matrixState.baseSpeeds[x] = 8 + Math.random() * 28
      if (stickyHeads) {
        matrixState.headChar[x] = MATRIX_ALPHABET[(Math.random() * MATRIX_ALPHABET.length) | 0]
        matrixState.nearChar[x] = MATRIX_ALPHABET[(Math.random() * MATRIX_ALPHABET.length) | 0]
      }
    }
  }

  return { base, near, head }
}

export function makeDonutBuffer(
  A: number,
  B: number,
  cols: number,
  rows: number,
  charW: number,
  charH: number,
  donutScale: number,
): string[] {
  const size = cols * rows
  const zbuf = new Float32Array(size)
  const out = new Array<string>(size).fill(' ')

  const cosA = Math.cos(A), sinA = Math.sin(A)
  const cosB = Math.cos(B), sinB = Math.sin(B)

  const R1 = 1
  const R2 = 2
  const K2 = 5

  const aspect = charH / charW
  const baseCols = Math.min(cols, rows * aspect)

  const K1x = ((baseCols * K2 * 3) / (8 * (R1 + R2))) * donutScale
  const K1y = K1x * (charW / charH)

  for (let theta = 0; theta < Math.PI * 2; theta += 0.07) {
    const cost = Math.cos(theta), sint = Math.sin(theta)

    for (let phi = 0; phi < Math.PI * 2; phi += 0.02) {
      const cosp = Math.cos(phi), sinp = Math.sin(phi)

      const circlex = R2 + R1 * cost
      const circley = R1 * sint

      const x = circlex * (cosB * cosp + sinA * sinB * sinp) - circley * cosA * sinB
      const y = circlex * (sinB * cosp - sinA * cosB * sinp) + circley * cosA * cosB
      const z = K2 + cosA * circlex * sinp + circley * sinA

      const ooz = 1 / z

      const xp = (cols / 2 + K1x * ooz * x) | 0
      const yp = (rows / 2 - K1y * ooz * y) | 0

      const L =
        cosp * cost * sinB -
        cosA * cost * sinp -
        sinA * sint +
        cosB * (cosA * sint - cost * sinA * sinp)

      if (L > 0 && xp >= 0 && xp < cols && yp >= 0 && yp < rows) {
        const idx = xp + yp * cols
        if (ooz > zbuf[idx]) {
          zbuf[idx] = ooz
          const lum = clamp((L * 8) | 0, 0, DONUT_SHADE.length - 1)
          out[idx] = DONUT_SHADE[lum]
        }
      }
    }
  }

  return out
}
