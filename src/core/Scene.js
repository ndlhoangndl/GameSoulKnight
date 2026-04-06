import * as THREE from 'three';

export class Scene extends THREE.Scene {
    constructor() {
        super();

        this.background = new THREE.Color(0x111111);
    }
}