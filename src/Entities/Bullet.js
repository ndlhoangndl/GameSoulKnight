import { Entity } from './Base/Entity.js';

export class Bullet extends Entity {
    constructor(mesh, direction, speed) {
        // Gọi constructor của Entity với các chỉ số nhỏ gọn cho viên đạn
        super({
            mesh,
            hp: 1,
            radius: 0.2
        });

        this.isDead = false;
        this.lifeTime = 2; // Đạn sẽ tự biến mất sau 2 giây để tránh làm nặng bộ nhớ

        // Gán vận tốc dựa trên hướng và tốc độ truyền vào
        this.velocity.copy(direction).multiplyScalar(speed);
    }

    update(dt) {
        // Cập nhật vị trí thông qua lớp cha Entity
        super.update(dt);

        // Giảm thời gian tồn tại theo mỗi khung hình
        this.lifeTime -= dt;

        // Nếu hết thời gian, đánh dấu là đã chết để Main Loop xóa đi
        if (this.lifeTime <= 0) {
            this.isDead = true;
        }
    }
}