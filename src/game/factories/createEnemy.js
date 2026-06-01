import * as THREE from 'three';
import { Enemy } from '../../Entities/Enemy/Enemy.js';


export function createEnemy({ scene, camera, variant, texture, position }) {
	if (variant === 'boss2') {
		// Kích thước boss cân bằng (1.2)
		const boss2Geo = new THREE.PlaneGeometry(1.2, 1.2);
		const boss2Mat = new THREE.MeshBasicMaterial({
			map: texture,
			transparent: true,
			alphaTest: 0.5,
			depthWrite: false
		});
		const boss2Mesh = new THREE.Mesh(boss2Geo, boss2Mat);
		// Nằm ngang trên mặt đất để camera top-down nhìn giống sprite 2D
		boss2Mesh.rotation.x = -Math.PI / 2;
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

	// boss1 (cũ) - Giờ làm quái thường (0.8)
	const enemyGeo = new THREE.PlaneGeometry(0.8, 0.8);
	const enemyMat = new THREE.MeshBasicMaterial({
		map: texture,
		transparent: true,
		alphaTest: 0.5,
		depthWrite: false
	});
	const enemyMesh = new THREE.Mesh(enemyGeo, enemyMat);
	enemyMesh.rotation.x = -Math.PI / 2;
	enemyMesh.position.copy(position);
	scene.add(enemyMesh);

	const enemy = new Enemy(enemyMesh);
	enemy.setBillboardCamera(camera);
	return enemy;
}

