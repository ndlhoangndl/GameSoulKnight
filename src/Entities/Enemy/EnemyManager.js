import { Enemy } from './Enemy.js'

export class EnemyManager {
    constructor() {
        // Danh sách lưu trữ tất cả quái vật đang sống
        this.enemies = [];
    }

    // Hàm để thêm một con quái mới vào sân
    addEnemy(enemy) {
        this.enemies.push(enemy);
    }

    // Cập nhật tất cả quái vật cùng một lúc
    update(dt, player) {
        // Duyệt qua từng con quái trong danh sách
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            // Nếu quái đã chết, loại bỏ khỏi danh sách
            if (enemy.isDead) {
                this.enemies.splice(i, 1);
                continue;
            }

            // Tính toán hướng từ Quái -> Player
            const direction = player.mesh.position.clone().sub(enemy.mesh.position).normalize();

            // Cập nhật vận tốc cho quái (tốc độ ví dụ là 3)
            enemy.velocity.copy(direction).multiplyScalar(3);

            // Gọi hàm update của từng con quái
            enemy.update(dt);
        }
    }
}