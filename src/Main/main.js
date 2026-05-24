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

// 2) WebSocket
const socketManager = new SocketManager();

// 3) World
const worldSystem = new WorldSystem(scene, {});

// 4) Player
const { playerMesh, player, playerController } = createPlayer({
    scene,
    texture: textures.player,
    input,
    socketManager
});

// Kết nối HP với UI
player.onHpChanged = (hp, maxHp) => {
    const hpFill = document.getElementById('hp-fill');
    if (hpFill) hpFill.style.width = `${(hp / maxHp) * 100}%`;
};

// Lắng nghe chuột trái để bắn — lưu reference để có thể cleanup sau
const onMouseDown = (e) => {
    if (e.button === 0) socketManager.sendShoot();
};
window.addEventListener('mousedown', onMouseDown);

// 5) Entities
const enemyManager = new EnemyManager(scene, { boss: textures.boss, boss2: textures.boss2 });
const bulletManager = new BulletManager(scene);
const mapRenderer = new MapRenderer(scene);
const entityManager = new EntityManager(scene, camera, textures.boss);

// 6) Gán references cho SocketManager
socketManager.game = {
    worldSystem,
    player,
    enemyManager,
    bulletManager,
    mapRenderer,
    entityManager
};

// 7) Kết nối WebSocket
socketManager.connect().catch(e => {
    console.warn('Failed to connect WebSocket', e);
    // Fallback: render map tĩnh để test khi không có server
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

// 8) Systems
const cameraFollowSystem = createCameraFollowSystem({ camera, targetMesh: playerMesh });

// 9) Game loop
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

// 10) Loading screen
const loading = new LoadingScreen();
loading.show();

try {
    await loading.fakeLoad({ durationMs: 3500 });
} finally {
    // gameLoop.start() luôn chạy dù fakeLoad có lỗi
    gameLoop.start();
    loading.hide();
}

// 11) Pause button
new PauseButton({ gameLoop });