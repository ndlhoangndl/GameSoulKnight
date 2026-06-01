import * as THREE from 'three';

export class MapRenderer {
    constructor(scene, { tileSize = 1 } = {}) {
        this.scene = scene;
        this.mapGroup = new THREE.Group();
        this.scene.add(this.mapGroup);
        this.tileSize = tileSize;
        this.mapWidth = 0;
        this.mapHeight = 0;

        // Tạo texture bằng HTML Canvas
        this.wallTexture = this.createWallTexture();
        this.floorTexture = this.createFloorTexture();

        // Khởi tạo các Material sử dụng lại để tránh Memory Leak
        this.wallMaterial = new THREE.MeshStandardMaterial({
            map: this.wallTexture,
            color: 0xb7b7b7,
            roughness: 0.75
        });

        this.floorMaterial = new THREE.MeshStandardMaterial({
            map: this.floorTexture,
            color: 0x2a2a2a,
            roughness: 0.65
        });

        this.floorMaterialAlt = new THREE.MeshStandardMaterial({
            map: this.floorTexture,
            color: 0x3a3a3a,
            roughness: 0.7
        });

        this.doorMaterial = new THREE.MeshStandardMaterial({
            color: 0xf0d58b,
            emissive: 0x5a3f12,
            emissiveIntensity: 0.5,
            roughness: 0.6
        });
    }

    createFloorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#24211f'; ctx.fillRect(0, 0, 128, 128);
        ctx.lineWidth = 3; ctx.strokeStyle = '#141110'; ctx.strokeRect(0, 0, 128, 128);
        ctx.fillStyle = '#34302b'; ctx.fillRect(10, 15, 25, 20); ctx.fillRect(75, 65, 30, 25);
        ctx.fillStyle = '#1a1714'; ctx.fillRect(40, 95, 12, 12); ctx.fillRect(100, 20, 15, 15);
        ctx.strokeStyle = '#0f0d0c'; ctx.lineWidth = 2;
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
        ctx.fillStyle = '#8d8d8d'; ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#a0a0a0';
        const rowHeight = 32;
        for (let row = 0; row < 4; row++) {
            let y = row * rowHeight;
            let offset = (row % 2 === 0) ? 0 : -32;
            for (let col = -1; col < 3; col++) {
                let x = col * 64 + offset;
                ctx.fillRect(x + 2, y + 2, 60, 28);
                ctx.fillStyle = '#737373'; ctx.fillRect(x + 2, y + 26, 60, 4); ctx.fillRect(x + 58, y + 2, 4, 28);
                ctx.fillStyle = '#a0a0a0';
                if ((row === 1 && col === 0) || (row === 3 && col === 1)) {
                    ctx.strokeStyle = '#4f4f4f'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(x + 20, y + 2); ctx.lineTo(x + 35, y + 15); ctx.lineTo(x + 25, y + 30); ctx.stroke();
                }
            }
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }

    render(tiles, width, height, tileSizeOverride) {
        this.mapGroup.clear(); // Xóa map cũ một lần duy nhất khi nhận phòng mới

        const tileSize = tileSizeOverride ?? this.tileSize;
        this.tileSize = tileSize;
        this.mapWidth = width;
        this.mapHeight = height;
        const wallHeight = 1.6;
        const doorHeight = 1.1;
        const wallGeo = new THREE.BoxGeometry(tileSize, wallHeight, tileSize);
        const floorGeo = new THREE.PlaneGeometry(tileSize, tileSize);

        // Tạo vực sâu đen bao quanh map nền
        const voidSize = Math.max(width, height) * tileSize * 6;
        const voidGeo = new THREE.PlaneGeometry(voidSize, voidSize);
        const voidMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const voidPlane = new THREE.Mesh(voidGeo, voidMat);
        voidPlane.rotation.x = -Math.PI / 2;
        voidPlane.position.set((width * tileSize) / 2, -0.1, (height * tileSize) / 2);
        this.mapGroup.add(voidPlane);

        tiles.forEach((type, i) => {
            const col = i % width;
            const row = Math.floor(i / width);

            // Căn chỉnh trục Z trực tiếp để khớp với toạ độ của Server và Player
            const posX = (col + 0.5) * tileSize;
            const posZ = (row + 0.5) * tileSize;

            // Always draw a floor tile so walls/doors sit on top and don't look like void.
            const floorMat = (row + col) % 3 === 0 ? this.floorMaterialAlt : this.floorMaterial;
            const floor = new THREE.Mesh(floorGeo, floorMat);
            floor.rotation.x = -Math.PI / 2;
            floor.position.set(posX, 0, posZ);
            this.mapGroup.add(floor);

            if (type === 0) { // Tường
                const wall = new THREE.Mesh(wallGeo, this.wallMaterial);
                wall.position.set(posX, wallHeight / 2, posZ); // Thả chân chạm đất Y = 0
                this.mapGroup.add(wall);
            } else if (type === 2) { // Cửa chuyển map
                const doorGeo = new THREE.BoxGeometry(tileSize, doorHeight, tileSize);
                const door = new THREE.Mesh(doorGeo, this.doorMaterial);
                door.position.set(posX, doorHeight / 2, posZ);
                this.mapGroup.add(door);
            }
        });
        console.log('Map rendered', { doors: tiles.filter(t => t === 2).length });
    }

    getWorldBounds() {
        const widthWorld = this.mapWidth * this.tileSize;
        const heightWorld = this.mapHeight * this.tileSize;
        return {
            minX: 0,
            maxX: widthWorld,
            minZ: 0,
            maxZ: heightWorld,
            centerX: widthWorld / 2,
            centerZ: heightWorld / 2,
            widthWorld,
            heightWorld
        };
    }

    update(dt) {}
}