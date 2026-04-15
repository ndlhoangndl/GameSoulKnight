export function createBulletSystem({ scene, bullets, enemyManager, worldBounds }) {
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
						enemy.takeDamage(20);
						b.isDead = true;

						if (enemy.isDead) {
							scene.remove(enemy.mesh);
							enemyManager.enemies.splice(j, 1);
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
