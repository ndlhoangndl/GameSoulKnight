
export function createEnemyBulletSystem({ scene, enemyBullets, player }) {
	return {
		update(dt) {
			for (let i = enemyBullets.length - 1; i >= 0; i--) {
				const eb = enemyBullets[i];
				eb.update(dt);

				const distToPlayer = eb.mesh.position.distanceTo(player.mesh.position);
				if (distToPlayer < 0.75 + eb.radius) {
					player.takeDamage(10);
					eb.isDead = true;
					console.log('Player bị trúng đạn! HP:', player.hp);
				}

				if (eb.isDead) {
					scene.remove(eb.mesh);
					enemyBullets.splice(i, 1);
				}
			}
		}
	};
}

