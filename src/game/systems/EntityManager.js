import * as THREE from 'three';
import { createEnemy } from '../factories/createEnemy.js';

export class EntityManager {
    constructor(scene, camera, enemyTexture) {
        this.scene = scene;
        this.camera = camera;
        this.enemyTexture = enemyTexture;
        this.entities = new Map(); // Lưu ID -> Mesh
    }

    sync(spawns) {
        const currentIds = new Set(spawns.map(s => s.Id));

        // 1. Xóa những con không còn trong server
        for (const [id, mesh] of this.entities) {
            if (!currentIds.has(id)) {
                this.scene.remove(mesh);
                this.entities.delete(id);
            }
        }

        // 2. Cập nhật hoặc tạo mới
        spawns.forEach(data => {
            if (this.entities.has(data.Id)) {
                // Cập nhật vị trí target
                const mesh = this.entities.get(data.Id);
                mesh.userData.targetPosition = new THREE.Vector3(data.X / 32, 0.5, data.Y / 32);
            } else {
                // Tạo mới sử dụng factory cũ
                const targetPos = new THREE.Vector3(data.X / 32, 0.5, data.Y / 32);
                const enemy = createEnemy({
                    scene: this.scene,
                    camera: this.camera,
                    variant: 'boss1', // Mặc định
                    texture: this.enemyTexture,
                    position: targetPos
                });
                const mesh = enemy.mesh;
                mesh.userData.targetPosition = targetPos.clone();
                this.entities.set(data.Id, mesh);
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
