import * as THREE from 'three';
import { GAME_CONSTANTS } from '../../utils/Constants.js';

export class PlayerController {
    constructor(player, input, socketManager = null) {
        // Trong JS không cần khai báo kiểu dữ liệu, gán trực tiếp vào 'this'
        this.player = player;
        this.input = input;
        this.socketManager = socketManager;
    }

    update() {
        // Nếu Player đã chết thì không cho điều khiển nữa
        if (this.player.isDead) {
            this.player.velocity.set(0, 0, 0);
            return;
        }

        //  Khởi tạo hướng di chuyển bằng 0
        const direction = new THREE.Vector3(0, 0, 0);

        //  Kiểm tra phím bấm để xác định hướng di chuyển
        if (this.input.isPressed('KeyW')) direction.z -= 1; // Tiến
        if (this.input.isPressed('KeyS')) direction.z += 1; // Lùi
        if (this.input.isPressed('KeyA')) direction.x -= 1; // Sang trái
        if (this.input.isPressed('KeyD')) direction.x += 1; // Sang phải

        // Xử lý vận tốc
        if (direction.length() > 0) {
            // Chuẩn hóa hướng (để đi chéo không bị nhanh hơn đi thẳng)
            direction.normalize();

            // Nhân hướng với tốc độ chạy từ file hằng số
            const moveSpeed = GAME_CONSTANTS.player.moveSpeed;
            this.player.velocity.copy(direction.multiplyScalar(moveSpeed));

            if (this.socketManager) {
                this.socketManager.sendMove(direction.x, direction.z, 1/60);
            }
        } else {
            // Nếu không bấm phím nào, dừng nhân vật lại
            this.player.velocity.set(0, 0, 0);
        }
    }
}