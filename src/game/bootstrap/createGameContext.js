import * as THREE from 'three';
import { Scene } from '../../core/Scene.js';
import { Renderer } from '../../core/Renderer.js';
import { Camera } from '../../core/camera.js';
import { Input } from '../../Systems/Input.js';
import { ASSET_URLS } from '../../utils/Constants.js';

export function createGameContext() {
	const scene = new Scene();
	const camera = new Camera();
	const renderer = new Renderer();
	const input = new Input();

	const loader = new THREE.TextureLoader();

	const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
	scene.add(ambientLight);
	const dirLight = new THREE.DirectionalLight(0xffffff, 1);
	dirLight.position.set(5, 10, 7);
	scene.add(dirLight);

	const textures = {
		player: loader.load(ASSET_URLS.player),
		boss: loader.load(ASSET_URLS.boss),
		boss2: loader.load(ASSET_URLS.boss2)
	};

	return {
		scene,
		camera,
		renderer,
		input,
		loader,
		textures
	};
}

