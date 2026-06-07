import * as THREE from 'three';
import { SERVER_SCALE } from '../utils/Constants.js';

export class BulletManager {
    constructor(scene) {
        this.scene = scene;
        this.bullets = new Map();
        this.trails = [];

        // Geometry / Material dùng chung cho đạn quái/thường để tối ưu
        this.bulletGeo = new THREE.SphereGeometry(0.12, 8, 8);
        this.bulletMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    }

    createPlayerBulletMesh() {
        const group = new THREE.Group();

        // 1. Nhân đạn (core): Cylinder phát sáng màu cyan
        const coreGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6);
        coreGeo.rotateX(Math.PI / 2); // Xoay để trục dọc Cylinder trùng với hướng Z
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        group.add(coreMesh);

        // 2. Hào quang (glow): Cylinder lớn hơn, bán trong suốt màu xanh lam
        const glowGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.55, 6);
        glowGeo.rotateX(Math.PI / 2);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x0066ff,
            transparent: true,
            opacity: 0.4,
            depthWrite: false
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        group.add(glowMesh);

        // 3. Mũi tên nhọn đầu đạn màu trắng (white tip): tạo cảm giác xé gió mạnh mẽ
        const tipGeo = new THREE.ConeGeometry(0.06, 0.15, 6);
        tipGeo.rotateX(Math.PI / 2);
        tipGeo.translate(0, 0, 0.275);
        const tipMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const tipMesh = new THREE.Mesh(tipGeo, tipMat);
        group.add(tipMesh);

        // 4. Ánh sáng động nhỏ theo đạn (Point Light)
        const light = new THREE.PointLight(0x00f3ff, 0.8, 2.0);
        light.position.set(0, 0, 0);
        group.add(light);

        return group;
    }

    spawnTrail(position) {
        // Đuôi đạn (trail) tạo từ các sphere nhỏ dần theo thời gian
        const trailGeo = new THREE.SphereGeometry(0.06, 4, 4);
        const trailMat = new THREE.MeshBasicMaterial({
            color: 0x00bfff,
            transparent: true,
            opacity: 0.7,
            depthWrite: false
        });
        const trailMesh = new THREE.Mesh(trailGeo, trailMat);
        trailMesh.position.copy(position);

        // Tạo dao động ngẫu nhiên siêu nhỏ cho vệt đuôi sinh động hơn
        trailMesh.position.x += (Math.random() - 0.5) * 0.05;
        trailMesh.position.z += (Math.random() - 0.5) * 0.05;

        this.scene.add(trailMesh);
        this.trails.push({
            mesh: trailMesh,
            life: 0.12,
            maxLife: 0.12
        });
    }

    syncWithServer(bulletsData) {
        if (!bulletsData) return;

        const currentIds = new Set();
        const bulletSpeed = 500 / SERVER_SCALE; // 7.8125 world units/sec (khớp với server)

        bulletsData.forEach((data, index) => {
            // Sử dụng unique Id từ server (nếu không có thì fallback theo index)
            const bulletId = data.Id || data.id || `bullet_${index}`;
            currentIds.add(bulletId);

            const dx = data.DirectionX ?? data.directionX ?? 0;
            const dy = data.DirectionY ?? data.directionY ?? 0;

            // Normalize vector hướng
            const len = Math.sqrt(dx * dx + dy * dy);
            const dirX = len > 0 ? dx / len : 0;
            const dirY = len > 0 ? dy / len : 0;

            const targetPos = new THREE.Vector3((data.X + 5) / SERVER_SCALE, 0.5, (data.Y + 5) / SERVER_SCALE);
            const isPlayerBullet = data.IsOwnedByPlayer ?? data.isOwnedByPlayer ?? false;

            if (!this.bullets.has(bulletId)) {
                let mesh;
                if (isPlayerBullet) {
                    mesh = this.createPlayerBulletMesh();
                } else {
                    mesh = new THREE.Mesh(this.bulletGeo, this.bulletMat);
                }
                mesh.position.copy(targetPos);
                
                // Quay mesh theo hướng di chuyển nếu là đạn player
                if (isPlayerBullet && len > 0) {
                    const lookTarget = targetPos.clone().add(new THREE.Vector3(dirX, 0, dirY));
                    mesh.lookAt(lookTarget);
                }

                mesh.userData = {
                    targetPosition: targetPos,
                    dirX: dirX,
                    dirY: dirY,
                    speed: bulletSpeed,
                    isPlayerBullet: isPlayerBullet
                };
                this.scene.add(mesh);
                this.bullets.set(bulletId, mesh);
            } else {
                const mesh = this.bullets.get(bulletId);
                mesh.userData.targetPosition = targetPos;
                mesh.userData.dirX = dirX;
                mesh.userData.dirY = dirY;

                // Cập nhật hướng xoay của đạn player
                if (mesh.userData.isPlayerBullet && len > 0) {
                    const lookTarget = mesh.position.clone().add(new THREE.Vector3(dirX, 0, dirY));
                    mesh.lookAt(lookTarget);
                }

                // Nếu khoảng cách lệch quá xa do lag/ping cao, lập tức snap về vị trí của server
                if (mesh.position.distanceTo(targetPos) > 1.2) {
                    mesh.position.copy(targetPos);
                }
            }
        });

        // Dọn dẹp đạn cũ không còn tồn tại trên server
        for (const [id, mesh] of this.bullets.entries()) {
            if (!currentIds.has(id)) {
                this.scene.remove(mesh);
                this.bullets.delete(id);
            }
        }
    }

    update(dt) {
        // 1. Cập nhật và dọn dẹp các trail của đạn player
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const trail = this.trails[i];
            trail.life -= dt;
            if (trail.life <= 0) {
                this.scene.remove(trail.mesh);
                this.trails.splice(i, 1);
            } else {
                const ratio = trail.life / trail.maxLife;
                trail.mesh.scale.set(ratio, ratio, ratio);
                if (trail.mesh.material) {
                    trail.mesh.material.opacity = ratio * 0.7;
                }
            }
        }

        // 2. Cập nhật vị trí đạn cục bộ
        for (const mesh of this.bullets.values()) {
            const ud = mesh.userData;
            // Tự động di chuyển tuyến tính cục bộ trên client (giúp đạn cực kì mượt)
            if (ud.dirX !== 0 || ud.dirY !== 0) {
                mesh.position.x += ud.dirX * ud.speed * dt;
                mesh.position.z += ud.dirY * ud.speed * dt;

                // Nếu là đạn player, sinh trail và cập nhật hướng xoay liên tục
                if (ud.isPlayerBullet) {
                    const lookTarget = mesh.position.clone().add(new THREE.Vector3(ud.dirX, 0, ud.dirY));
                    mesh.lookAt(lookTarget);
                    
                    this.spawnTrail(mesh.position);
                }
            }
            // Lerp nhẹ để đồng bộ hóa với vị trí thực trên server nếu có sai lệch nhỏ
            if (ud.targetPosition) {
                mesh.position.lerp(ud.targetPosition, 4.5 * dt);
            }
        }
    }
}