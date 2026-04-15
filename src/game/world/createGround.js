import * as THREE from 'three';
import { GAME_CONSTANTS } from '../../utils/Constants.js';


export function createGround({ scene, texture, material, size } = {}) {
	const groundSize = size ?? GAME_CONSTANTS.world.size;
	if (texture) {
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(1, 1);
	}

	const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize);
	const groundMat = material ?? new THREE.MeshStandardMaterial({ map: texture });
	const ground = new THREE.Mesh(groundGeo, groundMat);
	ground.rotation.x = -Math.PI / 2;
	ground.position.y = GAME_CONSTANTS.world.groundY;
	scene.add(ground);

	return { ground };
}

