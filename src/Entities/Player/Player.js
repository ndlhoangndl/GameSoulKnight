import { Entity } from '../Base/Entity.js'
import { GAME_CONSTANTS } from '../../utils/Constants.js'

export class Player extends Entity {
    constructor(mesh) {
        // Gọi constructor cha với các hằng số từ file Constants
        const startHp = GAME_CONSTANTS.player.startHp;
        super({
            mesh,
            hp: startHp,
            radius: GAME_CONSTANTS.player.contactRadius
        });

        // Lưu lại HP tối đa để tính % UI
        this.maxHp = startHp;

        this.isDead = false;
    }

    // Hàm nhận sát thương
    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
        }

        // Cập nhật UI ngay lập tức khi mất máu
        const hpFill = document.getElementById('hp-fill');
        if (hpFill) {
            const percentage = (this.hp / this.maxHp) * 100;
            hpFill.style.width = percentage + "%";
        }
    }

    update(dt) {
        if (this.isDead) return;

        // Cập nhật vị trí dựa trên vận tốc  đã tính ở PlayerController
        super.update(dt);
    }
}