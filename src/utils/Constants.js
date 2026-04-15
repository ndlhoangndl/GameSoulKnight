// Nơi tập trung tất cả các thông số có thể điều chỉnh của game.
export const ASSET_URLS = {
	map: '/map.jpg',
	player: '/Player.png',
	boss: '/boss.png',
	boss2: '/boss2.png'
};

export const GAME_CONSTANTS = {
	world: {
		// Kích thước map/ground (createGround đang dùng PlaneGeometry(100,100))
		size: 100,
		groundY: -0.5,
		boundsInset: 1,
		offscreenPadding: 5
	},

	camera: {
		fov: 50,
		near: 0.1,
		far: 1000,
		orthoViewSize: 40,
		orthoZoom: 1.55,
		followHeight: 22,
		followZOffset: 0.01,
		offsetX: 0,
		offsetZ: 0,
		followLerp: 12,
		zoom: {
			min: 0.7,
			max: 2.4,
			step: 0.08
		}
	},

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

};