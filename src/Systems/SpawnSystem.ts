import * as THREE from 'three'

import { Enemy } from '../Entities/Enemy/Enemy'
import { EnemyManager } from '../Entities/Enemy/EnemyManager'

export class SpawnSystem {
	private spawnTimer = 0
	private readonly spawnIntervalSeconds: number
	private readonly maxEnemies: number

	private readonly scene: THREE.Scene
	private readonly enemyManager: EnemyManager
	private readonly camera: THREE.Camera
	private readonly bossTexture: THREE.Texture
	private readonly playerMesh: THREE.Object3D

	constructor(
		scene: THREE.Scene,
		enemyManager: EnemyManager,
		camera: THREE.Camera,
		bossTexture: THREE.Texture,
		playerMesh: THREE.Object3D,
		opts?: {
			spawnIntervalSeconds?: number
			maxEnemies?: number
		}
	) {
		this.scene = scene
		this.enemyManager = enemyManager
		this.camera = camera
		this.bossTexture = bossTexture
		this.playerMesh = playerMesh

		this.spawnIntervalSeconds = opts?.spawnIntervalSeconds ?? 2
		this.maxEnemies = opts?.maxEnemies ?? 30
	}

	update(dt: number) {
		this.spawnTimer += dt
		if (this.spawnTimer < this.spawnIntervalSeconds) return

		if (this.enemyManager.enemies.length < this.maxEnemies) {
			this.spawnEnemy()
		}

		this.spawnTimer = 0
	}

	private spawnEnemy() {
		// 1. Tạo vị trí ngẫu nhiên trong vòng tròn bán kính 15-20 đơn vị quanh Player
		const angle = Math.random() * Math.PI * 2
		const radius = 15 + Math.random() * 5
		const x = this.playerMesh.position.x + Math.cos(angle) * radius
		const z = this.playerMesh.position.z + Math.sin(angle) * radius

		// 2. Tạo Mesh cho quái mới (dùng bossTexture đã load sẵn)
		const enemyGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2)
		const enemyMat = new THREE.MeshStandardMaterial({
			map: this.bossTexture,
			transparent: true
		})
		const enemyMesh = new THREE.Mesh(enemyGeo, enemyMat)
		enemyMesh.position.set(x, 0.1, z)
		this.scene.add(enemyMesh)

		// 3. Đưa vào Manager
		const newEnemy = new Enemy(enemyMesh)
		newEnemy.setBillboardCamera(this.camera)
		this.enemyManager.addEnemy(newEnemy)
	}
}



