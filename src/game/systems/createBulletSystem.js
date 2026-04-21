import * as THREE from 'three';

export function createBulletSystem({ scene, bullets, enemyManager, worldBounds, manaItems = [] }) {
	return {
		update(dt) {
			for (let i = bullets.length - 1; i >= 0; i--) {
				const b = bullets[i];
				b.update(dt);

				// Remove bullet if it goes out of world bounds (hits wall)
				if (worldBounds) {
					const p = b.mesh.position;
					if (p.x < worldBounds.minX || p.x > worldBounds.maxX || p.z < worldBounds.minZ || p.z > worldBounds.maxZ) {
						b.isDead = true;
					}
				}

				for (let j = enemyManager.enemies.length - 1; j >= 0; j--) {
					const enemy = enemyManager.enemies[j];
					const dist = b.mesh.position.distanceTo(enemy.mesh.position);
					if (dist < b.radius + enemy.radius) {
						// Tính sát thương dựa trên viên đạn (mặc định 20 nếu không có)
						const damage = b.damage || 20;
						enemy.takeDamage(damage);

						b.isDead = true;

						if (enemy.isDead) {
							// Trigger global event that an enemy is killed
							const event = new CustomEvent('enemyKilled');
							window.dispatchEvent(event);

							scene.remove(enemy.mesh);
							enemyManager.enemies.splice(j, 1);

							// Drop MP Item
							const tGeo = new THREE.OctahedronGeometry(0.3);
							const tMat = new THREE.MeshPhongMaterial({ color: 0x00ffff, shininess: 100 });
							const mItem = new THREE.Mesh(tGeo, tMat);
							mItem.position.copy(enemy.mesh.position);
							mItem.position.y = 0.5;
							scene.add(mItem);
							manaItems.push(mItem);
						}
						break;
					}
				}

				if (b.isDead) {
					scene.remove(b.mesh);
					bullets.splice(i, 1);
				}
			}
		}
	};
}
