export const FLOOR_GRID = {
  width: 25,
  depth: 15,
  tileSize: 1,
  tilePx: 32,
  borderPx: 2,
} as const

const FLOOR_COLS = FLOOR_GRID.width / FLOOR_GRID.tileSize
const FLOOR_ROWS = FLOOR_GRID.depth / FLOOR_GRID.tileSize

export type FloorGrid = {
  cols: typeof FLOOR_COLS
  rows: typeof FLOOR_ROWS
  tilePx: typeof FLOOR_GRID.tilePx
  borderPx: typeof FLOOR_GRID.borderPx
}

export const FLOOR_CANVAS_GRID: FloorGrid = {
  cols: FLOOR_COLS,
  rows: FLOOR_ROWS,
  tilePx: FLOOR_GRID.tilePx,
  borderPx: FLOOR_GRID.borderPx,
}

export type FloorMode = {
  intervalMs: number | null
  paint: (ctx: CanvasRenderingContext2D, frame: number, grid: FloorGrid) => void
}

function paintTile(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  color: string,
  grid: FloorGrid,
) {
  const x = col * grid.tilePx
  const y = row * grid.tilePx
  ctx.fillStyle = '#000000'
  ctx.fillRect(x, y, grid.tilePx, grid.tilePx)
  ctx.fillStyle = color
  ctx.fillRect(
    x + grid.borderPx,
    y + grid.borderPx,
    grid.tilePx - grid.borderPx * 2,
    grid.tilePx - grid.borderPx * 2,
  )
}

const ROWS_PER_ZONE = 2
const ZONE_COLORS = ['#5c1a2e', '#5c4a1a', '#1a2e5c'] as const
const SLOT_ZONE_GRAY = '#7a797d'
const X_MID = FLOOR_GRID.width / 2
const Z_MID = FLOOR_GRID.depth / 2
const WANDER_ROW_START = Math.ceil(Z_MID - 0.5)

function scrollingBandColor(row: number, frame: number) {
  return ZONE_COLORS[Math.floor((row + frame) / ROWS_PER_ZONE) % ZONE_COLORS.length]
}

function tileZone(col: number, row: number): 'chat' | 'sit' | 'wander' {
  const gx = col + 0.5
  const gz = row + 0.5
  if (gz >= Z_MID) return 'wander'
  if (gx <= X_MID) return 'chat'
  return 'sit'
}

function paintZoneBands(
  ctx: CanvasRenderingContext2D,
  grid: FloorGrid,
  frame = 0,
) {
  for (let col = 0; col < grid.cols; col++) {
    for (let row = 0; row < grid.rows; row++) {
      paintTile(ctx, col, row, scrollingBandColor(row, frame), grid)
    }
  }
}

/** 紅黃藍色帶，每秒往後移 1 格 */
const scrollingBands: FloorMode = {
  intervalMs: 1000,
  paint(ctx, frame, grid) {
    paintZoneBands(ctx, grid, frame)
  },
}

/** 聊天／坐下區淺灰；亂跑區紅黃藍色帶滾動（同 scrollingBands，限亂跑區） */
const zoneSplit: FloorMode = {
  intervalMs: 1000,
  paint(ctx, frame, grid) {
    for (let col = 0; col < grid.cols; col++) {
      for (let row = 0; row < grid.rows; row++) {
        const color =
          tileZone(col, row) === 'wander'
            ? scrollingBandColor(row - WANDER_ROW_START, frame)
            : SLOT_ZONE_GRAY
        paintTile(ctx, col, row, color, grid)
      }
    }
  },
}

/** 開燈：暖色白光，不閃爍 */
const lightsOn: FloorMode = {
  intervalMs: null,
  paint(ctx, _frame, grid) {
    for (let col = 0; col < grid.cols; col++) {
      for (let row = 0; row < grid.rows; row++) {
        paintTile(ctx, col, row, '#b2b1bd', grid)
      }
    }
  },
}

/** 沒開燈：深灰格子，黑邊 */
const lightsOff: FloorMode = {
  intervalMs: null,
  paint(ctx, _frame, grid) {
    for (let col = 0; col < grid.cols; col++) {
      for (let row = 0; row < grid.rows; row++) {
        paintTile(ctx, col, row, '#1a1a1a', grid)
      }
    }
  },
}

const GRASS_BASE = '#6bc24a'
const GRASS_DARK = '#3f8f2e'

/** 約 1/23 機率深綠，斑塊分散 */
function isSparseGrassDark(col: number, row: number) {
  return (col * 19 + row * 37 + col * row * 3) % 23 === 0
}

function paintScatteredGrass(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  tilePx: number,
) {
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      ctx.fillStyle = isSparseGrassDark(col, row) ? GRASS_DARK : GRASS_BASE
      ctx.fillRect(col * tilePx, row * tilePx, tilePx, tilePx)
    }
  }
}

/** 像素風草地：綠底，稀疏方塊深綠 */
const pixelGrass: FloorMode = {
  intervalMs: null,
  paint(ctx, _frame, grid) {
    paintScatteredGrass(ctx, grid.cols, grid.rows, grid.tilePx)
  },
}

/** 大範圍草地貼圖（場地外遠處也有斑塊） */
export function makePixelGrassDataUrl(cols = 80, rows = 80, tilePx = 16) {
  const canvas = document.createElement('canvas')
  canvas.width = cols * tilePx
  canvas.height = rows * tilePx
  paintScatteredGrass(canvas.getContext('2d')!, cols, rows, tilePx)
  return canvas.toDataURL('image/png')
}

export const FLOOR_MODES = {
  scrollingBands,
  zoneSplit,
  lightsOn,
  lightsOff,
  pixelGrass,
} as const satisfies Record<string, FloorMode>

export type FloorModeId = keyof typeof FLOOR_MODES

export const DEFAULT_FLOOR_MODE: FloorModeId = 'scrollingBands'
