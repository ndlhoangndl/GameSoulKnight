import * as THREE from 'three';

export class PlayerController {
    constructor(player, input, socketManager = null) {
        this.player = player;
        this.input = input;
        this.socketManager = socketManager;

        // Tạo một lần, tái sử dụng mỗi frame thay vì new THREE.Vector3() 60 lần/giây
        this._direction = new THREE.Vector3();
        this._lastDirX = 0;
        this._lastDirY = 0;
    }

    update(dt = 1/60) {
        if (this.player.isDead) return;

        this._direction.set(0, 0, 0);

        if (this.input.isPressed('KeyW')) this._direction.z -= 1;
        if (this.input.isPressed('KeyS')) this._direction.z += 1;
        if (this.input.isPressed('KeyA')) this._direction.x -= 1;
        if (this.input.isPressed('KeyD')) this._direction.x += 1;

        const dirX = Math.round(this._direction.x);
        const dirY = Math.round(this._direction.z);

        const isMoving = (dirX !== 0 || dirY !== 0);
        const wasMoving = (this._lastDirX !== 0 || this._lastDirY !== 0);

        if (isMoving) {
            // Gửi liên tục khi đang di chuyển để server cập nhật mượt mà
            // Nhân nhẹ dt với 1.35 để di chuyển nhanh hơn một chút theo yêu cầu của user
            this._lastDirX = dirX;
            this._lastDirY = dirY;
            if (this.socketManager) {
                this.socketManager.sendMove(dirX, dirY, dt * 1.35);
            }
        } else if (wasMoving) {
            // Chỉ gửi gói tin dừng (0, 0) một lần duy nhất để tránh spam
            this._lastDirX = 0;
            this._lastDirY = 0;
            if (this.socketManager) {
                this.socketManager.sendMove(0, 0, dt);
            }
        }
    }
}