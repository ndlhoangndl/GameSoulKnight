import * as THREE from 'three';

function mulberry32(seed) {
	let a = seed >>> 0;
	return function () {
		a += 0x6D2B79F5;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}


export function createDungeonTexture({
	size = 1024,
	seed = 1337,
	tileCount = 14,
	baseColor = '#2b2f36',
	tileColorA = '#303640',
	tileColorB = '#252a31',
	groutColor = 'rgba(6,7,9,0.95)'
} = {}) {
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('2D canvas context not available');

	const rand = mulberry32(seed);

	// Base
	ctx.fillStyle = baseColor;
	ctx.fillRect(0, 0, size, size);

	const tileW = size / tileCount;
	const tileH = size / tileCount;

	// Tiles
	for (let y = 0; y < tileCount; y++) {
		for (let x = 0; x < tileCount; x++) {
			const jitterX = (rand() - 0.5) * tileW * 0.06;
			const jitterY = (rand() - 0.5) * tileH * 0.06;
			const px = x * tileW + jitterX;
			const py = y * tileH + jitterY;

			ctx.fillStyle = rand() < 0.5 ? tileColorA : tileColorB;
			ctx.fillRect(px, py, tileW, tileH);

			// subtle highlight/shadow
			ctx.fillStyle = 'rgba(255,255,255,0.03)';
			ctx.fillRect(px + 2, py + 2, tileW - 4, 2);
			ctx.fillStyle = 'rgba(0,0,0,0.10)';
			ctx.fillRect(px + 2, py + tileH - 4, tileW - 4, 2);
		}
	}

	// Grout lines
	ctx.strokeStyle = groutColor;
	ctx.lineWidth = Math.max(2, Math.floor(size / 320));
	ctx.beginPath();
	for (let i = 0; i <= tileCount; i++) {
		const p = i * tileW;
		ctx.moveTo(p, 0);
		ctx.lineTo(p, size);
		ctx.moveTo(0, p);
		ctx.lineTo(size, p);
	}
	ctx.stroke();

	// Cracks / scratches
	const crackCount = Math.floor(tileCount * 3);
	for (let i = 0; i < crackCount; i++) {
		const sx = rand() * size;
		const sy = rand() * size;
		const segs = 6 + Math.floor(rand() * 10);
		let x = sx;
		let y = sy;
		ctx.strokeStyle = `rgba(0,0,0,${0.20 + rand() * 0.25})`;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(x, y);
		for (let s = 0; s < segs; s++) {
			const ang = rand() * Math.PI * 2;
			const len = 14 + rand() * 35;
			x += Math.cos(ang) * len;
			y += Math.sin(ang) * len;
			ctx.lineTo(x, y);
		}
		ctx.stroke();
	}

	// Noise overlay
	ctx.fillStyle = 'rgba(255,255,255,0.035)';
	for (let i = 0; i < size * 0.12; i++) {
		const nx = rand() * size;
		const ny = rand() * size;
		const r = rand() * 1.3;
		ctx.fillRect(nx, ny, r, r);
	}

	// Vignette
	const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.2, size / 2, size / 2, size * 0.75);
	g.addColorStop(0, 'rgba(0,0,0,0)');
	g.addColorStop(1, 'rgba(0,0,0,0.55)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, size, size);

	const texture = new THREE.CanvasTexture(canvas);
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(1, 1);
	texture.anisotropy = 4;
	texture.needsUpdate = true;

	return texture;
}


