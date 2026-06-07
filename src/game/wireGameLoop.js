import { GameLoop } from '../core/Gameloop.js';


export function wireGameLoop({
	playerController,
	player,
	scene,
	cameraFollowSystem,
	renderer,
	camera,
	mapRenderer,
	entityManager,
	bulletManager
}) {
	return new GameLoop(
		(dt) => {
			playerController.update(dt);
			player.update(dt); // Cập nhật vị trí cho player

			// Quái vật và Entity khác hoàn toàn dựa theo Server, chỉ gọi hàm nếu cần lookup/xoay về cam
			if (entityManager) entityManager.update(dt);
			if (bulletManager) bulletManager.update(dt);

			if (cameraFollowSystem) cameraFollowSystem.update(dt);
			if (mapRenderer) mapRenderer.update(dt);
		},
		() => {
			renderer.render(scene, camera);
		}
	);
}
