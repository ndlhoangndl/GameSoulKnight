import * as THREE from 'three';

export function createBulletSystem({ scene, bullets, enemyManager, worldBounds, manaItems = [], hpItems = [] }) {
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

							// Drop HP Item occasionally (e.g. 20% chance)
							if (Math.random() < 0.2) {
								const heartShape = new THREE.Shape();
								heartShape.moveTo(25, 25);
								heartShape.bezierCurveTo(25, 25, 20, 0, 0, 0);
								heartShape.bezierCurveTo(-30, 0, -30, 35, -30, 35);
								heartShape.bezierCurveTo(-30, 55, -10, 77, 25, 95);
								heartShape.bezierCurveTo(60, 77, 80, 55, 80, 35);
								heartShape.bezierCurveTo(80, 35, 80, 0, 50, 0);
								heartShape.bezierCurveTo(35, 0, 25, 25, 25, 25);
								const extSettings = { depth: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
								const heartGeo = new THREE.ExtrudeGeometry(heartShape, extSettings);
								heartGeo.scale(0.005, -0.005, 0.005); // flip Y because shape is upside down usually
								heartGeo.center();
								const heartMat = new THREE.MeshPhongMaterial({ color: 0xff2222, shininess: 100 });
								const hItem = new THREE.Mesh(heartGeo, heartMat);
								hItem.position.copy(enemy.mesh.position);
								hItem.position.y = 0.5;
								hItem.position.x += 0.5; // Offset slightly from MP
								scene.add(hItem);
								hpItems.push(hItem);
							}
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
