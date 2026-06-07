import * as THREE from 'three';
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

// Ngăn chặn menu chuột phải mặc định trong game để dùng chuột phải bắn kỹ năng
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Lắng nghe chuột trái (bắn thường) và chuột phải (kỹ năng đặc biệt) để bắn theo hướng con trỏ chuột
const onMouseDown = (e) => {
    // 0: Chuột trái (bắn thường, không tốn mana), 2: Chuột phải (bắn 5 tia, tốn 20 mana)
    if (e.button === 0 || e.button === 2) {
        // Cập nhật tia từ camera qua toạ độ chuột
        raycaster.setFromCamera(mouse, camera);
        
        // Tìm giao điểm của tia với mặt phẳng nằm ngang Y = 0
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        
        if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
            // Tính toán vector hướng từ vị trí player tới điểm click chuột trong world space
            const dirX = intersectPoint.x - playerMesh.position.x;
            const dirY = intersectPoint.z - playerMesh.position.z;
            
            if (e.button === 2) {
                // Kiểm tra mana trước khi dùng kỹ năng chuột phải
                if (player && player.mp >= 20) {
                    player.mp -= 20;
                    // Cập nhật giao diện mana ngay lập tức
                    const manaFill = document.getElementById('mana-fill');
                    if (manaFill) {
                        manaFill.style.width = `${(player.mp / player.maxMp) * 100}%`;
                    }
                    socketManager.sendShoot(dirX, dirY, true); // Bắn đạn đặc biệt (5 tia)
                } else {
                    // Hiệu ứng nhấp nháy đỏ thanh mana báo hiệu hết mana
                    const manaContainer = document.querySelector('#player-ui .bar-container:nth-of-type(2)');
                    if (manaContainer) {
                        manaContainer.style.borderColor = '#ef4444';
                        setTimeout(() => {
                            manaContainer.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        }, 150);
                    }
                }
            } else {
                socketManager.sendShoot(dirX, dirY, false); // Bắn đạn thường (1 tia)
            }
        } else {
            socketManager.sendShoot(0, 0, false);
        }
    }
};
window.addEventListener('mousedown', onMouseDown);

// 5) Entities
const bulletManager = new BulletManager(scene);
// Đặt tileSize mặc định là 1 để khớp với tỉ lệ tọa độ của Server
const mapRenderer = new MapRenderer(scene, { tileSize: 1 });
const entityManager = new EntityManager(scene, camera, textures.boss);
entityManager.player = player;

// 6) Gán references cho SocketManager
socketManager.game = {
    worldSystem,
    player,
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
socketManager.game.cameraFollowSystem = cameraFollowSystem;

// 9) Game loop
const gameLoop = wireGameLoop({
    playerController,
    player,
    scene,
    cameraFollowSystem,
    renderer,
    camera,
    mapRenderer,
    entityManager,
    bulletManager
});

// 10) Start Screen and Loading Sequence
const loading = new LoadingScreen();

const startScreen = document.getElementById('start-screen');
const btnStartGame = document.getElementById('btn-start-game');

if (btnStartGame && startScreen) {
    btnStartGame.addEventListener('click', async () => {
        // 1. Ẩn màn hình Start Screen
        startScreen.classList.add('hidden');
        startScreen.setAttribute('aria-hidden', 'true');

        // 2. Chạy màn hình Loading Screen
        try {
            await loading.fakeLoad({ durationMs: 3500 });
        } finally {
            // 3. Khởi chạy game loop sau khi load xong
            gameLoop.start();
            loading.hide();
        }
    });
} else {
    // Dự phòng
    gameLoop.start();
}

// 11) Pause button
new PauseButton({ gameLoop });