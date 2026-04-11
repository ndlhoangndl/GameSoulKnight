import * as THREE from 'three';
import { Bullet } from '../../Entities/Bullet.js';

export function createPlayerShootSystem({ windowTarget, camera, playerMesh, scene, bullets }) {
	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();
	const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
	const targetPoint = new THREE.Vector3();

	const onMouseDown = (event) => {
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);
		raycaster.ray.intersectPlane(plane, targetPoint);

		const direction = new THREE.Vector3();
		direction.subVectors(targetPoint, playerMesh.position).normalize();
		direction.y = 0;

		const bulletGeo = new THREE.SphereGeometry(0.15, 8, 8);
		const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
		const bulletMesh = new THREE.Mesh(bulletGeo, bulletMat);
		bulletMesh.position.copy(playerMesh.position);
		scene.add(bulletMesh);

		const bullet = new Bullet(bulletMesh, direction, 15);
		bullets.push(bullet);
	};

	windowTarget.addEventListener('mousedown', onMouseDown);

	return {
		dispose() {
			windowTarget.removeEventListener('mousedown', onMouseDown);
		}
	};
}

