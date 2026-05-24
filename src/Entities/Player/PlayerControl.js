import * as THREE from 'three';

export class PlayerController {
    constructor(player, input, socketManager = null) {
        this.player = player;
        this.input = input;
        this.socketManager = socketManager;
        this.playerRadius = 1.0;
    }

    update(dt = 1/60) {
        if (this.player.isDead) return;

        const direction = new THREE.Vector3(0, 0, 0);

        if (this.input.isPressed('KeyW')) direction.z -= 1;
        if (this.input.isPressed('KeyS')) direction.z += 1;
        if (this.input.isPressed('KeyA')) direction.x -= 1;
        if (this.input.isPressed('KeyD')) direction.x += 1;

        const dirX = Math.round(direction.x);
        const dirY = Math.round(direction.z);

        if (this.socketManager) {
            // SỬA TẠI ĐÂY: Gửi dt nguyên bản, không nhân 3 để Server xử lý di chuyển chính xác
            this.socketManager.sendMove(dirX, dirY, dt);
        }
    }
}