import * as THREE from 'three';
import { createTheme as createTheme1 } from '../maps/themes/theme1.js';
import { createTheme as createTheme2 } from '../maps/themes/theme2.js';
import { createTheme as createTheme3 } from '../maps/themes/theme3.js';
import { createTheme as createTheme4 } from '../maps/themes/theme4.js';
import { createTheme as createTheme5 } from '../maps/themes/theme5.js';

export class MapRenderer {
    constructor(scene, { tileSize = 1 } = {}) {
        this.scene = scene;
        this.mapGroup = new THREE.Group();
        this.scene.add(this.mapGroup);
        this.tileSize = tileSize;
        this.mapWidth = 0;
        this.mapHeight = 0;

        // Register themes for each of the 5 rooms
        this.themes = {
            1: createTheme1(),
            2: createTheme2(),
            3: createTheme3(),
            4: createTheme4(),
            5: createTheme5()
        };

        // Default to Theme 1
        this.activeTheme = this.themes[1];
        this.time = 0;
    }

    render(tiles, width, height, tileSizeOverride, roomId = 1) {
        this.mapGroup.clear();

        // Safe integer conversion for roomId (in case of parsing issues)
        const numericRoomId = parseInt(roomId, 10) || 1;
        this.activeTheme = this.themes[numericRoomId] || this.themes[1];

        const tileSize = tileSizeOverride ?? this.tileSize;
        this.tileSize = tileSize;
        this.mapWidth = width;
        this.mapHeight = height;
        const wallHeight = 1.6;
        const doorHeight = 1.1;
        const wallGeo = new THREE.BoxGeometry(tileSize, wallHeight, tileSize);
        const floorGeo = new THREE.PlaneGeometry(tileSize, tileSize);

        // Dark space/abyss background
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

            const posX = (col + 0.5) * tileSize;
            const posZ = (row + 0.5) * tileSize;

            // Render floor tile
            const floorMat = (row + col) % 3 === 0 ? this.activeTheme.floorMaterialAlt : this.activeTheme.floorMaterial;
            const floor = new THREE.Mesh(floorGeo, floorMat);
            floor.rotation.x = -Math.PI / 2;
            floor.position.set(posX, 0, posZ);
            this.mapGroup.add(floor);

            if (type === 0) { // Wall
                const wall = new THREE.Mesh(wallGeo, this.activeTheme.wallMaterial);
                wall.position.set(posX, wallHeight / 2, posZ);
                this.mapGroup.add(wall);
            } else if (type === 2) { // Portal doorway
                const doorGeo = new THREE.BoxGeometry(tileSize, doorHeight, tileSize);
                const door = new THREE.Mesh(doorGeo, this.activeTheme.doorMaterial);
                door.position.set(posX, doorHeight / 2, posZ);
                this.mapGroup.add(door);
            }
        });
        console.log(`Map ${numericRoomId} rendered`, { doors: tiles.filter(t => t === 2).length });
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

    update(dt) {
        this.time += dt;
        if (this.activeTheme && this.activeTheme.doorMaterial) {
            this.activeTheme.doorMaterial.emissiveIntensity = 0.4 + Math.sin(this.time * 3.0) * 0.2;
            this.activeTheme.doorMaterial.opacity = 0.35 + Math.sin(this.time * 3.0) * 0.1;
        }
    }
}