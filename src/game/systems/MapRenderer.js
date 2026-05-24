import * as THREE from 'three';

export class MapRenderer {
    constructor(scene) {
        this.scene = scene;
        this.mapGroup = new THREE.Group();
        this.scene.add(this.mapGroup);

        // Tạo texture bằng HTML Canvas
        this.wallTexture = this.createWallTexture();
        this.floorTexture = this.createFloorTexture();

        // Khởi tạo các Material sử dụng lại để tránh Memory Leak
        this.wallMaterial = new THREE.MeshStandardMaterial({
            map: this.wallTexture,
            roughness: 0.8
        });

        this.floorMaterial = new THREE.MeshStandardMaterial({
            map: this.floorTexture,
            roughness: 0.5
        });

        this.doorMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000 // Cửa hầm ngục bóng tối
        });
    }

    createFloorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1e1a17'; ctx.fillRect(0, 0, 128, 128);
        ctx.lineWidth = 4; ctx.strokeStyle = '#0f0c0a'; ctx.strokeRect(0, 0, 128, 128);
        ctx.fillStyle = '#2a241f'; ctx.fillRect(10, 15, 25, 20); ctx.fillRect(75, 65, 30, 25);
        ctx.fillStyle = '#110f0d'; ctx.fillRect(40, 95, 12, 12); ctx.fillRect(100, 20, 15, 15);
        ctx.strokeStyle = '#0a0807'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(35, 0); ctx.lineTo(50, 30); ctx.lineTo(40, 60); ctx.lineTo(60, 95); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 70); ctx.lineTo(25, 80); ctx.lineTo(35, 128); ctx.stroke();

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }

    createWallTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#110d0a'; ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#2c241c';
        const rowHeight = 32;
        for (let row = 0; row < 4; row++) {
            let y = row * rowHeight;
            let offset = (row % 2 === 0) ? 0 : -32;
            for (let col = -1; col < 3; col++) {
                let x = col * 64 + offset;
                ctx.fillRect(x + 2, y + 2, 60, 28);
                ctx.fillStyle = '#1c1611'; ctx.fillRect(x + 2, y + 26, 60, 4); ctx.fillRect(x + 58, y + 2, 4, 28);
                ctx.fillStyle = '#2c241c';
                if ((row === 1 && col === 0) || (row === 3 && col === 1)) {
                    ctx.strokeStyle = '#050403'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(x + 20, y + 2); ctx.lineTo(x + 35, y + 15); ctx.lineTo(x + 25, y + 30); ctx.stroke();
                }
            }
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }

    render(tiles, width, height) {
        this.mapGroup.clear(); // Xóa map cũ một lần duy nhất khi nhận phòng mới

        const tileSize = 2;
        const wallGeo = new THREE.BoxGeometry(tileSize, 2, tileSize);
        const floorGeo = new THREE.PlaneGeometry(tileSize, tileSize);

        // Tạo vực sâu đen bao quanh map nền
        const voidGeo = new THREE.PlaneGeometry(5000, 5000);
        const voidMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const voidPlane = new THREE.Mesh(voidGeo, voidMat);
        voidPlane.rotation.x = -Math.PI / 2;
        voidPlane.position.set((width * tileSize) / 2, -0.1, (height * tileSize) / 2);
        this.mapGroup.add(voidPlane);

        tiles.forEach((type, i) => {
            const col = i % width;
            const row = Math.floor(i / width);

            // Gốc tọa độ (0,0) đặt ở góc trên-bên-trái để khớp hoàn toàn với Backend mượt mà
            const posX = col * tileSize;
            const posZ = row * tileSize;

            if (type === 0) { // Tường
                const wall = new THREE.Mesh(wallGeo, this.wallMaterial);
                wall.position.set(posX, 1, posZ); // Thả chân chạm đất Y = 0
                this.mapGroup.add(wall);
            } else if (type === 1) { // Sàn
                const floor = new THREE.Mesh(floorGeo, this.floorMaterial);
                floor.rotation.x = -Math.PI / 2;
                floor.position.set(posX, 0, posZ);
                this.mapGroup.add(floor);
            } else if (type === 2) { // Cửa chuyển map
                const doorGeo = new THREE.BoxGeometry(tileSize, 2, tileSize);
                const door = new THREE.Mesh(doorGeo, this.doorMaterial);
                door.position.set(posX, 1, posZ);
                this.mapGroup.add(door);
            }
        });
        console.log("✅ Bản đồ hầm ngục Pixel đã dựng xong không giật lag!");
    }

    update(dt) {}
}