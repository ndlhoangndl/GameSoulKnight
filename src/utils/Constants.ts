// Central place for tunable game parameters.
// Keep gameplay numbers here so you can rebalance without touching systems code.

export const ASSET_URLS = {
  map: '/map.jpg',
  player: '/Player.png',
  boss: '/boss.png'
} as const

export type CameraConfig = {
  fov: number
  near: number
  far: number
  orthoViewSize: number
  orthoZoom: number
  followHeight: number
  followZOffset: number
  offsetX: number
  offsetZ: number
  followLerp: number
  zoom: {
	min: number
	max: number
	step: number
  }
}

export const GAME_CONSTANTS = {
  world: {
	size: 60,
	groundY: -0.5,
	boundsInset: 1,
	offscreenPadding: 5
  },

  camera: {
	fov: 50,
	near: 0.1,
	far: 1000,
	// Orthographic camera (top-down) parameters
	// viewSize: world units visible at zoom=1 (higher => more zoomed out)
	orthoViewSize: 40,
	// zoom: higher => more zoomed in; lower => more zoomed out
	orthoZoom: 1.55,
	followHeight: 22,
	followZOffset: 0.01,
	// initial camera offset relative to the player (pure top-down => 0)
	offsetX: 0,
	offsetZ: 0,
	// smoothing: higher = snappier follow
	followLerp: 12,
	zoom: {
	  // For orthographic: this is camera.zoom range (lower = zoom out).
	  min: 0.7,
	  max: 2.4,
	  step: 0.08
	}
  } satisfies CameraConfig,

  player: {
	startHp: 100,
	moveSpeed: 6.5,
	contactRadius: 1.35,
	contactDps: 18,
	knockbackSpeed: 2.2
  },

  bullet: {
	radius: 0.12,
	speed: 12,
	ttlMs: 1600,
	maxCount: 60,
	collisionRadius: 1.1
  },

  enemy: {
	startCount: 6,
	maxCount: 25,
	hp: 3,
	scale: 2.2,
	seekRadius: 16,
	speedSeek: 2.6,
	speedWander: 1.4,
	wanderIntervalMs: {
	  min: 400,
	  max: 900
	},
	spawnIntervalMs: {
	  firstDelay: 1200,
	  min: 900,
	  max: 1700
	},
	spawnEdgeInset: 2
  },

  loop: {
	maxDtSeconds: 0.05
  }
} as const

