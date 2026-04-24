import * as THREE from 'three';
import { Player } from '../../Entities/Player/Player.js';
import { PlayerController } from '../../Entities/Player/PlayerControl.js';

/**
 * Tạo mesh + Player entity + controller.
 * Giữ nguyên geometry/material như main.js cũ.
 */
export function createPlayer({ scene, texture, input, socketManager }) {
	const playerGeometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);
	const playerMaterial = new THREE.MeshStandardMaterial({
		map: texture,
		transparent: true
	});
	const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
	scene.add(playerMesh);

	const player = new Player(playerMesh);
	const playerController = new PlayerController(player, input, socketManager);

	return { playerMesh, player, playerController };
}
