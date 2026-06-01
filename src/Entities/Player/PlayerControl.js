import * as THREE from 'three';

export class PlayerController {
    constructor(player, input, socketManager = null) {
        this.player = player;
        this.input = input;
        this.socketManager = socketManager;

        // Tạo một lần, tái sử dụng mỗi frame thay vì new THREE.Vector3() 60 lần/giây
        this._direction = new THREE.Vector3();
    }

    update() {
        if (this.player.isDead) return;

        this._direction.set(0, 0, 0);

        if (this.input.isPressed('KeyW')) this._direction.z -= 1;
        if (this.input.isPressed('KeyS')) this._direction.z += 1;
        if (this.input.isPressed('KeyA')) this._direction.x -= 1;
        if (this.input.isPressed('KeyD')) this._direction.x += 1;

        const dirX = Math.round(this._direction.x);
        const dirY = Math.round(this._direction.z);

        if (this.socketManager) {
            this.socketManager.sendMove(dirX, dirY); // bỏ dt
        }
    }
}