import type { FloorModeId } from './floorModes'

/** 背景 + 地板一組 */
export type VenueTheme = {
  /** Canvas CSS 背景色 */
  canvasBackground: string
  floorMode: FloorModeId
  starfield: {
    enabled: boolean
    count: number
    color: string
    size: number
    /** 弧度／秒 */
    spin: number
  }
  sun: {
    enabled: boolean
    position: [number, number, number]
    color: string
    radius: number
  }
  /** 遠處大面積地面（鏡頭看不到地板邊緣下方） */
  horizonGround: {
    enabled: boolean
    size: number
    color: string
  }
}

const STARFIELD_OFF = {
  enabled: false,
  count: 0,
  color: '#ffffff',
  size: 0,
  spin: 0,
} as const

const SUN_OFF = {
  enabled: false,
  position: [0, 0, 0] as [number, number, number],
  color: '#ffffff',
  radius: 0,
}

const HORIZON_OFF = {
  enabled: false,
  size: 0,
  color: '#000000',
}

/** 分區地板 + 場外星空 */
export const starNight: VenueTheme = {
  canvasBackground: '#04040c',
  floorMode: 'zoneSplit',
  starfield: {
    enabled: true,
    count: 1400,
    color: '#dce6ff',
    size: 0.18,
    spin: 0.012,
  },
  sun: SUN_OFF,
  horizonGround: HORIZON_OFF,
}

/** 藍天太陽 + 像素草地 */
export const grassDay: VenueTheme = {
  canvasBackground: '#5eb3ef',
  floorMode: 'pixelGrass',
  starfield: STARFIELD_OFF,
  sun: {
    enabled: true,
    position: [18, 22, -28],
    color: '#ffe566',
    radius: 3.2,
  },
  horizonGround: {
    enabled: true,
    size: 400,
    color: '#6bc24a',
  },
}

export const VENUE_THEMES = {
  starNight,
  grassDay,
} as const satisfies Record<string, VenueTheme>

export type VenueThemeId = keyof typeof VENUE_THEMES

export const DEFAULT_VENUE: VenueThemeId = 'starNight'

export const VENUE_THEME_IDS = Object.keys(VENUE_THEMES) as VenueThemeId[]

console.assert(VENUE_THEME_IDS.includes('grassDay'), 'grassDay theme missing')
