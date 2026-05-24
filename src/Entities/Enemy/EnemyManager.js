import * as THREE from 'three';

export class EnemyManager {
    constructor(scene, textureDict) {
        this.enemies = new Map();
        this.scene = scene;
        this.textureDict = textureDict;
    }

    update(dt) {
        for (const [id, enemy] of this.enemies.entries()) {
            // Để trống hoặc giữ nguyên logic nhìn camera của ông
        }
    }

    syncWithServer(spawnDataList, scale = 32) { // Thêm tham số scale nhận từ SocketManager
        if (!spawnDataList) return;

        const currentIds = new Set();

        spawnDataList.forEach(data => {
            const enemyId = data.Id || `${data.X}_${data.Y}`;
            currentIds.add(enemyId);

            if (!this.enemies.has(enemyId)) {
                const geometry = new THREE.PlaneGeometry(2, 2);
                const material = new THREE.MeshBasicMaterial({
                    map: this.textureDict?.boss || null,
                    transparent: true
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.rotation.x = -Math.PI / 2;

                this.scene.add(mesh);
                this.enemies.set(enemyId, { mesh, hp: data.CurrentHp });
            }

            const enemy = this.enemies.get(enemyId);

            // SỬA TẠI ĐÂY: Chia tọa độ X, Y cho scale (32) để quái đứng đúng ô lưới trên map
            enemy.mesh.position.set(data.X / scale, 0.25, data.Y / scale);
            enemy.hp = data.CurrentHp;
        });

        for (const [id, enemy] of this.enemies.entries()) {
            if (!currentIds.has(id)) {
                this.scene.remove(enemy.mesh);
                enemy.mesh.geometry.dispose();
                enemy.mesh.material.dispose();
                this.enemies.delete(id);
            }
        }
    }
}