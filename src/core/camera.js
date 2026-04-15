import * as THREE from 'three';

export class Camera extends THREE.PerspectiveCamera {
    constructor() {
        const aspect = window.innerWidth / window.innerHeight;
        super(75, aspect, 0.1, 1000);

        // Top-down (2D-like) camera
        this.position.set(0, 35, 0.01);
        this.up.set(0, 0, -1);
        this.lookAt(0, 0, 0);
    }
}