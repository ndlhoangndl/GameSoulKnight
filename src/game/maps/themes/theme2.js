import * as THREE from 'three';

function createFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#120707'; ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#2a0d0d'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, 128, 128);
    ctx.strokeStyle = '#ff3300'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(30, 45); ctx.lineTo(50, 25);
    ctx.lineTo(90, 80); ctx.lineTo(128, 70); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(40, 128); ctx.lineTo(60, 95); ctx.lineTo(90, 80); ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

function createWallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#220b0b'; ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#1c0808';
    const rowHeight = 32;
    for (let row = 0; row < 4; row++) {
        let y = row * rowHeight;
        let offset = (row % 2 === 0) ? 0 : -32;
        for (let col = -1; col < 3; col++) {
            let x = col * 64 + offset;
            ctx.fillRect(x + 2, y + 2, 60, 28);
            ctx.fillStyle = '#3a0f0f'; ctx.fillRect(x + 2, y + 26, 60, 4);
            ctx.fillStyle = '#1c0808';
        }
    }
    ctx.strokeStyle = '#ff4400'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(64, 0); ctx.lineTo(45, 40); ctx.lineTo(80, 85); ctx.lineTo(60, 128); ctx.stroke();

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
            color: 0xcccccc,
            roughness: 0.85
        }),
        floorMaterial: new THREE.MeshStandardMaterial({
            map: floorTex,
            color: 0x666666,
            roughness: 0.75
        }),
        floorMaterialAlt: new THREE.MeshStandardMaterial({
            map: floorTex,
            color: 0x7c6c6c,
            roughness: 0.8
        }),
        doorMaterial: new THREE.MeshStandardMaterial({
            color: 0x440000,
            emissive: 0xcc2200,
            emissiveIntensity: 0.5,
            roughness: 0.2,
            transparent: true,
            opacity: 0.4,
            depthWrite: false
        })
    };
}
