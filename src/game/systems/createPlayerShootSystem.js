import * as THREE from 'three';
import { Bullet } from '../../Entities/Bullet.js';

export function createPlayerShootSystem({ windowTarget, camera, playerMesh, player, scene, bullets }) {
	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();
	const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
	const targetPoint = new THREE.Vector3();

	const onMouseDown = (event) => {
		// Ngăn chặn hành vi mặc định (ví dụ menu chuột phải) nếu có
		// Tuy nhiên thường thì mousedown không đủ để chặn menu, ta thêm 'contextmenu'

		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);
		raycaster.ray.intersectPlane(plane, targetPoint);

		const direction = new THREE.Vector3();
		direction.subVectors(targetPoint, playerMesh.position).normalize();
		direction.y = 0;

		if (event.button === 0) {
			// Chuột trái: Bắn đạn thường
			const bulletGeo = new THREE.SphereGeometry(0.15, 8, 8);
			const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
			const bulletMesh = new THREE.Mesh(bulletGeo, bulletMat);
			bulletMesh.position.copy(playerMesh.position);
			scene.add(bulletMesh);

			const bullet = new Bullet(bulletMesh, direction, 15);
			bullet.damage = 100; // Sát thương đạn thường
			bullets.push(bullet);
		} else if (event.button === 2) {
			// Chuột phải: Dùng tuyệt chiêu (nếu đủ MP)
			if (player && player.mp >= player.maxMp) {
				player.useSpecialAttack(scene, bullets);

				for (let i = -2; i <= 2; i++) {
					const angle = i * 15 * (Math.PI / 180);
					const dir = direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);

					const bulletGeo = new THREE.SphereGeometry(0.25, 8, 8);
					const bulletMat = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // Green cyan bullets for special
					const bulletMesh = new THREE.Mesh(bulletGeo, bulletMat);
					bulletMesh.position.copy(playerMesh.position);
					scene.add(bulletMesh);

					const bullet = new Bullet(bulletMesh, dir, 20); // Faster bullet
					bullet.damage = 200; // Sát thương đạn tuyệt chiêu
					bullets.push(bullet);
				}
			}
		}
	};

	const onContextMenu = (event) => {
		event.preventDefault(); // Chặn menu chuột phải hiện ra
	};

	windowTarget.addEventListener('mousedown', onMouseDown);
	windowTarget.addEventListener('contextmenu', onContextMenu);

	return {
		dispose() {
			windowTarget.removeEventListener('mousedown', onMouseDown);
			windowTarget.removeEventListener('contextmenu', onContextMenu);
		}
	};
}
