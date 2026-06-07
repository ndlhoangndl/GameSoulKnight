import * as THREE from 'three';

function createFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f170d'; ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath(); ctx.arc(35, 45, 18, 0, Math.PI * 2); ctx.arc(95, 85, 22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#15803d'; ctx.lineWidth = 2; ctx.strokeRect(0, 0, 128, 128);
    ctx.beginPath(); ctx.arc(35, 45, 22, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(95, 85, 26, 0, Math.PI * 2); ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

function createWallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1b2a1a'; ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#142013';
    const rowHeight = 32;
    for (let row = 0; row < 4; row++) {
        let y = row * rowHeight;
        let offset = (row % 2 === 0) ? 0 : -32;
        for (let col = -1; col < 3; col++) {
            let x = col * 64 + offset;
            ctx.fillRect(x + 2, y + 2, 60, 28);
        }
    }
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(20, 0, 6, 25);
    ctx.beginPath(); ctx.arc(23, 25, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(80, 0, 8, 40);
    ctx.beginPath(); ctx.arc(84, 40, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(45, 64, 5, 20);
    ctx.beginPath(); ctx.arc(47.5, 84, 3, 0, Math.PI * 2); ctx.fill();

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
            color: 0xb8cbb8,
            roughness: 0.85
        }),
        floorMaterial: new THREE.MeshStandardMaterial({
            map: floorTex,
            color: 0x667766,
            roughness: 0.75
        }),
        floorMaterialAlt: new THREE.MeshStandardMaterial({
            map: floorTex,
            color: 0x6c7c6c,
            roughness: 0.8
        }),
        doorMaterial: new THREE.MeshStandardMaterial({
            color: 0x0f3b18,
            emissive: 0x1eb24b,
            emissiveIntensity: 0.5,
            roughness: 0.2,
            transparent: true,
            opacity: 0.4,
            depthWrite: false
        })
    };
}
