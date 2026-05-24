import * as THREE from 'three'
import { Entity } from '../Base/Entity.js'

const HP_BAR_WIDTH = 1.5
const HP_BAR_HEIGHT = 0.2

export class Enemy extends Entity {
    constructor(mesh, maxHp = 100, radius = 0.75, opts = {}) {
        super({ mesh, hp: maxHp, radius });
        this.isDead = false;
        this.maxHp = maxHp;
        this.billboardCamera = null;
        // Thong so chien dau moi
        this.attackRange = opts.attackRange ?? 15; // khoang cach bat dau ban player
        this.fireRate = opts.fireRate ?? 1.0; // s/shot
        this.fireTimer = 0;         // Bộ đếm thời gian
        this.bulletSpeed = opts.bulletSpeed ?? 10;       // Đạn quái bay chậm hơn đạn người một chút cho dễ né

        // Pattern bắn: 'single' | 'triple'
        this.shotPattern = opts.shotPattern ?? 'single';
        // Độ xoè của 2 viên hai bên (radians). ~12deg mặc định.
        this.spreadAngle = opts.spreadAngle ?? (Math.PI / 15);

        this.createHPBar();
    }

    createHPBar() {
        this.hpBarContainer = new THREE.Group();
		// Thanh máu kiểu 2D: nằm ngang trên mặt đất (giống sprite), không "dán" lên mặt khối.
		// Khi enemy là PlaneGeometry top-down, thanh máu cũng nên là plane top-down.

        // Thanh nền
        const bgGeo = new THREE.PlaneGeometry(HP_BAR_WIDTH, HP_BAR_HEIGHT);
		const bgMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide, depthWrite: false });
        const bgMesh = new THREE.Mesh(bgGeo, bgMat);

        //  Thanh máu chính
        const hpGeo = new THREE.PlaneGeometry(HP_BAR_WIDTH, HP_BAR_HEIGHT);
		const hpMat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, depthWrite: false });
        this.hpBar = new THREE.Mesh(hpGeo, hpMat);

        // Đặt thanh máu đè lên thanh nền một chút để không bị nhấp nháy
        this.hpBar.position.z = 0.01;

        this.hpBarContainer.add(bgMesh);
        this.hpBarContainer.add(this.hpBar);

        // Đặt thanh máu "trên đầu" theo kiểu top-down: tăng Y một chút, vẫn nằm ngang
        this.hpBarContainer.position.y = 2;
		this.hpBarContainer.rotation.x = -Math.PI / 2;
        this.mesh.add(this.hpBarContainer);
    }

    // Cập nhật độ dài thanh máu dựa trên phần trăm HP còn lại
    updateHPBar() {
        const healthPercent = Math.max(0, this.hp) / this.maxHp;
        this.hpBar.scale.x = healthPercent;

        // Tính toán để thanh máu co lại về bên trái
        this.hpBar.position.x = (1 - healthPercent) * -(HP_BAR_WIDTH / 2);
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

    update(dt) {
        if (this.isDead) return;

        // 1. Billboard: luôn nhìn về hướng camera (kiểu 2D)
        if (this.billboardCamera) {
            this.mesh.quaternion.copy(this.billboardCamera.quaternion);
        }

        // Không xử lý logic đuổi và bắn đạn trên FE nữa vì hệ thống Backend đã đảm nhiệm phần tính toán và đồng bộ vị trí, máu và đạn thông qua SocketManager.

        // 3. Thanh máu top-down: đã xoay nằm ngang ngay từ đầu, không cần copy quaternion theo camera

        super.update(dt);
    }
}