import * as THREE from 'three';


export function createCameraFollowSystem({ camera, targetMesh }) {
	// Soul Knight-ish top-down: high Y, almost no Z offset.
	const offset = new THREE.Vector3(0, 15, 0.01);

	return {
		update() {
			camera.position.copy(targetMesh.position).add(offset);
			camera.lookAt(targetMesh.position.x, 0, targetMesh.position.z);
		}
	};
}

