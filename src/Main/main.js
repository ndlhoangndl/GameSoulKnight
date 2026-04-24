import * as THREE from 'three';
import { EnemyManager } from '../Entities/Enemy/EnemyManager.js';
import { CollisionSystem } from '../Systems/Collision.js';
import { SpawnSystem } from '../Systems/SpawnSystem.js';

import { createGameContext } from '../game/bootstrap/createGameContext.js';
import { createGround } from '../game/world/createGround.js';
import { createWorldBounds } from '../game/world/createWorldBounds.js';
import { createDungeonTexture } from '../game/world/createDungeonTexture.js';
import { createPlayer } from '../game/factories/createPlayer.js';
import { createEnemy } from '../game/factories/createEnemy.js';

import { createPlayerShootSystem } from '../game/systems/createPlayerShootSystem.js';
import { createBulletSystem } from '../game/systems/createBulletSystem.js';
import { createEnemyBulletSystem } from '../game/systems/createEnemyBulletSystem.js';
import { createCameraFollowSystem } from '../game/systems/createCameraFollowSystem.js';
import { createWorldBoundsSystem } from '../game/systems/createWorldBoundsSystem.js';
import { createItemSystem } from '../game/systems/createItemSystem.js';

import { setupStormLogic } from '../game/events/setupStormLogic.js';
import { setupGameOverWatcher } from '../game/events/setupGameOverWatcher.js';

import { wireGameLoop } from '../game/wireGameLoop.js';
import { LoadingScreen } from '../UI/LoadingScreen.js';
import { PauseButton } from '../UI/PauseButton.js';
import { SocketManager } from '../core/SocketManager.js';

// 1) Core context
const { scene, camera, renderer, input, textures } = createGameContext();

// WebSocket (Networking) - Initialize early
const socketManager = new SocketManager();

// We can catch state updates from server
socketManager.onStateUpdate = (snapshot) => {
    // For now just log occasionally or keep reference, will be used later
    // to sync entities when multiplayer is fully mapped.
};

// Start connection in background
socketManager.connect().catch(e => console.warn('Failed to connect WebSocket', e));

// 2) World
const dungeonTexture = createDungeonTexture({
	seed: 1337,
	tileCount: 28
});
const { ground } = createGround({ scene, texture: dungeonTexture });

// World bounds (tường đỏ quanh map)
const { bounds: worldBounds } = createWorldBounds({ scene });

// 3) Player
const { playerMesh, player, playerController } = createPlayer({
	scene,
	texture: textures.player,
	input,
	socketManager
});

// 4) Enemies
const enemyManager = new EnemyManager();

// Enemy 1 (cũ): boss.png, bắn 1 viên
enemyManager.addEnemy(
	createEnemy({
		scene,
		camera,
		variant: 'boss1',
		texture: textures.boss,
		position: new THREE.Vector3(10, 0.25, -10)
	})
);

// Enemy 2 (mới): boss2.png, bắn 3 viên
enemyManager.addEnemy(
	createEnemy({
		scene,
		camera,
		variant: 'boss2',
		texture: textures.boss2,
		position: new THREE.Vector3(-10, 0.25, -10)
	})
);

// 5) Systems
const collisionSystem = new CollisionSystem(player, enemyManager);
const spawnSystem = new SpawnSystem(scene, enemyManager, camera, textures.boss, textures.boss2, playerMesh, {
	spawnIntervalSeconds: 1.5,
	maxEnemies: 20,
	boss2Rate: 0.05 // Reduce boss2 spawn rate in map 1
});

const bullets = [];
const enemyBullets = [];
const manaItems = [];
const hpItems = [];

createPlayerShootSystem({
	windowTarget: window,
	camera,
	playerMesh,
	player,
	scene,
	bullets
});

const bulletSystem = createBulletSystem({ scene, bullets, enemyManager, worldBounds, manaItems, hpItems });
const enemyBulletSystem = createEnemyBulletSystem({ scene, enemyBullets, player, worldBounds });
const cameraFollowSystem = createCameraFollowSystem({ camera, targetMesh: playerMesh });

const worldBoundsSystem = createWorldBoundsSystem({ playerMesh, bounds: worldBounds });

const itemSystem = createItemSystem({ scene, player, manaItems, hpItems });

setupStormLogic(player, ground, spawnSystem);

// 7) Game loop
const gameLoop = wireGameLoop({
	spawnSystem,
	playerController,
	player,
	enemyManager,
	scene,
	enemyBullets,
	collisionSystem,
	bulletSystem,
	enemyBulletSystem,
	cameraFollowSystem,
	worldBoundsSystem,
	itemSystem,
	renderer,
	camera
});

// --- Loading on entry (UI only) ---
const loading = new LoadingScreen();
loading.show();

await loading.fakeLoad({ durationMs: 3500 });

// Start game only after loading hits 100%
gameLoop.start();
loading.hide();

// Pause button (top-right)
new PauseButton({ gameLoop });

setupGameOverWatcher(player);
