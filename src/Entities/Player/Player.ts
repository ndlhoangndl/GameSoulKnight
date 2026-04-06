import * as THREE from 'three'
import { Entity } from '../Base/Entity'
import { GAME_CONSTANTS } from '../../utils/Constants'

export class Player extends Entity {
    public isDead: boolean = false;

    constructor(mesh: THREE.Mesh) {
        super({
            mesh,
            hp: GAME_CONSTANTS.player.startHp,
            radius: GAME_CONSTANTS.player.contactRadius
        })
    }

    // Hàm nhận sát thương từ quái
    takeDamage(amount: number) {
        if (this.isDead) return;

        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
            console.log("Game Over! Player has died. 💀");
        }
    }

    update(dt: number) {
        if (this.isDead) return;
        super.update(dt);
    }
}