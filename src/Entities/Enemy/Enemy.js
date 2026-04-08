import * as THREE from 'three'
import { Entity } from '../Base/Entity.js'
import { Bullet } from '../Bullet.js'

const HP_BAR_WIDTH = 1.5
const HP_BAR_HEIGHT = 0.2

export class Enemy extends Entity {
    constructor(mesh, maxHp = 100, radius = 0.75) {
        super({ mesh, hp: maxHp, radius });
        this.isDead = false;
        this.maxHp = maxHp;
        this.billboardCamera = null;
        // Thong so chien dau moi
        this.attackRange = 15; // khoang cach bat dau ban player
        this.fireRate = 1.0; // 1.5s ban 1 vien
        this.fireTimer = 0;         // Bộ đếm thời gian
        this.bulletSpeed = 8;       // Đạn quái bay chậm hơn đạn người một chút cho dễ né

        this.createHPBar();
    }

    createHPBar() {
        this.hpBarContainer = new THREE.Group();

        // Thanh nền
        const bgGeo = new THREE.PlaneGeometry(HP_BAR_WIDTH, HP_BAR_HEIGHT);
        const bgMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
        const bgMesh = new THREE.Mesh(bgGeo, bgMat);

        //  Thanh máu chính
        const hpGeo = new THREE.PlaneGeometry(HP_BAR_WIDTH, HP_BAR_HEIGHT);
        const hpMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.hpBar = new THREE.Mesh(hpGeo, hpMat);

        // Đặt thanh máu đè lên thanh nền một chút để không bị nhấp nháy
        this.hpBar.position.z = 0.01;

        this.hpBarContainer.add(bgMesh);
        this.hpBarContainer.add(this.hpBar);

        // Đặt thanh máu lơ lửng trên đầu Enemy
        this.hpBarContainer.position.y = 2;
        this.mesh.add(this.hpBarContainer);
    }

    // Cập nhật độ dài thanh máu dựa trên phần trăm HP còn lại
    updateHPBar() {
        const healthPercent = Math.max(0, this.hp) / this.maxHp;
        this.hpBar.scale.x = healthPercent;

        // Tính toán để thanh máu co lại về bên trái
        this.hpBar.position.x = (1 - healthPercent) * -(HP_BAR_WIDTH / 2);
    }

    // --- Hàm bắn đạn mới ---
    shoot(targetPosition, scene, enemyBullets) {
        // Tính hướng từ quái đến player
        const direction = new THREE.Vector3();
        direction.subVectors(targetPosition, this.mesh.position).normalize();
        direction.y = 0; // Bắn ngang mặt đất

        // Tạo mesh viên đạn quái (Màu đỏ/cam để phân biệt)
        const bulletGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const bulletMat = new THREE.MeshBasicMaterial({ color: 0xff5500 });
        const bulletMesh = new THREE.Mesh(bulletGeo, bulletMat);
        bulletMesh.position.copy(this.mesh.position);
        scene.add(bulletMesh);

        // Tạo object Bullet và đưa vào mảng quản lý của enemy
        const bullet = new Bullet(bulletMesh, direction, this.bulletSpeed);
        enemyBullets.push(bullet);
    }
    takeDamage(amount) {
        if (this.isDead) return;

        this.hp -= amount;
        this.updateHPBar();

        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
        }
    }

    setBillboardCamera(camera) {
        this.billboardCamera = camera;
    }

    update(dt, player, scene, enemyBullets) {
        if (this.isDead) return;

    // 0. Di chuyển đuổi theo Player (chase)
    const moveDir = player.mesh.position.clone().sub(this.mesh.position);
    moveDir.y = 0;
    if (moveDir.lengthSq() > 0.0001) {
      moveDir.normalize();
      // tốc độ đơn giản (có thể đưa ra Constants nếu muốn)
      this.velocity.copy(moveDir).multiplyScalar(3);
    } else {
      this.velocity.set(0, 0, 0);
    }

        // 1. Xoay hướng về phía Player mượt mà (lookAt)
        // Chúng ta lấy vị trí player nhưng giữ nguyên độ cao Y của quái để quái không bị gục đầu xuống đất
        const lookTarget = player.mesh.position.clone();
        lookTarget.y = this.mesh.position.y;
        this.mesh.lookAt(lookTarget);

        // 2. Logic Bắn đạn
        const distance = this.mesh.position.distanceTo(player.mesh.position);
        if (distance <= this.attackRange) {
            this.fireTimer += dt;
            if (this.fireTimer >= this.fireRate) {
                this.shoot(player.mesh.position, scene, enemyBullets);
                this.fireTimer = 0;
            }
        }

        // 3. Hiệu ứng Billboard cho thanh máu
        if (this.billboardCamera) {
            this.hpBarContainer.quaternion.copy(this.billboardCamera.quaternion);
        }

        super.update(dt);
    }
}