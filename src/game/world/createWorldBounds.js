import * as THREE from 'three';

// Hàm helper tạo pattern bằng Canvas dùng chung nội bộ
function createFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Nền tối, màu đất đá sẫm (Dark earthy stone)
    ctx.fillStyle = '#1e1a17';
    ctx.fillRect(0, 0, 128, 128);

    // Kẻ viền mạch vữa màu đen/nâu đen
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0f0c0a';
    ctx.strokeRect(0, 0, 128, 128);

    // Thêm các mảng vân đất đá gồ ghề
    ctx.fillStyle = '#2a241f'; // sáng hơn xíu
    ctx.fillRect(10, 15, 25, 20);
    ctx.fillRect(75, 65, 30, 25);

    ctx.fillStyle = '#110f0d'; // lõm tối
    ctx.fillRect(40, 95, 12, 12);
    ctx.fillRect(100, 20, 15, 15);

    // Vẽ vết nứt vỡ (Cracks) trên sàn
    ctx.strokeStyle = '#0a0807';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(35, 0);
    ctx.lineTo(50, 30);
    ctx.lineTo(40, 60);
    ctx.lineTo(60, 95);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 70);
    ctx.lineTo(25, 80);
    ctx.lineTo(35, 128);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

function createWallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Mạch vữa (tối đen/nâu đen nhánh)
    ctx.fillStyle = '#110d0a';
    ctx.fillRect(0, 0, 128, 128);

    // Xếp gạch khối: Màu nâu đất đá tối (Dark dirt/stone)
    ctx.fillStyle = '#2c241c';

    // Ráp các viên gạch sole nhau
    const rowHeight = 32;
    for (let row = 0; row < 4; row++) {
        let y = row * rowHeight;
        let offset = (row % 2 === 0) ? 0 : -32; // Hàng lẻ thụt lùi để sole gạch
        for (let col = -1; col < 3; col++) {
            let x = col * 64 + offset;

            // Vẽ 1 viên gạch
            ctx.fillRect(x + 2, y + 2, 60, 28);

            // Đánh khối dìm tối phần viền dưới và phải để gạch nổi lên
            ctx.fillStyle = '#1c1611';
            ctx.fillRect(x + 2, y + 26, 60, 4);
            ctx.fillRect(x + 58, y + 2, 4, 28);

            // Trả lại màu gạch gốc cho viên tiếp theo
            ctx.fillStyle = '#2c241c';

            // Hardcode một vài viên bị nứt vỡ
            if ((row === 1 && col === 0) || (row === 3 && col === 1)) {
                ctx.strokeStyle = '#050403';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + 20, y + 2);
                ctx.lineTo(x + 35, y + 15);
                ctx.lineTo(x + 25, y + 30);
                ctx.stroke();
            }
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

export class WorldSystem {
	constructor(scene, textures = {}) {
		this.scene = scene;
		this.entities = []; // Chứa các mesh tường để dễ dọn dẹp
		this.tileSize = 2;   // Tương ứng 64px của Backend

		// Map data for collision
		this.mapTiles = [];
		this.mapWidth = 0;
		this.mapHeight = 0;

		// Materials (Đổi thành MeshBasicMaterial để phát sáng neon)
		this.wallMat = new THREE.MeshBasicMaterial({ map: createWallTexture() });
		this.floorMat = new THREE.MeshBasicMaterial({ map: createFloorTexture() });
		this.doorMat = new THREE.MeshBasicMaterial({ color: 0xf4a261 });

		this.wallGeo = new THREE.BoxGeometry(this.tileSize, 2, this.tileSize);
		this.floorGeo = new THREE.PlaneGeometry(this.tileSize, this.tileSize);

		// Dựng tạm một cái map mặc định không thì màn hình bị đen thui
		this.buildDefaultMap();
	}

	buildDefaultMap() {
		// Clone material để set tiling đẹp cho sàn lớn
		const defaultFloorMat = this.floorMat.clone();
		if (defaultFloorMat.map) {
			const mapTexture = defaultFloorMat.map.clone();
			mapTexture.wrapS = THREE.RepeatWrapping;
			mapTexture.wrapT = THREE.RepeatWrapping;
			mapTexture.repeat.set(50, 50); // Lặp texture thay vì kéo giãn
			mapTexture.needsUpdate = true;
			defaultFloorMat.map = mapTexture;
		}

		// Tạo 1 sàn lớn làm placeholder
		const floor = new THREE.Mesh(
			new THREE.PlaneGeometry(200, 200),
			defaultFloorMat
		);
		floor.rotation.x = -Math.PI / 2;
		floor.position.y = -0.1;
		floor.receiveShadow = true;
		this.scene.add(floor);
		this.entities.push(floor);

		// Tạo vài bức tường viền
		const wallSize = 200;
		const borderThickness = 4;
		const edgeGeo = new THREE.BoxGeometry(wallSize, 10, borderThickness);

		const edges = [
			{ x: 0, z: -wallSize/2 }, // top
			{ x: 0, z: wallSize/2 },  // bottom
		];
		edges.forEach(pos => {
			const w = new THREE.Mesh(edgeGeo, this.wallMat);
			w.position.set(pos.x, 5, pos.z);
			this.scene.add(w);
			this.entities.push(w);
		});

		const sideGeo = new THREE.BoxGeometry(borderThickness, 10, wallSize);
		const sides = [
			{ x: -wallSize/2, z: 0 },
			{ x: wallSize/2, z: 0 }
		];
		sides.forEach(pos => {
			const w = new THREE.Mesh(sideGeo, this.wallMat);
			w.position.set(pos.x, 5, pos.z);
			this.scene.add(w);
			this.entities.push(w);
		});
	}

	// Hàm này thay thế hoàn toàn logic createWorldBounds cũ
	rebuildMap(data) {
		// 1. Xoá sạch map cũ
		this.entities.forEach(obj => {
			if(obj.geometry) obj.geometry.dispose();
			if(obj.material) obj.material.dispose();
			this.scene.remove(obj)
		});
		this.entities = [];

		const { Tiles, Width, Height } = data; // Dữ liệu từ RoomSwitch

		if (!Tiles) return;

		this.mapTiles = Tiles;
		this.mapWidth = Width;
		this.mapHeight = Height;

		// 2. Tạo một sàn nhà lớn (Floor) nguyên mảng cho đẹp và tối ưu
		const worldWidth = Width * this.tileSize;
		const worldHeight = Height * this.tileSize;

		// Tính toán material cho sàn (nếu dùng texture lặp)
		const currentFloorMat = this.floorMat.clone();
		if (currentFloorMat.map) {
			currentFloorMat.map = currentFloorMat.map.clone();
			currentFloorMat.map.wrapS = THREE.RepeatWrapping;
			currentFloorMat.map.wrapT = THREE.RepeatWrapping;
			// Bạn có thể chỉnh lại tỉ lệ repeat sao cho khớp với kích thước map BE (hiện tại tạm để 1 hoặc theo tỉ lệ)
			currentFloorMat.map.repeat.set(Width / 2, Height / 2);
			currentFloorMat.map.needsUpdate = true;
		}

		const mainFloor = new THREE.Mesh(
			new THREE.PlaneGeometry(worldWidth, worldHeight),
			currentFloorMat
		);
		mainFloor.rotation.x = -Math.PI / 2;
		mainFloor.position.set(0, 0, 0); // Đặt tâm ở gốc tọa độ
		mainFloor.receiveShadow = true;
		this.scene.add(mainFloor);
		this.entities.push(mainFloor);

		// 3. Duyệt mảng Tiles để vẽ Tường (0) và Cửa (2)
		Tiles.forEach((tileType, index) => {
			const x = index % Width;
			const z = Math.floor(index / Width);

			// Tính toán vị trí tâm của ô (Align với gốc tọa độ giống sàn lớn)
			const posX = (x - Width / 2) * this.tileSize + this.tileSize / 2;
			const posZ = (z - Height / 2) * this.tileSize + this.tileSize / 2;

			if (tileType === 0) { // Wall
				const wall = new THREE.Mesh(this.wallGeo, this.wallMat);
				wall.position.set(posX, 1, posZ);
				wall.receiveShadow = true;
				wall.castShadow = true;
				this.scene.add(wall);
				this.entities.push(wall);
			} else if (tileType === 2) { // Door
				const door = new THREE.Mesh(this.floorGeo, this.doorMat);
				door.rotation.x = -Math.PI / 2;
				door.position.set(posX, 0.05, posZ); // Hơi cao hơn sàn tí
				door.receiveShadow = true;
				this.scene.add(door);
				this.entities.push(door);
			}
		});
	}

	canMoveTo(x, z, radius = 0.6) {
		if (!this.mapTiles || this.mapTiles.length === 0) return true;

		// Check 4 corners of the entity
		const corners = [
			{ cx: x + radius, cz: z + radius },
			{ cx: x - radius, cz: z + radius },
			{ cx: x + radius, cz: z - radius },
			{ cx: x - radius, cz: z - radius }
		];

		for (let c of corners) {
			const gridX = Math.floor((c.cx / this.tileSize) + (this.mapWidth / 2));
			const gridZ = Math.floor((c.cz / this.tileSize) + (this.mapHeight / 2));

			if (gridX < 0 || gridX >= this.mapWidth || gridZ < 0 || gridZ >= this.mapHeight) {
				return false; // Ngoài map
			}

			const index = gridZ * this.mapWidth + gridX;
			const tileType = this.mapTiles[index];

			// 0: Wall (cannot move onto)
			if (tileType === 0) {
				return false;
			}
		}

		return true; // All corners are on walkable tiles
	}
}
