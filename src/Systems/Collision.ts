import { Player } from '../Entities/Player/Player';
import { EnemyManager } from '../Entities/Enemy/EnemyManager';

export class CollisionSystem {
    private player: Player
    private enemyManager: EnemyManager

    constructor(player: Player, enemyManager: EnemyManager) {
        this.player = player
        this.enemyManager = enemyManager
    }

    // Đây là "Trạm điều khiển" sẽ được gọi mỗi khung hình
    public update() {
        const enemies = this.enemyManager.enemies;
        const pPos = this.player.mesh.position;
        const pRadius = this.player.radius;

        for (const enemy of enemies) {
            const ePos = enemy.mesh.position;
            const eRadius = enemy.radius;

            // Tính khoảng cách giữa Player và Enemy
            const dx = ePos.x - pPos.x;
            const dz = ePos.z - pPos.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            const minDistance = pRadius + eRadius;
            if (distance < minDistance) {
                this.handleCollision(enemy, distance, minDistance);
            }
        }
    }

    private handleCollision(enemy: { mesh: { position: { x: number; z: number } } }, distance: number, minDistance: number) {
        const pPos = this.player.mesh.position;
        const ePos = enemy.mesh.position;

        const overlap = minDistance - distance;

        // Tìm hướng đẩy
        const nx = distance > 0 ? (ePos.x - pPos.x) / distance : 1;
        const nz = distance > 0 ? (ePos.z - pPos.z) / distance : 0;

        // Đẩy Enemy ra khỏi Player
        ePos.x += nx * overlap;
        ePos.z += nz * overlap;

        this.player.takeDamage(0.5);
    }
}