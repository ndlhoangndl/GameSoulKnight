import { GAME_CONSTANTS } from '../../utils/Constants.js';

/**
 * System kẹp (clamp) player trong bounds map.
 * Không dùng physics, chỉ giới hạn position ngay sau khi player.update(dt).
 */
export function createWorldBoundsSystem({ playerMesh, bounds, opts = {} }) {
	const radius = opts.radius ?? GAME_CONSTANTS.player.contactRadius;

	return {
		update() {
			if (!playerMesh) return;
			const p = playerMesh.position;

			p.x = Math.min(bounds.maxX - radius, Math.max(bounds.minX + radius, p.x));
			p.z = Math.min(bounds.maxZ - radius, Math.max(bounds.minZ + radius, p.z));
		}
	};
}

