import { Enemy } from './Enemy'
import { Player } from '../Player/Player'

export class EnemyManager {
    // Danh sách lưu trữ tất cả quái vật đang sống
    public enemies: Enemy[] = [];

    constructor() {
        // Khởi tạo danh sách trống
    }

    // Hàm để thêm một con quái mới vào sân
    addEnemy(enemy: Enemy) {
        this.enemies.push(enemy);
    }

    // Cập nhật tất cả quái vật cùng một lúc
    update(dt: number, player: Player) {
        // Hiện tại Enemy chỉ xử lý movement cơ bản (velocity) + billboard HP bar.

        void player

        for (const enemy of this.enemies) enemy.update(dt)
    }
}