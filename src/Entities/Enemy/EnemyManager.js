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
            const idVal = data.Id !== undefined ? data.Id : data.id;
            const xVal = data.X !== undefined ? data.X : data.x;
            const yVal = data.Y !== undefined ? data.Y : data.y;
            const typeVal = data.Type || data.type;
            const currentHpVal = data.CurrentHp !== undefined ? data.CurrentHp : data.currentHp;

            const id = idVal || `${xVal}_${yVal}`;
            currentIds.add(id);

            if (!this.enemies.has(id)) {
                // Chọn texture theo type nếu có, fallback về boss
                const texture = this.textureDict?.[typeVal] ?? this.textureDict?.boss ?? null;

                // Chọn size cân bằng với map (boss to hơn quái thường)
                const isBoss = (typeVal && (typeVal.toLowerCase().includes('boss') || typeVal.toLowerCase().includes('giant')));
                const size = isBoss ? 1.2 : 0.8;
                const geometry = new THREE.PlaneGeometry(size, size);
                const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.rotation.x = -Math.PI / 2;

                this.scene.add(mesh);
                this.enemies.set(id, { mesh, hp: currentHpVal });
            }

            const enemy = this.enemies.get(id);
            enemy.mesh.position.set(xVal / SERVER_SCALE, 0.25, yVal / SERVER_SCALE);
            enemy.hp = currentHpVal;
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