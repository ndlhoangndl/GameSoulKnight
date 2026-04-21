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
import { wireGameLoop } from '../game/wireGameLoop.js';
import { LoadingScreen } from '../UI/LoadingScreen.js';
import { PauseButton } from '../UI/PauseButton.js';

// 1) Core context
const { scene, camera, renderer, input, textures } = createGameContext();

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

// Lưu trạng thái trước bão để khôi phục
let originalSpawnInterval = spawnSystem.spawnIntervalSeconds;
let originalMaxEnemies = spawnSystem.maxEnemies;
let originalBoss2Rate = spawnSystem.boss2Rate;
let originalGroundColor = 0x555555; // default dungeon color or what it was. Let's get it from ground material if possible. We can just hardcode or save it.

function startStorm() {
	if (player.isStormActive) return;

	player.isStormActive = true;
	player.stormTimeRemaining = 20; // 20 giây

	// Save original states if this is first storm
	originalSpawnInterval = spawnSystem.spawnIntervalSeconds;
	originalMaxEnemies = spawnSystem.maxEnemies;
	originalBoss2Rate = spawnSystem.boss2Rate;
	originalGroundColor = ground.material.color.getHex();

	// --- Storm Visuals ---
	ground.material.color.setHex(0xff5533);

	// --- Storm Difficulty ---
	spawnSystem.spawnIntervalSeconds = 0.5;
	spawnSystem.maxEnemies = 60;
	spawnSystem.boss2Rate = 0.25;

	const stormUI = document.getElementById('storm-ui');
	if (stormUI) {
		stormUI.style.display = 'block';
		stormUI.innerText = `Bão Quái: 20s`;
	}

	player.updateKillUI();
}

window.addEventListener('endStorm', () => {
	if (!player.isStormActive) return;

	player.isStormActive = false;
	player.nextStormKills = player.kills + 40; // Giết thêm 40 quái để có bão tiếp

	// Khôi phục
	ground.material.color.setHex(originalGroundColor);
	spawnSystem.spawnIntervalSeconds = 1.5;
	spawnSystem.maxEnemies = 20;
	spawnSystem.boss2Rate = 0.05;

	player.updateKillUI();
});

// Lắng nghe sự kiện tiêu diệt quái vật để lên Map
window.addEventListener('enemyKilled', () => {
	if (player.isDead) return;
	
	player.addKill();

	// Kích hoạt bão quái
	if (!player.isStormActive && player.kills >= player.nextStormKills) {
		startStorm();
	}
});

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
