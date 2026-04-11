import * as THREE from 'three';


export function createCameraFollowSystem({ camera, targetMesh }) {
	const offset = new THREE.Vector3(0, 15, 10);

	return {
		update() {
			camera.position.copy(targetMesh.position).add(offset);
			camera.lookAt(targetMesh.position);
		}
	};
}

