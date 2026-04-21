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
        this.totalPlayTime = 0;
        this.currentLevel = 1;

        this.isDead = false;
        
        this.isStormActive = false;
        this.stormTimeRemaining = 0;
        this.nextStormKills = 20;

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
            if (this.isStormActive) {
                killUI.innerText = `Kills: ${this.kills} (Bão Quái đang hoạt động)`;
            } else {
                killUI.innerText = `Kills: ${this.kills} / ${this.nextStormKills}`;
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
        this.updateHpUI();
    }

    addHp(amount) {
        if (this.isDead) return;
        this.hp = Math.min(this.hp + amount, this.maxHp);
        this.updateHpUI();
    }

    updateHpUI() {
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

        this.totalPlayTime += dt;
        const timeUI = document.getElementById('time-ui');
        if (timeUI) {
            timeUI.innerText = `Total Time: ${Math.floor(this.totalPlayTime)}s`;
        }

        if (this.isStormActive) {
            this.stormTimeRemaining -= dt;
            const stormUI = document.getElementById('storm-ui');
            if (stormUI) {
                if (this.stormTimeRemaining <= 0) {
                    stormUI.style.display = 'none';
                    // Trigger end storm event
                    window.dispatchEvent(new Event('endStorm'));
                } else {
                    stormUI.innerText = `Bão Quái: ${Math.ceil(this.stormTimeRemaining)}s`;
                }
            }
        }

        // Cập nhật vị trí dựa trên vận tốc  đã tính ở PlayerController
        super.update(dt);
    }
}