import * as THREE from 'three';
import { GAME_CONSTANTS } from '../../utils/Constants.js';

/**
 * Tạo tường (khung đỏ) bao quanh map + trả về bounds để các system khác dùng clamp/collision.
 * World size lấy từ GAME_CONSTANTS.world.size.
 */
export function createWorldBounds({ scene, opts = {} } = {}) {
	const size = opts.size ?? GAME_CONSTANTS.world.size;
	const inset = opts.inset ?? GAME_CONSTANTS.world.boundsInset;
	const wallHeight = opts.wallHeight ?? 2;
	const wallThickness = opts.wallThickness ?? 0.6;
	const y = opts.y ?? 0;

	const half = size / 2;
	const minX = -half + inset;
	const maxX = half - inset;
	const minZ = -half + inset;
	const maxZ = half - inset;

	const material = new THREE.MeshBasicMaterial({
		color: 0x000000,
		transparent: true,
		opacity: 0.7
	});

	// North/South walls (along X)
	const wallXGeo = new THREE.BoxGeometry(size + wallThickness * 2, wallHeight, wallThickness);
	const north = new THREE.Mesh(wallXGeo, material);
	north.position.set(0, y + wallHeight / 2, minZ - wallThickness / 2);
	const south = new THREE.Mesh(wallXGeo, material);
	south.position.set(0, y + wallHeight / 2, maxZ + wallThickness / 2);

	// West/East walls (along Z)
	const wallZGeo = new THREE.BoxGeometry(wallThickness, wallHeight, size);
	const west = new THREE.Mesh(wallZGeo, material);
	west.position.set(minX - wallThickness / 2, y + wallHeight / 2, 0);
	const east = new THREE.Mesh(wallZGeo, material);
	east.position.set(maxX + wallThickness / 2, y + wallHeight / 2, 0);

	if (scene) {
		scene.add(north, south, west, east);
	}

	return {
		bounds: { size, inset, minX, maxX, minZ, maxZ },
		walls: { north, south, west, east }
	};
}

