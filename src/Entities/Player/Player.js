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

        this.mp = 0;
        this.maxMp = 100;

        this.kills = 0;
        this.currentLevel = 1;

        this.isDead = false;

        this.updateManaUI(); // Initialize UI width to 0
        this.updateKillUI(); // Khởi tạo UI số lượng kill
    }

    addKill() {
        if (this.isDead) return;
        this.kills++;
        this.updateKillUI();
    }

    updateKillUI() {
        const killUI = document.getElementById('kill-count-ui');
        if (killUI) {
            if (this.currentLevel === 1) {
                // Màn 1: Cần 20 kills
                killUI.innerText = `Kills: ${this.kills} / 20 (Map 1)`;
            } else {
                // Màn 2: Hiển thị tự do hoặc có limit tùy ý
                killUI.innerText = `Kills: ${this.kills} (Map 2)`;
            }
        }
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

    addMana(amount) {
        if (this.isDead) return;
        this.mp = Math.min(this.mp + amount, this.maxMp);
        this.updateManaUI();
    }

    updateManaUI() {
        const manaFill = document.getElementById('mana-fill');
        if (manaFill) {
            const pct = (this.mp / this.maxMp) * 100;
            manaFill.style.width = pct + "%";
        }
    }

    useSpecialAttack(scene, bullets) {
        if (this.isDead || this.mp < this.maxMp) return false;

        this.mp = 0;
        this.updateManaUI();
        return true;
    }

    update(dt) {
        if (this.isDead) return;

        // Cập nhật vị trí dựa trên vận tốc  đã tính ở PlayerController
        super.update(dt);
    }
}