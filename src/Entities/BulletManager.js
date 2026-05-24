import * as THREE from 'three';

export class BulletManager {
    constructor(scene) {
        this.scene = scene;
        this.bullets = new Map();
        
        // Geometry / Material chung để tối ưu hiệu suất
        this.bulletGeo = new THREE.SphereGeometry(0.3, 8, 8);
        this.bulletMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    }

    syncWithServer(bulletsData) {
        if (!bulletsData) return;

        const currentIds = new Set();

        bulletsData.forEach((data, index) => {
             // Sử dụng index hoặc ID thực từ server
            const bulletId = data.Id || `bullet_${index}`;
            currentIds.add(bulletId);

            if (!this.bullets.has(bulletId)) {
                // Tạo mới mesh
                const mesh = new THREE.Mesh(this.bulletGeo, this.bulletMat);
                mesh.position.set(data.X / 32, 0.5, data.Y / 32); // Cập nhật tỷ lệ chia 32
                mesh.userData.targetPosition = new THREE.Vector3(data.X / 32, 0.5, data.Y / 32);
                this.scene.add(mesh);
                this.bullets.set(bulletId, mesh);
            } else {
                // Đặt target thay vì set thẳng để interpolate
                const mesh = this.bullets.get(bulletId);
                mesh.userData.targetPosition = new THREE.Vector3(data.X / 32, 0.5, data.Y / 32);
            }
        });

        // Dọn dẹp đạn cũ không còn trên Server
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
                // Đạn bay nhanh hơn nên lerp speed cao hơn (ví dụ 15 hoặc 20)
                mesh.position.lerp(mesh.userData.targetPosition, 20 * dt);
            }
        }
    }
}
