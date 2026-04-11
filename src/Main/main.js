import * as THREE from 'three';
import { EnemyManager } from '../Entities/Enemy/EnemyManager.js';
import { CollisionSystem } from '../Systems/Collision.js';
import { SpawnSystem } from '../Systems/SpawnSystem.js';

import { createGameContext } from '../game/bootstrap/createGameContext.js';
import { createGround } from '../game/world/createGround.js';
import { createPlayer } from '../game/factories/createPlayer.js';
import { createEnemy } from '../game/factories/createEnemy.js';

import { createPlayerShootSystem } from '../game/systems/createPlayerShootSystem.js';
import { createBulletSystem } from '../game/systems/createBulletSystem.js';
import { createEnemyBulletSystem } from '../game/systems/createEnemyBulletSystem.js';
import { createCameraFollowSystem } from '../game/systems/createCameraFollowSystem.js';
import { wireGameLoop } from '../game/wireGameLoop.js';

// 1) Core context
const { scene, camera, renderer, input, textures } = createGameContext();

// 2) World
createGround({ scene, texture: textures.map });

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

const bulletSystem = createBulletSystem({ scene, bullets, enemyManager });
const enemyBulletSystem = createEnemyBulletSystem({ scene, enemyBullets, player });
const cameraFollowSystem = createCameraFollowSystem({ camera, targetMesh: playerMesh });

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
	renderer,
	camera
});

gameLoop.start();