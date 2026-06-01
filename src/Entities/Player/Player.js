import { Entity } from '../Base/Entity.js';
import * as THREE from 'three';

export class Player extends Entity {
    constructor(mesh) {
        super({ mesh, hp: 100 });
        this.maxHp = 100;
        // Vector đích để lerp mượt từ server
        this.targetPosition = new THREE.Vector3(0, 0.25, 0);

        // Callback để UI layer lắng nghe thay đổi HP — tránh entity biết về DOM
        this.onHpChanged = null;
    }

    // Gộp updateStats + sync thành một điểm vào duy nhất
    // SocketManager đang gọi cả hai — giờ chỉ cần gọi sync()
    sync(serverX, serverY, hp) {
        if (hp !== undefined) {
            this.hp = hp;
            if (this.hp <= 0 && !this.isDead) {
                this.hp = 0;
                this.isDead = true;
            }
            // Thông báo cho UI thay vì tự thao tác DOM
            if (this.onHpChanged) this.onHpChanged(this.hp, this.maxHp);
        }
    }

    // Giữ lại updateStats để SocketManager gọi được (tránh phá luồng hiện tại)
    updateStats(stats) {
        if (!stats) return;
        if (stats.hp !== undefined) {
            this.sync(undefined, undefined, stats.hp);
        }
    }

    update(dt) {
        if (this.isDead) return;
        if (this.targetPosition) {
            // Tăng tốc độ lerp lên 24 để đuổi kịp vị trí server nhanh và mượt hơn
            this.mesh.position.lerp(this.targetPosition, 24 * dt);
            
            // Snap thẳng vị trí nếu khoảng cách rất nhỏ để tránh rung lắc
            if (this.mesh.position.distanceToSquared(this.targetPosition) < 0.0001) {
                this.mesh.position.copy(this.targetPosition);
            }
        }
    }
}