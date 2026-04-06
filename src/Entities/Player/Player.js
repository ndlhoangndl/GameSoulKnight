import { Entity } from '../Base/Entity.js'
import { GAME_CONSTANTS } from '../../utils/Constants.js'

export class Player extends Entity {
    constructor(mesh) {
        // Gọi constructor cha với các hằng số từ file Constants
        super({
            mesh,
            hp: GAME_CONSTANTS.player.startHp,
            radius: GAME_CONSTANTS.player.contactRadius
        });

        this.isDead = false;
    }

    // Hàm nhận sát thương (ví dụ khi quái chạm vào người)
    takeDamage(amount) {
        if (this.isDead) return;

        this.hp -= amount;

        // Hiệu ứng log đơn giản, sau này có thể thêm màn hình Game Over ở đây
        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
            console.log("Game Over! Player has died. 💀");
        }
    }

    update(dt) {
        if (this.isDead) return;

        // Cập nhật vị trí dựa trên vận tốc  đã tính ở PlayerController
        super.update(dt);
    }
}