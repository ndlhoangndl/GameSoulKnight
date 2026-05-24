import * as THREE from 'three';
import { SERVER_SCALE } from '../../utils/Constants.js';

export class EnemyManager {
    constructor(scene, textureDict) {
        this.enemies = new Map();
        this.scene = scene;
        this.textureDict = textureDict;
    }

    update(dt) {
        for (const enemy of this.enemies.values()) {
            enemy.mesh && enemy.mesh.visible; // placeholder — enemy update do server drive
        }
    }

    syncWithServer(spawnDataList) {
        if (!spawnDataList) return;

        const currentIds = new Set();

        spawnDataList.forEach(data => {
            const enemyId = data.Id || `${data.X}_${data.Y}`;
            currentIds.add(enemyId);

            if (!this.enemies.has(enemyId)) {
                // Chọn texture theo type nếu có, fallback về boss
                const texture = this.textureDict?.[data.Type] ?? this.textureDict?.boss ?? null;

                const geometry = new THREE.PlaneGeometry(2, 2);
                const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.rotation.x = -Math.PI / 2;

                this.scene.add(mesh);
                this.enemies.set(enemyId, { mesh, hp: data.CurrentHp });
            }

            const enemy = this.enemies.get(enemyId);
            enemy.mesh.position.set(data.X / SERVER_SCALE, 0.25, data.Y / SERVER_SCALE);
            enemy.hp = data.CurrentHp;
        });

        // Dọn dẹp enemy không còn trên server
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