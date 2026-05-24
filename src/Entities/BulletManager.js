import * as THREE from 'three';
import { SERVER_SCALE } from '../utils/Constants.js';

export class BulletManager {
    constructor(scene) {
        this.scene = scene;
        this.bullets = new Map();

        // Geometry / Material dùng chung để tối ưu
        this.bulletGeo = new THREE.SphereGeometry(0.3, 8, 8);
        this.bulletMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    }

    syncWithServer(bulletsData) {
        if (!bulletsData) return;

        const currentIds = new Set();

        bulletsData.forEach((data, index) => {
            const bulletId = data.Id || `bullet_${index}`;
            currentIds.add(bulletId);

            if (!this.bullets.has(bulletId)) {
                const mesh = new THREE.Mesh(this.bulletGeo, this.bulletMat);
                mesh.position.set(data.X / SERVER_SCALE, 0.5, data.Y / SERVER_SCALE);
                mesh.userData.targetPosition = new THREE.Vector3(data.X / SERVER_SCALE, 0.5, data.Y / SERVER_SCALE);
                this.scene.add(mesh);
                this.bullets.set(bulletId, mesh);
            } else {
                const mesh = this.bullets.get(bulletId);
                mesh.userData.targetPosition = new THREE.Vector3(data.X / SERVER_SCALE, 0.5, data.Y / SERVER_SCALE);
            }
        });

        // Dọn đạn cũ không còn trên server
        for (const [id, mesh] of this.bullets.entries()) {
            if (!currentIds.has(id)) {
                this.scene.remove(mesh);
                this.bullets.delete(id);
            }
        }
    }

    update(dt) {
        for (const mesh of this.bullets.values()) {
            if (mesh.userData.targetPosition) {
                mesh.position.lerp(mesh.userData.targetPosition, 20 * dt);
            }
        }
    }
}