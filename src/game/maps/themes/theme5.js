import * as THREE from 'three';

function createFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#78350f'; ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#b45309'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, 128, 128);
    ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(40, 10, 80, 50, 128, 30);
    ctx.moveTo(0, 80); ctx.bezierCurveTo(30, 95, 90, 65, 128, 85); ctx.stroke();
    ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(64, 55, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(64, 55, 10, 0, Math.PI * 2); ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

function createWallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#d97706'; ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#b45309';
    const rowHeight = 32;
    for (let row = 0; row < 4; row++) {
        let y = row * rowHeight;
        let offset = (row % 2 === 0) ? 0 : -32;
        for (let col = -1; col < 3; col++) {
            let x = col * 64 + offset;
            ctx.fillRect(x + 2, y + 2, 60, 28);
            ctx.fillStyle = '#78350f'; ctx.fillRect(x + 10, y + 10, 8, 8); ctx.fillRect(x + 46, y + 10, 8, 8);
            ctx.fillStyle = '#b45309';
        }
    }
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(64, 64, 12, 0, Math.PI * 2); ctx.stroke();
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath(); ctx.moveTo(64 + Math.cos(a) * 16, 64 + Math.sin(a) * 16);
        ctx.lineTo(64 + Math.cos(a) * 22, 64 + Math.sin(a) * 22); ctx.stroke();
    }

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
            color: 0xddccbb,
            roughness: 0.85
        }),
        floorMaterial: new THREE.MeshStandardMaterial({
            map: floorTex,
            color: 0x887766,
            roughness: 0.75
        }),
        floorMaterialAlt: new THREE.MeshStandardMaterial({
            map: floorTex,
            color: 0x998877,
            roughness: 0.8
        }),
        doorMaterial: new THREE.MeshStandardMaterial({
            color: 0x451a03,
            emissive: 0xd97706,
            emissiveIntensity: 0.5,
            roughness: 0.2,
            transparent: true,
            opacity: 0.4,
            depthWrite: false
        })
    };
}
