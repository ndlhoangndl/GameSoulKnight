import { GameLoop } from '../core/Gameloop.js';

/**
 * Gom toàn bộ update/render callback cho GameLoop để main.js chỉ còn compose.
 * Giữ nguyên thứ tự update từ main.js cũ.
 */
export function wireGameLoop({
	spawnSystem,
	playerController,
	player,
	enemyManager,
	scene,
	enemyBullets,
	collisionSystem,
	bulletSystem,
	enemyBulletSystem,
	cameraFollowSystem,
	renderer,
	camera
}) {
	return new GameLoop(
		(dt) => {
			spawnSystem.update(dt);

			playerController.update();
			player.update(dt);

			for (const enemy of enemyManager.enemies) {
				if (enemy && typeof enemy.update === 'function') {
					enemy.update(dt, player, scene, enemyBullets);
				}
			}

			collisionSystem.update();

			bulletSystem.update(dt);
			enemyBulletSystem.update(dt);

			cameraFollowSystem.update(dt);
		},
		() => {
			renderer.render(scene, camera);
		}
	);
}

