import * as THREE from 'three';
import { Enemy } from '../../Entities/Enemy/Enemy.js';


export function createEnemy({ scene, camera, variant, texture, position }) {
	if (variant === 'boss2') {
		const boss2Geo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
		const boss2Mat = new THREE.MeshStandardMaterial({ map: texture, transparent: true });
		const boss2Mesh = new THREE.Mesh(boss2Geo, boss2Mat);
		boss2Mesh.position.copy(position);
		scene.add(boss2Mesh);

		const enemy = new Enemy(boss2Mesh, 200, 0.75, {
			shotPattern: 'triple',
			fireRate: 1.5,
			attackRange: 18
		});
		enemy.setBillboardCamera(camera);
		return enemy;
	}

	// boss1 (cũ)
	const enemyGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
	const enemyMat = new THREE.MeshStandardMaterial({ map: texture, transparent: true });
	const enemyMesh = new THREE.Mesh(enemyGeo, enemyMat);
	enemyMesh.position.copy(position);
	scene.add(enemyMesh);

	const enemy = new Enemy(enemyMesh);
	enemy.setBillboardCamera(camera);
	return enemy;
}

