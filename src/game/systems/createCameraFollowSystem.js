// src/game/systems/createCameraFollowSystem.js
import * as THREE from 'three';

export function createCameraFollowSystem({ camera, targetMesh, mapRenderer }) {
	const focus = new THREE.Vector3();
	const marginWorld = 0.5; // smaller margin so room fills more of the screen
	const smooth = 14; // faster follow
	const minHeight = 10;

	function computeFramingHeight(bounds) {
		const halfFovRad = THREE.MathUtils.degToRad(camera.fov * 0.5);
		const tanHalfFov = Math.tan(halfFovRad);
		const aspect = window.innerWidth / Math.max(window.innerHeight, 1);

		const halfHeightNeed = bounds.heightWorld * 0.5 + marginWorld;
		const halfWidthNeed = bounds.widthWorld * 0.5 + marginWorld;

		const fromHeight = halfHeightNeed / tanHalfFov;
		const fromWidth = halfWidthNeed / (tanHalfFov * aspect);
		return Math.max(minHeight, fromHeight, fromWidth);
	}

	const system = {
		snapNext: false,
		update(dt) {
			if (!targetMesh) return;

			const bounds = mapRenderer?.getWorldBounds?.();
			if (bounds && bounds.widthWorld > 0 && bounds.heightWorld > 0) {
							// For orthographic camera: fit viewport to bounds and clamp player near center
							if (camera && camera.fitToBounds) camera.fitToBounds(bounds, marginWorld);
							focus.set(targetMesh.position.x, 0, targetMesh.position.z);
							const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
							const halfHeight = camera._orthoHalfHeight;
							const visibleHalfHeight = halfHeight;
							const visibleHalfWidth = halfHeight * aspect;

							const minCamX = bounds.minX + visibleHalfWidth - marginWorld;
							const maxCamX = bounds.maxX - visibleHalfWidth + marginWorld;
							const minCamZ = bounds.minZ + visibleHalfHeight - marginWorld;
							const maxCamZ = bounds.maxZ - visibleHalfHeight + marginWorld;

							const desiredX = (minCamX <= maxCamX)
								? THREE.MathUtils.clamp(focus.x, minCamX, maxCamX)
								: bounds.centerX;
							const desiredZ = (minCamZ <= maxCamZ)
								? THREE.MathUtils.clamp(focus.z, minCamZ, maxCamZ)
								: bounds.centerZ;

							if (system.snapNext) {
								camera.position.x = desiredX;
								camera.position.z = desiredZ;
								system.snapNext = false;
							} else {
								camera.position.x = THREE.MathUtils.lerp(camera.position.x, desiredX, Math.min(1, dt * smooth));
								camera.position.z = THREE.MathUtils.lerp(camera.position.z, desiredZ, Math.min(1, dt * smooth));
							}
							camera.lookAt(focus.x, 0, focus.z);
				return;
			}

			// Fallback if map data not ready yet.
			focus.copy(targetMesh.position);
			const fallbackHeight = 20;
			camera.position.x = focus.x;
			camera.position.z = focus.z + 0.001;
			camera.position.y = fallbackHeight;
			camera.lookAt(focus.x, 0, focus.z);
		}
	};

	return system;
}