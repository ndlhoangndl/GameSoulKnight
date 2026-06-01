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

        // Độ rộng thanh máu tỷ lệ với kích thước quái để cân đối
        this.barWidth = this.radius * 1.3;
        this.barHeight = 0.08;
        const border = 0.02; // Độ dày viền đen bao quanh thanh máu

        // Thanh nền làm viền đen sắc nét xung quanh
        const bgGeo = new THREE.PlaneGeometry(this.barWidth + border * 2, this.barHeight + border * 2);
        const bgMat = new THREE.MeshBasicMaterial({ color: 0x111827, side: THREE.DoubleSide, depthWrite: false, transparent: true, opacity: 0.85 });
        const bgMesh = new THREE.Mesh(bgGeo, bgMat);

        // Thanh máu chính (mặc định xanh neon rất đẹp)
        const hpGeo = new THREE.PlaneGeometry(this.barWidth, this.barHeight);
        const hpMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, depthWrite: false });
        this.hpBar = new THREE.Mesh(hpGeo, hpMat);

        // Đặt thanh máu đè nhẹ lên thanh nền để tránh hiện tượng z-fighting nhấp nháy
        this.hpBar.position.z = 0.005;

        this.hpBarContainer.add(bgMesh);
        this.hpBarContainer.add(this.hpBar);

        // Đặt thanh máu "trên đầu" quái:
        // Parent mesh đã nằm phẳng (rotation.x = -Math.PI / 2).
        // Trục Y cục bộ của mesh trỏ về hướng -Z toàn cục (lên trên màn hình).
        // Trục Z cục bộ của mesh trỏ về hướng Y toàn cục (lên trên mặt đất).
        // offset Y = -(radius + 0.15) để kéo lên trên đầu quái, Z = 0.02 để nổi hẳn lên trên sprite
        this.hpBarContainer.position.set(0, -(this.radius + 0.15), 0.02);
        this.mesh.add(this.hpBarContainer);
    }

    // Cập nhật độ dài thanh máu dựa trên phần trăm HP còn lại và đổi màu neon
    updateHPBar() {
        const healthPercent = Math.max(0, this.hp) / this.maxHp;
        this.hpBar.scale.x = healthPercent;

        // Tính toán để thanh máu co lại về bên trái
        this.hpBar.position.x = (1 - healthPercent) * -(this.barWidth / 2);

        // Thay đổi màu sắc dựa trên lượng máu còn lại
        if (healthPercent > 0.5) {
            this.hpBar.material.color.setHex(0x10b981); // Xanh lá neon (Đầy máu)
        } else if (healthPercent > 0.25) {
            this.hpBar.material.color.setHex(0xf59e0b); // Cam vàng neon (Máu trung bình)
        } else {
            this.hpBar.material.color.setHex(0xef4444); // Đỏ neon (Yếu máu)
        }
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

        // Không cần billboard quay theo camera vì camera orthographic nhìn thẳng góc xuống sàn,
        // giúp sprite phẳng nằm trên sàn hiển thị trực diện một cách tự nhiên và ổn định nhất.

        // Không xử lý logic đuổi và bắn đạn trên FE nữa vì hệ thống Backend đã đảm nhiệm phần tính toán và đồng bộ vị trí, máu và đạn thông qua SocketManager.

        super.update(dt);
    }
}