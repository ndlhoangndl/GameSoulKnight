import * as THREE from 'three';
import { createEnemy } from '../factories/createEnemy.js';
import { SERVER_SCALE } from '../../utils/Constants.js';

export class EntityManager {
    constructor(scene, camera, enemyTexture) {
        this.scene = scene;
        this.camera = camera;
        this.enemyTexture = enemyTexture;
        this.entities = new Map(); // Lưu ID -> Mesh
    }

    sync(spawns) {
        if (!spawns) return;

        const currentIds = new Set();
        
        spawns.forEach(data => {
            const idVal = data.Id !== undefined ? data.Id : data.id;
            const xVal = data.X !== undefined ? data.X : data.x;
            const yVal = data.Y !== undefined ? data.Y : data.y;
            if (idVal !== undefined) currentIds.add(idVal);
        });

        // 1. Xóa những con không còn trong server
        for (const [id, mesh] of this.entities) {
            if (!currentIds.has(id)) {
                this.scene.remove(mesh);
                this.entities.delete(id);
            }
        }

        // 2. Cập nhật hoặc tạo mới
        spawns.forEach(data => {
            const idVal = data.Id !== undefined ? data.Id : data.id;
            const xVal = data.X !== undefined ? data.X : data.x;
            const yVal = data.Y !== undefined ? data.Y : data.y;
            
            if (idVal === undefined || xVal === undefined || yVal === undefined) return;

            const targetPos = new THREE.Vector3(xVal / SERVER_SCALE, 0.25, yVal / SERVER_SCALE);

            if (this.entities.has(idVal)) {
                // Cập nhật vị trí target
                const mesh = this.entities.get(idVal);
                mesh.userData.targetPosition = targetPos;
            } else {
                // Tạo mới sử dụng factory cũ
                const enemy = createEnemy({
                    scene: this.scene,
                    camera: this.camera,
                    variant: 'boss1', // Mặc định
                    texture: this.enemyTexture,
                    position: targetPos
                });
                const mesh = enemy.mesh;
                mesh.userData.targetPosition = targetPos.clone();
                this.entities.set(idVal, mesh);
            }
        });
    }

    update(dt) {
        // Nội suy vị trí tất cả quái vật để chạy mượt mà
        for (const mesh of this.entities.values()) {
            if (mesh.userData.targetPosition) {
                const dist = mesh.position.distanceTo(mesh.userData.targetPosition);
                if (dist > 2) {
                    mesh.position.copy(mesh.userData.targetPosition);
                } else {
                    mesh.position.lerp(mesh.userData.targetPosition, 15 * dt);
                }
            }
        }
    }
}
