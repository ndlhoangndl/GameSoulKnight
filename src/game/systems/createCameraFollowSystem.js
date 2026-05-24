// src/game/systems/createCameraFollowSystem.js
import * as THREE from 'three';

export function createCameraFollowSystem({ camera, targetMesh }) {
	// Đặt Camera ở độ cao 25 nhìn vuông góc trục đứng thẳng xuống sàn nhà chuẩn góc 2D
	const offset = new THREE.Vector3(0, 25, 0);

	return {
		update(dt) {
			if (!targetMesh) return;

			// Camera di chuyển tịnh tiến đồng bộ theo tâm Player
			camera.position.copy(targetMesh.position).add(offset);

			// Khóa chặt hướng nhìn vuông góc từ trên xuống
			camera.lookAt(targetMesh.position.x, targetMesh.position.y, targetMesh.position.z);
		}
	};
}