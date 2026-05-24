// src/Entities/Player/Player.js
import { Entity } from '../Base/Entity.js';
import * as THREE from 'three';

export class Player extends Entity {
    constructor(mesh) {
        super({ mesh, hp: 100 });
        this.maxHp = 100;
        this.isDead = false;
        // Khởi tạo vector đích để hứng dữ liệu từ SocketManager dội về
        this.targetPosition = new THREE.Vector3(0, 0.5, 0);
    }

    updateStats(stats) {
        if (!stats) return;
        if (stats.hp !== undefined) {
            this.hp = stats.hp;
            if (this.hp <= 0 && !this.isDead) {
                this.hp = 0;
                this.isDead = true;
            }
            this.updateHpUI();
        }
    }

    updateHpUI() {
        const hpFill = document.getElementById('hp-fill');
        if (hpFill) {
            const percentage = (this.hp / this.maxHp) * 100;
            hpFill.style.width = percentage + "%";
        }
    }

    update(dt) {
        if (this.isDead) return;

        // ĐƯA VỀ 2D CHẠY BÌNH THƯỜNG:
        // Đọc trực tiếp tọa độ đích từ Server tính toán dội về và gán thẳng vào mesh vị trí hiện tại
        if (this.targetPosition) {
            this.mesh.position.copy(this.targetPosition);
        }
    }
}