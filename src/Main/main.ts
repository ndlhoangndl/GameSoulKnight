import * as THREE from 'three'

import { Scene } from '../core/Scene'
import { Renderer } from '../core/Renderer'
import { Camera } from '../core/camera'
import { GameLoop } from '../core/Gameloop'

import { Player } from '../Entities/Player/Player'
import { PlayerController } from '../Entities/Player/PlayerControl'
import { Bullet } from '../Entities/Bullet'
import { Enemy } from '../Entities/Enemy/Enemy' // Nhớ import thêm Enemy để tạo quái
import { EnemyManager } from '../Entities/Enemy/EnemyManager'

import { CollisionSystem } from '../Systems/Collision'
import { Input } from '../Systems/Input'
import { SpawnSystem } from '../Systems/SpawnSystem'

const scene = new Scene();
const camera = new Camera();
const renderer = new Renderer();
const input = new Input();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Mặt phẳng ảo trùng với mặt đất
const targetPoint = new THREE.Vector3(); // Nơi viên đạn sẽ hướng tới
// KHỞI TẠO LOADER & ÁNH SÁNG ---
const loader = new THREE.TextureLoader();

// Ánh sáng rất quan trọng để thấy được ảnh (Texture)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

//  TẠO PLAYER
const playerTexture = loader.load('/Player.png');
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshStandardMaterial({
	map: playerTexture,
	transparent: true
});
const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(playerMesh);

const player = new Player(playerMesh);
const playerController = new PlayerController(player, input);

// DÁN MAP (MẶT ĐẤT)
const mapTexture = loader.load('/map.jpg');
mapTexture.wrapS = THREE.RepeatWrapping;
mapTexture.wrapT = THREE.RepeatWrapping;
mapTexture.repeat.set(1, 1);

const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshStandardMaterial({ map: mapTexture });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
scene.add(ground);


const enemyManager = new EnemyManager();

const bossTexture = loader.load('/boss.png');
const enemyGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const enemyMat = new THREE.MeshStandardMaterial({ map: bossTexture, transparent: true });
const enemyMesh = new THREE.Mesh(enemyGeo, enemyMat);
enemyMesh.position.set(10, 0.25, -10);
scene.add(enemyMesh);

const enemy = new Enemy(enemyMesh);
enemy.setBillboardCamera(camera);
enemyManager.addEnemy(enemy);

// HỆ THỐNG VA CHẠM
const collisionSystem = new CollisionSystem(player, enemyManager);

// PHẦN BẮN ĐẠN
const bullets: Bullet[] = [];

const spawnSystem = new SpawnSystem(scene, enemyManager, camera, bossTexture, playerMesh)

window.addEventListener('mousedown', (event) => {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	//Tìm điểm giao nhau giữa tia chuột và mặt đất
	raycaster.setFromCamera(mouse, camera);
	raycaster.ray.intersectPlane(plane, targetPoint);

	// Tính hướng
	const direction = new THREE.Vector3();
	direction.subVectors(targetPoint, playerMesh.position).normalize();
	direction.y = 0; // Đảm bảo đạn không bay lên trời hay chui xuống đất

	//Tạo Mesh cho đạn
	const bulletGeo = new THREE.SphereGeometry(0.15, 8, 8);
	const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
	const bulletMesh = new THREE.Mesh(bulletGeo, bulletMat);
	bulletMesh.position.copy(playerMesh.position);
	scene.add(bulletMesh);
	// yạo đối tượng Bullet và đưa vào danh sách quản lý
	const bullet = new Bullet(bulletMesh, direction, 15); // Tốc độ đạn
	bullets.push(bullet);
});
// KHỞI ĐỘNG GAME LOOP
const gameLoop = new GameLoop(
	(dt) => {
		// Spawn enemy theo thời gian
		spawnSystem.update(dt)

		// Cập nhật logic
		playerController.update();
		player.update(dt);
		enemyManager.update(dt, player);
		collisionSystem.update();

		// Cập nhật đạn + kiểm tra trúng quái + dọn đạn
		for (let i = bullets.length - 1; i >= 0; i--) {
			const b = bullets[i];
			b.update(dt);

			// Kiểm tra va chạm giữa viên đạn b và danh sách kẻ địch
			for (let j = enemyManager.enemies.length - 1; j >= 0; j--) {
				const enemy = enemyManager.enemies[j];

				// Tính khoảng cách giữa đạn và quái
				const dist = b.mesh.position.distanceTo(enemy.mesh.position);
				const hitThreshold = b.radius + enemy.radius;

				if (dist < hitThreshold) {
					// Trừ máu quái (Ví dụ mỗi viên đạn gây 20 sát thương)
					enemy.takeDamage(20);

					//  Đánh dấu đạn đã chết để xóa đi
					b.isDead = true;

					//  Hiệu ứng: Nếu quái hết máu thì xóa quái
					if (enemy.isDead) {
						scene.remove(enemy.mesh);
						enemyManager.enemies.splice(j, 1);
						console.log("Kẻ địch đã bị tiêu diệt!");
					}
					break; // Một viên đạn chỉ trúng 1 con quái rồi biến mất
				}
			}

			// Xóa đạn khỏi màn hình nếu nó đã trúng đích hoặc hết thời gian
			if (b.isDead) {
				scene.remove(b.mesh);
				bullets.splice(i, 1);
			}
		}
		// --- CAMERA DI CHUYỂN THEO PLAYER ---
		const offset = new THREE.Vector3(0, 15, 10);
		camera.position.copy(playerMesh.position).add(offset);
		camera.lookAt(playerMesh.position);
	},
	() => {
		// Vẽ lên màn hình
		renderer.render(scene, camera);
	}
);

gameLoop.start();