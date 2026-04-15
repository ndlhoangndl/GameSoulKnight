import * as THREE from 'three'
import { Enemy } from '../Entities/Enemy/Enemy.js'

export class SpawnSystem {
	constructor(scene, enemyManager, camera, bossTexture, boss2Texture, playerMesh, opts = {}) {
		this.scene = scene;
		this.enemyManager = enemyManager;
		this.camera = camera;
		this.bossTexture = bossTexture;
		this.boss2Texture = boss2Texture;
		this.playerMesh = playerMesh;

		// Sử dụng giá trị mặc định nếu không có opts truyền vào
		this.spawnIntervalSeconds = opts.spawnIntervalSeconds ?? 2;
		this.maxEnemies = opts.maxEnemies ?? 30;
		this.spawnTimer = 0;
	}

	update(dt) {
		this.spawnTimer += dt;

		// Nếu chưa đến thời điểm spawn thì thoát
		if (this.spawnTimer < this.spawnIntervalSeconds) return;

		// Kiểm tra xem số lượng quái trên sân đã đạt giới hạn chưa
		if (this.enemyManager.enemies.length < this.maxEnemies) {
			this.spawnEnemy();
		}

		// Reset bộ đếm thời gian
		this.spawnTimer = 0;
	}

	spawnEnemy() {


		// Giúp quái xuất hiện từ ngoài màn hình và bao vây người chơi
		const angle = Math.random() * Math.PI * 2;
		const radius = 15 + Math.random() * 5;
		const x = this.playerMesh.position.x + Math.cos(angle) * radius;
		const z = this.playerMesh.position.z + Math.sin(angle) * radius;

		// 2. Tạo Mesh cho quái vật (sprite 2D)
		const enemyGeo = new THREE.PlaneGeometry(2.0, 2.0);
		// Random spawn: 80% enemy thường (boss.png, bắn 1 viên) + 20% boss2 (bắn 3 viên)
		const roll = Math.random();
		const isBoss2 = roll < 0.2;
		const texture = isBoss2 ? this.boss2Texture : this.bossTexture;

		const enemyMat = new THREE.MeshBasicMaterial({
			map: texture,
			transparent: true,
			alphaTest: 0.5,
			depthWrite: false
		});
		const enemyMesh = new THREE.Mesh(enemyGeo, enemyMat);
		enemyMesh.rotation.x = -Math.PI / 2;

		// Đặt vị trí và thêm vào Scene
		enemyMesh.position.set(x, 0.1, z);
		this.scene.add(enemyMesh);

		// 3. Khởi tạo đối tượng Enemy và đưa vào Manager để quản lý logic
		const newEnemy = isBoss2
			? new Enemy(enemyMesh, 200, 0.75, { shotPattern: 'triple', fireRate: 1.0, attackRange: 18 })
			: new Enemy(enemyMesh);
		newEnemy.setBillboardCamera(this.camera);
		this.enemyManager.addEnemy(newEnemy);
	}
}