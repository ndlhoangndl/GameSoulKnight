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
import { MAP_1_HEIGHT, MAP_1_TILES, MAP_1_WIDTH } from '../game/maps/map1.js';
import { SERVER_SCALE } from '../utils/Constants.js';

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

// Raycaster & Mouse tracking để tính toán toạ độ bắn theo con trỏ chuột
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (e) => {
    // Chuyển đổi tọa độ chuột sang NDC [-1, 1]
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Lắng nghe chuột trái để bắn theo hướng con trỏ chuột
const onMouseDown = (e) => {
    if (e.button === 0) {
        // Cập nhật tia từ camera qua toạ độ chuột
        raycaster.setFromCamera(mouse, camera);
        
        // Tìm giao điểm của tia với mặt phẳng nằm ngang Y = 0
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        
        if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
            // Chuyển đổi toạ độ thế giới thực sang toạ độ server bằng cách nhân với SERVER_SCALE
            const shootX = intersectPoint.x * SERVER_SCALE;
            const shootY = intersectPoint.z * SERVER_SCALE;
            socketManager.sendShoot(shootX, shootY);
        } else {
            socketManager.sendShoot();
        }
    }
};
window.addEventListener('mousedown', onMouseDown);

// 5) Entities
const enemyManager = new EnemyManager(scene, { boss: textures.boss, boss2: textures.boss2 });
const bulletManager = new BulletManager(scene);
// Đặt tileSize mặc định là 1 để khớp với tỉ lệ tọa độ của Server
const mapRenderer = new MapRenderer(scene, { tileSize: 1 });
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
});

// Luôn dựng map mặc định ban đầu (Map 1) để tránh màn hình đen
mapRenderer.render(MAP_1_TILES, MAP_1_WIDTH, MAP_1_HEIGHT, 1);

// 8) Systems
const cameraFollowSystem = createCameraFollowSystem({ camera, targetMesh: playerMesh, mapRenderer });

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