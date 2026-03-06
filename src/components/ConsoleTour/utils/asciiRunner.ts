// ═══════════════════════════════════
//  ASCII Runner — pure game logic
// ═══════════════════════════════════

// --- Types ---

export interface Obstacle {
  id: number
  x: number
  y: number
  w: number
  h: number
  sprite: string[]
}

export interface GameState {
  started: boolean
  gameOver: boolean
  paused: boolean
  t: number
  score: number
  best: number
  speed: number
  py: number
  pvy: number
  onGround: boolean
  runFrame: number
  runAnimT: number
  landFlashT: number
  jumping: boolean
  jumpHoldTime: number
  spaceHeld: boolean
  obstacles: Obstacle[]
  nextId: number
  distSinceSpawn: number
  nextSpawnDist: number
  scrollOffset: number
}

export interface GameFrame {
  teal: string
  warmGray: string
  silver: string
  amber: string
}

// --- Locked Constants ---

const GRAVITY = 115
const JUMP_V = -37
const HOLD_ACCEL = -60
const HOLD_MAX_TIME = 0.26
const RELEASE_GRAV = 160
const RELEASE_CUT = 0.20
const MAX_FALL = 75

const BASE_SPEED = 33
const SPEED_RAMP = 3.00
const MAX_SPEED = 65

const REACTION_TIME = 0.35
const GAP_JITTER = 0.40
const MAX_OBS = 5
const BIG_CHANCE = 0.40

export const PLAYER_X = 10

// Extra rows below floor for instructions
const GROUND_OFFSET = 5

// --- Sprites ---

const ROBOT_RUN_A = [
  "  `|     ",
  "   |     ",
  " ((O O)) ",
  "  |----|  ",
  "  /====\\ ",
  "(O) || (O)",
  "  |____|  ",
  "   /  \\  ",
  " (OOOO)  ",
]
const ROBOT_RUN_B = [
  "  `\\     ",
  "   |     ",
  " ((O O)) ",
  "  |----|  ",
  "  /====\\ ",
  "(O) || (O)",
  "  |____|  ",
  "   /  \\  ",
  " (OQQO)  ",
]
const ROBOT_JUMP = [
  "  .^     ",
  "   |     ",
  " ((O O)) ",
  "  |----|  ",
  "  /====\\ ",
  "(O) || (O)",
  "  |____|  ",
  "   \\  /  ",
  "  (OOOO) ",
]
const ROBOT_LAND = [
  "  `|     ",
  "   |     ",
  " ((O O)) ",
  "  |~~~~|  ",
  "  /====\\ ",
  "(O) || (O)",
  "  |____|  ",
  "  //  \\\\ ",
  " (OOOO)  ",
]
const ROBOT_DEAD = [
  "  `|     ",
  "   |     ",
  " ((X X)) ",
  "  |----|  ",
  "  /====\\ ",
  "(O) || (O)",
  "  |____|  ",
  "  //  \\\\ ",
  " (OOOO)  ",
]

const VIRUS_SMALL = [" /~~\\ ", "(####)", " \\~~/ "]
const VIRUS_BIG = ["  /~~\\  ", " /####\\ ", "(######)", " \\####/ ", "  \\~~/  "]

const ROBOT_H = ROBOT_RUN_A.length
const ROBOT_W = Math.max(...ROBOT_RUN_A.map(l => l.length))

// --- Helpers ---

function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v))
}

function aabb(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  const px = 2, py = 1
  return ax + px < bx + bw - px && ax + aw - px > bx + px && ay + py < by + bh && ay + ah > by
}

function drawSprite(grid: string[][], x: number, y: number, sprite: string[]): void {
  for (let r = 0; r < sprite.length; r++) {
    const line = sprite[r]
    for (let c = 0; c < line.length; c++) {
      if (line[c] === ' ') continue
      const gy = y + r
      const gx = Math.floor(x) + c
      if (gy >= 0 && gy < grid.length && gx >= 0 && gx < grid[0].length) {
        grid[gy][gx] = line[c]
      }
    }
  }
}

function drawTextAt(grid: string[][], row: number, startCol: number, text: string): void {
  for (let i = 0; i < text.length; i++) {
    const c = startCol + i
    if (row >= 0 && row < grid.length && c >= 0 && c < grid[0].length) {
      grid[row][c] = text[i]
    }
  }
}

function drawTextCentered(grid: string[][], row: number, cols: number, text: string): void {
  drawTextAt(grid, row, Math.floor((cols - text.length) / 2), text)
}

function makeGrid(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ' '))
}

function gridToString(grid: string[][]): string {
  return grid.map(row => row.join('')).join('\n')
}

function computeNextSpawnDist(speed: number): number {
  const maxJumpTime = (2 * Math.abs(JUMP_V)) / GRAVITY + HOLD_MAX_TIME
  const minGapTime = maxJumpTime + REACTION_TIME
  const minDist = speed * minGapTime
  const maxDist = speed * (minGapTime + GAP_JITTER)
  return Math.floor(clamp(minDist + Math.random() * (maxDist - minDist), 38, 160))
}

// --- Game State ---

export function makeGame(cols: number, rows: number): GameState {
  const groundY = rows - GROUND_OFFSET
  return {
    started: false,
    gameOver: false,
    paused: false,
    t: 0,
    score: 0,
    best: 0,
    speed: BASE_SPEED,
    py: groundY - ROBOT_H,
    pvy: 0,
    onGround: true,
    runFrame: 0,
    runAnimT: 0,
    landFlashT: 0,
    jumping: false,
    jumpHoldTime: 0,
    spaceHeld: false,
    obstacles: [],
    nextId: 0,
    distSinceSpawn: 0,
    nextSpawnDist: Math.floor(cols * 0.5),
    scrollOffset: 0,
  }
}

export function stepGame(g: GameState, dt: number, cols: number, rows: number): void {
  if (g.paused || !g.started || g.gameOver) return

  const groundY = rows - GROUND_OFFSET

  g.t += dt
  g.speed = clamp(BASE_SPEED + g.t * SPEED_RAMP, BASE_SPEED, MAX_SPEED)
  g.score = Math.floor(g.t * 10)
  g.scrollOffset += g.speed * dt

  // Move obstacles
  for (const o of g.obstacles) o.x -= g.speed * dt
  g.obstacles = g.obstacles.filter(o => o.x + o.w > -5)

  // Spawn
  if (g.obstacles.length < MAX_OBS) {
    g.distSinceSpawn += g.speed * dt
    if (g.distSinceSpawn >= g.nextSpawnDist) {
      const useBig = Math.random() < BIG_CHANCE
      const sprite = useBig ? VIRUS_BIG : VIRUS_SMALL
      const h = sprite.length
      const w = Math.max(...sprite.map(l => l.length))
      g.obstacles.push({ id: g.nextId++, x: cols + 2, y: groundY - h, w, h, sprite })
      g.distSinceSpawn = 0
      g.nextSpawnDist = computeNextSpawnDist(g.speed)
    }
  }

  // Player physics
  if (!g.onGround) {
    if (g.jumping && g.spaceHeld && g.jumpHoldTime < HOLD_MAX_TIME) {
      g.pvy += HOLD_ACCEL * dt
      g.jumpHoldTime += dt
    }
    const grav = g.pvy > 0 ? RELEASE_GRAV : GRAVITY
    g.pvy += grav * dt
    g.pvy = Math.min(g.pvy, MAX_FALL)
    g.py += g.pvy * dt
    if (g.py >= groundY - ROBOT_H) {
      g.py = groundY - ROBOT_H
      g.pvy = 0
      g.onGround = true
      g.jumping = false
      g.jumpHoldTime = 0
      g.landFlashT = 0.10
    }
  } else {
    if (g.landFlashT > 0) g.landFlashT -= dt
    g.runAnimT += dt
    if (g.runAnimT >= 0.14) {
      g.runAnimT = 0
      g.runFrame = g.runFrame === 0 ? 1 : 0
    }
  }

  // Collision
  for (const o of g.obstacles) {
    if (aabb(PLAYER_X, g.py, ROBOT_W, ROBOT_H, o.x, o.y, o.w, o.h)) {
      g.gameOver = true
      g.started = false
      if (g.score > g.best) g.best = g.score
      break
    }
  }
}

export function renderGame(g: GameState, cols: number, rows: number): GameFrame {
  const groundY = rows - GROUND_OFFSET

  const tealGrid = makeGrid(rows, cols)
  const warmGrayGrid = makeGrid(rows, cols)
  const silverGrid = makeGrid(rows, cols)
  const amberGrid = makeGrid(rows, cols)

  // TEAL: ceiling + floor
  for (let x = 0; x < cols; x++) {
    if (rows > 3) {
      tealGrid[0][x] = '='
      tealGrid[1][x] = '-'
      tealGrid[2][x] = '='
    }
    if (groundY >= 0 && groundY < rows) tealGrid[groundY][x] = '\u2500'
    if (groundY + 1 >= 0 && groundY + 1 < rows) tealGrid[groundY + 1][x] = '='
  }

  // WARMGRAY: HUD
  const sec = Math.floor(g.t % 60)
  const min = Math.floor(g.t / 60)
  const scoreStr = `UPTIME: ${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  const bestSec = Math.floor((g.best / 10) % 60)
  const bestMin = Math.floor(g.best / 10 / 60)
  const bestStr = `BEST: ${String(bestMin).padStart(2, '0')}:${String(bestSec).padStart(2, '0')}`
  if (rows > 4) {
    drawTextAt(warmGrayGrid, 4, 2, scoreStr)
    drawTextAt(warmGrayGrid, 4, cols - bestStr.length - 2, bestStr)
  }

  // AMBER: virus sprites
  for (const o of g.obstacles) drawSprite(amberGrid, Math.floor(o.x), o.y, o.sprite)

  // SILVER: robot sprite
  let sprite: string[]
  if (g.gameOver) sprite = ROBOT_DEAD
  else if (!g.onGround) sprite = ROBOT_JUMP
  else if (g.landFlashT > 0) sprite = ROBOT_LAND
  else sprite = g.runFrame === 0 ? ROBOT_RUN_A : ROBOT_RUN_B
  drawSprite(silverGrid, PLAYER_X, Math.round(g.py), sprite)

  // Instruction row below floor
  const instrRow = groundY + 3

  // State-dependent overlays + instructions
  const playTop = 3
  const playBottom = groundY - 1
  const midRow = Math.floor((playTop + playBottom) / 2)

  if (g.gameOver) {
    // AMBER: death message in play area
    drawTextCentered(amberGrid, midRow, cols, '[ SYSTEM COMPROMISED ]')
    // WARMGRAY: restart hint below floor
    drawTextCentered(warmGrayGrid, instrRow, cols, 'SPACE to reboot  \u00B7  ESC quit')
  } else if (g.paused) {
    // WARMGRAY: pause label in play area
    drawTextCentered(warmGrayGrid, midRow, cols, '[ PAUSED ]')
    // WARMGRAY: resume hint below floor
    drawTextCentered(warmGrayGrid, instrRow, cols, 'P resume  \u00B7  ESC quit')
  } else if (!g.started) {
    // WARMGRAY: control instructions below floor only
    drawTextCentered(warmGrayGrid, instrRow, cols, 'SPACE jump (hold = higher)  \u00B7  P pause  \u00B7  ESC quit')
  } else {
    // Active gameplay: keep instructions visible
    drawTextCentered(warmGrayGrid, instrRow, cols, 'SPACE jump (hold = higher)  \u00B7  P pause  \u00B7  ESC quit')
  }

  return {
    teal: gridToString(tealGrid),
    warmGray: gridToString(warmGrayGrid),
    silver: gridToString(silverGrid),
    amber: gridToString(amberGrid),
  }
}

export function handleSpaceDown(g: GameState, cols: number, rows: number): void {
  const groundY = rows - GROUND_OFFSET
  if (g.gameOver) {
    const best = g.best
    Object.assign(g, makeGame(cols, rows))
    g.best = best
    g.started = true
    return
  }
  if (!g.started) {
    g.started = true
    g.paused = false
    g.t = 0
    g.score = 0
    g.obstacles = []
    g.speed = BASE_SPEED
    g.distSinceSpawn = 0
    g.nextSpawnDist = Math.floor(cols * 0.5)
    g.py = groundY - ROBOT_H
    g.pvy = 0
    g.onGround = true
    g.scrollOffset = 0
    return
  }
  g.spaceHeld = true
  if (g.onGround) {
    g.onGround = false
    g.pvy = JUMP_V
    g.jumping = true
    g.jumpHoldTime = 0
    g.landFlashT = 0
  }
}

export function handleSpaceUp(g: GameState): void {
  g.spaceHeld = false
  if (g.jumping && g.pvy < 0) g.pvy *= RELEASE_CUT
}
