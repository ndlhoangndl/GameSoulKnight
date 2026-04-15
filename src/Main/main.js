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
import { wireGameLoop } from '../game/wireGameLoop.js';

// 1) Core context
const { scene, camera, renderer, input, textures } = createGameContext();

// 2) World
const dungeonTexture = createDungeonTexture({
	seed: 1337,
	tileCount: 14
});
createGround({ scene, texture: dungeonTexture });

// World bounds (tường đỏ quanh map)
const { bounds: worldBounds } = createWorldBounds({ scene });

// 3) Player
const { playerMesh, player, playerController } = createPlayer({
	scene,
	texture: textures.player,
	input
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
const spawnSystem = new SpawnSystem(scene, enemyManager, camera, textures.boss, textures.boss2, playerMesh);

const bullets = [];
const enemyBullets = [];

createPlayerShootSystem({
	windowTarget: window,
	camera,
	playerMesh,
	scene,
	bullets
});

	const bulletSystem = createBulletSystem({ scene, bullets, enemyManager, worldBounds });
	const enemyBulletSystem = createEnemyBulletSystem({ scene, enemyBullets, player, worldBounds });
const cameraFollowSystem = createCameraFollowSystem({ camera, targetMesh: playerMesh });

const worldBoundsSystem = createWorldBoundsSystem({ playerMesh, bounds: worldBounds });

// 6) Game loop
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
	renderer,
	camera
});

gameLoop.start();

// --- Game Over UI ---
const gameOverEl = document.getElementById('game-over');
const restartBtn = document.getElementById('btn-restart');

let gameOverShown = false;
function showGameOver() {
	if (gameOverShown) return;
	gameOverShown = true;
	if (gameOverEl) {
		gameOverEl.classList.remove('hidden');
		gameOverEl.setAttribute('aria-hidden', 'false');
	}
}

function restartGame() {
	// Cách đơn giản nhất để reset toàn bộ state hiện tại.
	window.location.reload();
}

if (restartBtn) restartBtn.addEventListener('click', restartGame);
window.addEventListener('keydown', (e) => {
	if (!gameOverShown) return;
	if (e.code === 'KeyR' || e.code === 'Enter' || e.code === 'Space') restartGame();
});

// Check chết theo frame (không sửa thêm logic entity)
function gameOverWatcher() {
	if (player.isDead) showGameOver();
	requestAnimationFrame(gameOverWatcher);
}
requestAnimationFrame(gameOverWatcher);
