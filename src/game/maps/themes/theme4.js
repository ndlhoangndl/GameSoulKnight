import * as THREE from 'three';

function createFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#090816'; ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = 'rgba(129, 140, 248, 0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(20, 20); ctx.lineTo(64, 40); ctx.lineTo(100, 20);
    ctx.moveTo(64, 40); ctx.lineTo(64, 88); ctx.lineTo(20, 100);
    ctx.moveTo(64, 88); ctx.lineTo(100, 100); ctx.stroke();
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(20, 20, 3, 0, Math.PI * 2); ctx.arc(100, 100, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#818cf8'; ctx.beginPath(); ctx.arc(64, 40, 4, 0, Math.PI * 2); ctx.arc(100, 20, 3, 0, Math.PI * 2); ctx.arc(64, 88, 4, 0, Math.PI * 2); ctx.arc(20, 100, 3, 0, Math.PI * 2); ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

function createWallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f0e26'; ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#312e81'; ctx.lineWidth = 2; ctx.strokeRect(0, 0, 128, 128);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(64, 64); ctx.lineTo(128, 0);
    ctx.moveTo(128, 128); ctx.lineTo(64, 64); ctx.lineTo(0, 128); ctx.stroke();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(40, 20); ctx.lineTo(64, 10); ctx.lineTo(88, 20);
    ctx.moveTo(64, 10); ctx.lineTo(64, 40); ctx.moveTo(50, 30); ctx.lineTo(78, 30);
    ctx.moveTo(40, 108); ctx.lineTo(64, 118); ctx.lineTo(88, 108); ctx.moveTo(64, 118); ctx.lineTo(64, 88); ctx.stroke();

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
            color: 0x777788,
            roughness: 0.75
        }),
        floorMaterialAlt: new THREE.MeshStandardMaterial({
            map: floorTex,
            color: 0x888899,
            roughness: 0.8
        }),
        doorMaterial: new THREE.MeshStandardMaterial({
            color: 0x1e1b4b,
            emissive: 0x818cf8,
            emissiveIntensity: 0.5,
            roughness: 0.2,
            transparent: true,
            opacity: 0.4,
            depthWrite: false
        })
    };
}
