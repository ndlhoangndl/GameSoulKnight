export function createEnemyBulletSystem({ scene, enemyBullets, player, worldBounds }) {
	return {
		update(dt) {
			for (let i = enemyBullets.length - 1; i >= 0; i--) {
				const eb = enemyBullets[i];
				eb.update(dt);

				// Remove enemy bullet if it goes out of bounds
				if (worldBounds) {
					const p = eb.mesh.position;
					if (p.x < worldBounds.minX || p.x > worldBounds.maxX || p.z < worldBounds.minZ || p.z > worldBounds.maxZ) {
						eb.isDead = true;
					}
				}

				// Check collision with player if the bullet is not yet dead
				if (!eb.isDead) {
					const distToPlayer = eb.mesh.position.distanceTo(player.mesh.position);
					if (distToPlayer < 0.75 + eb.radius) {
						player.takeDamage(10);
						eb.isDead = true;
						console.log('Player bị trúng đạn! HP:', player.hp);
					}
				}

				if (eb.isDead) {
					scene.remove(eb.mesh);
					enemyBullets.splice(i, 1);
				}
			}
		}
	};
}
