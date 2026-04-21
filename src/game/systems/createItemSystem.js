export function createItemSystem({ scene, player, manaItems = [] }) {
	const rotationSpeed = 2; // radians per sec
	return {
		update(dt) {
			if (!player || player.isDead) return;
			const pPos = player.mesh.position;
			const pRad = player.radius;

			for (let i = manaItems.length - 1; i >= 0; i--) {
				const item = manaItems[i];
				item.rotation.y += rotationSpeed * dt;
				item.rotation.x += rotationSpeed * 0.5 * dt;

				// Float animation
				item.position.y = 0.5 + Math.sin(Date.now() * 0.003 + i) * 0.1;

				const dist = pPos.distanceTo(item.position);
				if (dist < pRad + 0.4) {
					// Collect (20 MP per drop)
					player.addMana(20);
					scene.remove(item);
					manaItems.splice(i, 1);
				}
			}
		}
	};
}

