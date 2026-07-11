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
  intervalMs: number
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

/** 紅黃藍色帶，每秒往後移 1 格 */
const scrollingBands: FloorMode = {
  intervalMs: 1000,
  paint(ctx, frame, grid) {
    for (let col = 0; col < grid.cols; col++) {
      for (let row = 0; row < grid.rows; row++) {
        const color =
          ZONE_COLORS[
            Math.floor((row + frame) / ROWS_PER_ZONE) % ZONE_COLORS.length
          ]
        paintTile(ctx, col, row, color, grid)
      }
    }
  },
}

export const FLOOR_MODES = {
  scrollingBands,
} as const satisfies Record<string, FloorMode>

export type FloorModeId = keyof typeof FLOOR_MODES

export const DEFAULT_FLOOR_MODE: FloorModeId = 'scrollingBands'
