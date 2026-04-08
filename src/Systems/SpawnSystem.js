import * as THREE from 'three'
import { Enemy } from '../Entities/Enemy/Enemy.js'

export class SpawnSystem {
	constructor(scene, enemyManager, camera, bossTexture, playerMesh, opts = {}) {
		this.scene = scene;
		this.enemyManager = enemyManager;
		this.camera = camera;
		this.bossTexture = bossTexture;
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

		// 2. Tạo Mesh cho quái vật
		const enemyGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
		const enemyMat = new THREE.MeshStandardMaterial({
			map: this.bossTexture,
			transparent: true
		});
		const enemyMesh = new THREE.Mesh(enemyGeo, enemyMat);

		// Đặt vị trí và thêm vào Scene
		enemyMesh.position.set(x, 0.1, z);
		this.scene.add(enemyMesh);

		// 3. Khởi tạo đối tượng Enemy và đưa vào Manager để quản lý logic
		const newEnemy = new Enemy(enemyMesh);
		newEnemy.setBillboardCamera(this.camera);
		this.enemyManager.addEnemy(newEnemy);
	}
}