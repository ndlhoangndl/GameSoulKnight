export class CollisionSystem {
    constructor(player, enemyManager) {
        this.player = player;
        this.enemyManager = enemyManager;
    }

    // Cập nhật hệ thống va chạm mỗi khung hình
    update() {
        const enemies = this.enemyManager.enemies;
        const pPos = this.player.mesh.position;
        const pRadius = this.player.radius;

        for (const enemy of enemies) {
            const ePos = enemy.mesh.position;
            const eRadius = enemy.radius;

            // Tính khoảng cách giữa Player và Enemy trên mặt phẳng XZ
            const dx = ePos.x - pPos.x;
            const dz = ePos.z - pPos.z;

            // Công thức Pythagoras: a^2 + b^2 = c^2
            const distance = Math.sqrt(dx * dx + dz * dz);
            const minDistance = pRadius + eRadius;

            // Nếu khoảng cách thực tế nhỏ hơn tổng 2 bán kínhsd
            if (distance < minDistance) {
                this.handleCollision(enemy, distance, minDistance);
            }
        }
    }

    handleCollision(enemy, distance, minDistance) {
        const pPos = this.player.mesh.position;
        const ePos = enemy.mesh.position;

        // Tính độ lẹm
        const overlap = minDistance - distance;

        // Tìm hướng đẩy
        const nx = distance > 0 ? (ePos.x - pPos.x) / distance : 1;
        const nz = distance > 0 ? (ePos.z - pPos.z) / distance : 0;


        ePos.x += nx * overlap;
        ePos.z += nz * overlap;

        this.player.takeDamage(0.5);
    }
}