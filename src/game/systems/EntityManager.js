import * as THREE from 'three';
import { createEnemy } from '../factories/createEnemy.js';
import { SERVER_SCALE } from '../../utils/Constants.js';

export class EntityManager {
    constructor(scene, camera, enemyTexture) {
        this.scene = scene;
        this.camera = camera;
        this.enemyTexture = enemyTexture;
        this.entities = new Map(); // Lưu ID -> Enemy wrapper instance
        this.player = null; // Gán từ main.js
        this.activeTargetId = null;

        // HUD elements
        this.hudElement = document.getElementById('enemy-hud');
        this.hudNameElement = document.getElementById('enemy-name');
        this.hudHpTextElement = document.getElementById('enemy-hp-text');
        this.hudHpFillElement = document.getElementById('enemy-hp-fill');
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
        for (const [id, enemy] of this.entities) {
            if (!currentIds.has(id)) {
                this.scene.remove(enemy.mesh);
                enemy.mesh.geometry.dispose();
                enemy.mesh.material.dispose();
                this.entities.delete(id);
                if (this.activeTargetId === id) {
                    this.activeTargetId = null;
                }
            }
        }

        // 2. Cập nhật hoặc tạo mới
        spawns.forEach(data => {
            const idVal = data.Id !== undefined ? data.Id : data.id;
            const xVal = data.X !== undefined ? data.X : data.x;
            const yVal = data.Y !== undefined ? data.Y : data.y;
            const currentHpVal = data.CurrentHp !== undefined ? data.CurrentHp : data.currentHp;
            
            if (idVal === undefined || xVal === undefined || yVal === undefined) return;

            // Bán kính/nửa kích thước của quái: rộng 50, cao 50 trên server -> dịch +25 để tâm trùng với box
            const targetPos = new THREE.Vector3(
                (xVal + 25) / SERVER_SCALE,
                0.25,
                (yVal + 25) / SERVER_SCALE
            );

            if (this.entities.has(idVal)) {
                // Cập nhật vị trí target và HP
                const enemy = this.entities.get(idVal);
                enemy.mesh.userData.targetPosition = targetPos;
                if (currentHpVal !== undefined) {
                    // Nếu HP bị giảm, chuyển mục tiêu (target) hiển thị lên HUD sang quái này
                    if (currentHpVal < enemy.hp) {
                        this.activeTargetId = idVal;
                    }
                    enemy.hp = currentHpVal;
                    enemy.updateHPBar();
                }
            } else {
                // Tạo mới sử dụng factory
                const enemy = createEnemy({
                    scene: this.scene,
                    camera: this.camera,
                    variant: 'boss1', // Mặc định
                    texture: this.enemyTexture,
                    position: targetPos
                });
                enemy.mesh.userData.targetPosition = targetPos.clone();
                if (currentHpVal !== undefined) {
                    enemy.hp = currentHpVal;
                    enemy.updateHPBar();
                }
                this.entities.set(idVal, enemy);
            }
        });
    }

    getClosestEnemy() {
        if (!this.player || !this.player.mesh) return null;
        let closest = null;
        let minDist = Infinity;
        for (const [id, enemy] of this.entities) {
            if (enemy.isDead || enemy.hp <= 0) continue;
            const dist = enemy.mesh.position.distanceTo(this.player.mesh.position);
            if (dist < minDist) {
                minDist = dist;
                closest = { id, enemy };
            }
        }
        // Chỉ hiện thanh máu nếu quái vật ở tương đối gần player (trong khoảng 12 đơn vị)
        return minDist < 12 ? closest : null;
    }

    update(dt) {
        // 1. Nội suy vị trí tất cả quái vật để chạy mượt mà
        for (const enemy of this.entities.values()) {
            const mesh = enemy.mesh;
            if (mesh.userData.targetPosition) {
                const dist = mesh.position.distanceTo(mesh.userData.targetPosition);
                if (dist > 2) {
                    mesh.position.copy(mesh.userData.targetPosition);
                } else {
                    mesh.position.lerp(mesh.userData.targetPosition, 15 * dt);
                }
            }
            enemy.update(dt);
        }

        // 2. Cập nhật Enemy HUD ở phía trên màn hình
        let targetEnemy = null;
        if (this.activeTargetId && this.entities.has(this.activeTargetId)) {
            const enemy = this.entities.get(this.activeTargetId);
            if (enemy.hp > 0 && !enemy.isDead) {
                targetEnemy = enemy;
            } else {
                this.activeTargetId = null;
            }
        }

        // Nếu không có quái vật mục tiêu hiện tại (hoặc đã chết), tự động tìm con gần nhất
        if (!targetEnemy) {
            const closest = this.getClosestEnemy();
            if (closest) {
                targetEnemy = closest.enemy;
                this.activeTargetId = closest.id;
            }
        }

        if (targetEnemy) {
            if (this.hudElement) {
                this.hudElement.classList.remove('hidden');
                this.hudElement.setAttribute('aria-hidden', 'false');
            }
            if (this.hudNameElement) {
                this.hudNameElement.innerText = "Quái vật";
            }
            if (this.hudHpTextElement) {
                this.hudHpTextElement.innerText = `${targetEnemy.hp} / ${targetEnemy.maxHp}`;
            }
            if (this.hudHpFillElement) {
                const percent = Math.max(0, targetEnemy.hp) / targetEnemy.maxHp;
                this.hudHpFillElement.style.width = `${percent * 100}%`;
            }
        } else {
            if (this.hudElement) {
                this.hudElement.classList.add('hidden');
                this.hudElement.setAttribute('aria-hidden', 'true');
            }
        }
    }
}
