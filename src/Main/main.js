import * as THREE from 'three';
import { EnemyManager } from '../Entities/Enemy/EnemyManager.js';
import { BulletManager } from '../Entities/BulletManager.js';

import { createGameContext } from '../game/bootstrap/createGameContext.js';
import { WorldSystem } from '../game/world/createWorldBounds.js';
import { createPlayer } from '../game/factories/createPlayer.js';

import { createCameraFollowSystem } from '../game/systems/createCameraFollowSystem.js';

import { wireGameLoop } from '../game/wireGameLoop.js';
import { LoadingScreen } from '../UI/LoadingScreen.js';
import { PauseButton } from '../UI/PauseButton.js';
import { SocketManager } from '../core/SocketManager.js';
import { MapRenderer } from '../game/systems/MapRenderer.js';
import { EntityManager } from '../game/systems/EntityManager.js';

// 1) Core context
const { scene, camera, renderer, input, textures } = createGameContext();

// WebSocket (Networking) - Initialize early
const socketManager = new SocketManager();

// We can catch state updates from server
socketManager.onStateUpdate = () => {
    // For now just log occasionally or keep reference, will be used later
    // to sync entities when multiplayer is fully mapped.
};

// 2) World
const textureLoader = new THREE.TextureLoader();
const mapTexture = textureLoader.load('/map.jpg');

// Tạo ground cũ bị vô hiệu hóa vì chúng ta xây map theo Tile của BE
// createGround({ scene, texture: mapTexture, size: 2000 });

// Sử dụng texture cũ cho sàn để design khớp với base map BE
const floorTextures = { floor: mapTexture };

// World bounds
const worldSystem = new WorldSystem(scene, floorTextures);

// 3) Player
const { playerMesh, player, playerController } = createPlayer({
	scene,
	texture: textures.player,
	input,
	socketManager
});

// Click chuột gọi thẳng API Shoot của Server
window.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Chuột trái
        socketManager.sendShoot();
    }
});

// 4) Entities Managers
const enemyManager = new EnemyManager(scene, { boss: textures.boss, boss2: textures.boss2 });
const bulletManager = new BulletManager(scene);

const mapRenderer = new MapRenderer(scene);
const entityManager = new EntityManager(scene, camera, textures.boss);

// Update SocketManager references
socketManager.game = {
    worldSystem,
    player,
    enemyManager,
    bulletManager,
    mapRenderer,
    entityManager
};

// NOW start connection, so it doesn't miss the first RoomSwitch
socketManager.connect().catch(e => {
    console.warn('Failed to connect WebSocket', e);
    // Nếu rớt lạng kết nối thì mock dữ liệu map tĩnh cho ông ý xem thử Map Renderer có hoạt động không
    mapRenderer.render([
        0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
        2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0
    ], 16, 16);
});

// 5) Systems
const cameraFollowSystem = createCameraFollowSystem({ camera, targetMesh: playerMesh });

// 7) Game loop
const gameLoop = wireGameLoop({
        playerController,
        player,
        enemyManager,
        scene,
        cameraFollowSystem,
        renderer,
        camera,
        mapRenderer,
        entityManager,
        bulletManager
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