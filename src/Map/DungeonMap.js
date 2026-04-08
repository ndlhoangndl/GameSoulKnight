import * as THREE from 'three';

/**
 * Build wall meshes from a tile map.
 * tile value === 1 => wall
 *
 * @param {object} params
 * @param {import('three').Scene} params.scene
 * @param {number[][]} params.map
 * @param {number} [params.wallSize=2]
 * @param {number} [params.wallHeight=3]
 * @param {number} [params.wallColor=0x444444]
 * @param {{x:number, y:number, z:number}} [params.origin] - world position for tile (0,0)
 * @returns {{ walls: import('three').Mesh[], wallSize: number, wallHeight: number }}
 */
export function buildDungeonWalls({
	scene,
	map,
	wallSize = 2,
	wallHeight = 3,
	wallColor = 0x444444,
	origin = { x: 0, y: 0, z: 0 }
}) {
	const walls = [];
	const wallGeo = new THREE.BoxGeometry(wallSize, wallHeight, wallSize);
	const wallMat = new THREE.MeshStandardMaterial({ color: wallColor });

	for (let z = 0; z < map.length; z++) {
		const row = map[z];
		for (let x = 0; x < row.length; x++) {
			if (row[x] !== 1) continue;

			const wall = new THREE.Mesh(wallGeo, wallMat);
			wall.position.set(
				origin.x + x * wallSize,
				origin.y + wallHeight / 2,
				origin.z + z * wallSize
			);
			scene.add(wall);
			walls.push(wall);
		}
	}

	return { walls, wallSize, wallHeight };
}

