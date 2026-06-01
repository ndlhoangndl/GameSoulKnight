import * as THREE from 'three';
import { Player } from '../../Entities/Player/Player.js';
import { PlayerController } from '../../Entities/Player/PlayerControl.js';

/**
 * Tạo mesh + Player entity + controller.
 * Giữ nguyên geometry/material như main.js cũ.
 */
export function createPlayer({ scene, texture, input, socketManager }) {
	// Tăng kích thước nhân vật lên 1.0 x 1.0 để hiển thị rõ nét và cân đối hơn với các ô gạch map kích thước 1.0
	const playerGeometry = new THREE.PlaneGeometry(1.0, 1.0);
	const playerMaterial = new THREE.MeshBasicMaterial({
		map: texture,
		transparent: true,
		alphaTest: 0.5,
		depthWrite: false
	});
	const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
	// Xoay nằm phẳng cùng hướng mặt đất để camera góc nhìn từ trên xuống thấy rõ sprite
	playerMesh.rotation.x = -Math.PI / 2;
	// Đặt độ cao Y = 0.25 để cùng lớp hiển thị với các thực thể khác
	playerMesh.position.y = 0.25;
	scene.add(playerMesh);

	const player = new Player(playerMesh);
	const playerController = new PlayerController(player, input, socketManager);

	return { playerMesh, player, playerController };
}