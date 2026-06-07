import * as THREE from 'three';

function createFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f111a'; ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 1; ctx.strokeRect(0, 0, 128, 128);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)'; ctx.strokeRect(8, 8, 112, 112);
    ctx.fillStyle = '#1e2238'; ctx.fillRect(20, 20, 20, 20); ctx.fillRect(88, 20, 20, 20);
    ctx.fillRect(20, 88, 20, 20); ctx.fillRect(88, 88, 20, 20);
    ctx.fillStyle = '#00f0ff'; ctx.fillRect(28, 28, 4, 4); ctx.fillRect(96, 28, 4, 4);
    ctx.fillRect(28, 96, 4, 4); ctx.fillRect(96, 96, 4, 4);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

function createWallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#171923'; ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#2d3748'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, 128, 128);
    ctx.strokeRect(0, 0, 64, 64); ctx.strokeRect(64, 0, 64, 64);
    ctx.strokeRect(0, 64, 64, 64); ctx.strokeRect(64, 64, 64, 64);
    ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(32, 0); ctx.lineTo(32, 20); ctx.lineTo(96, 40);
    ctx.lineTo(96, 80); ctx.lineTo(40, 100); ctx.lineTo(40, 128); ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

export function createTheme() {
    const wallTex = createWallTexture();
    const floorTex = createFloorTexture();
    
    return {
        wallMaterial: new THREE.MeshStandardMaterial({
            map: wallTex,
            color: 0xdddddd,
            roughness: 0.85
        }),
        floorMaterial: new THREE.MeshStandardMaterial({
            map: floorTex,
            color: 0x777777,
            roughness: 0.75
        }),
        floorMaterialAlt: new THREE.MeshStandardMaterial({
            map: floorTex,
            color: 0x888899,
            roughness: 0.8
        }),
        doorMaterial: new THREE.MeshStandardMaterial({
            color: 0x003366,
            emissive: 0x00c0ff,
            emissiveIntensity: 0.5,
            roughness: 0.2,
            transparent: true,
            opacity: 0.4,
            depthWrite: false
        })
    };
}
