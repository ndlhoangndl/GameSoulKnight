// src/UI/HUD.js
export class HUD {
    constructor() {
        this.hpFill = document.getElementById('hp-fill');
        this.manaFill = document.getElementById('mana-fill');
    }

    // Gọi hàm này trong Main update hoặc khi Player mất máu
    update(currentHp, maxHp, currentMana, maxMana) {
        if (this.hpFill) {
            const hpWidth = (currentHp / maxHp) * 100;
            this.hpFill.style.width = `${hpWidth}%`;
        }
        if (this.manaFill) {
            const manaWidth = (currentMana / maxMana) * 100;
            this.manaFill.style.width = `${manaWidth}%`;
        }
    }
}