import * as THREE from 'three';

export function createGround({ scene, texture }) {
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(1, 1);

	const groundGeo = new THREE.PlaneGeometry(100, 100);
	const groundMat = new THREE.MeshStandardMaterial({ map: texture });
	const ground = new THREE.Mesh(groundGeo, groundMat);
	ground.rotation.x = -Math.PI / 2;
	ground.position.y = -0.5;
	scene.add(ground);

	return { ground };
}

