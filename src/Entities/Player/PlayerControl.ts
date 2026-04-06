import { Player } from './Player';
import { Input } from '../../Systems/Input';
import { GAME_CONSTANTS } from '../../utils/Constants';
import * as THREE from 'three';

export class PlayerController {
    private player: Player
    private input: Input

    constructor(player: Player, input: Input) {
        this.player = player
        this.input = input
    }

    update() {
        //  Khởi tạo hướng di chuyển bằng 0
        const direction = new THREE.Vector3(0, 0, 0);

        // Kiểm tra phím bấm để xác định hướng
        if (this.input.isPressed('KeyW')) direction.z -= 1;
        if (this.input.isPressed('KeyS')) direction.z += 1;
        if (this.input.isPressed('KeyA')) direction.x -= 1;
        if (this.input.isPressed('KeyD')) direction.x += 1;

        //Nếu có di chuyển, chúng ta sẽ xử lý vận tốc
        if (direction.length() > 0) {
            direction.normalize();
            this.player.velocity.copy(
                direction.multiplyScalar(GAME_CONSTANTS.player.moveSpeed)
            );
        } else {
            this.player.velocity.set(0, 0, 0);
        }
    }
}