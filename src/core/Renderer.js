import * as THREE from 'three';

export class Renderer extends THREE.WebGLRenderer {
    constructor() {
        super({ antialias: true });

        this.setSize(window.innerWidth, window.innerHeight);

        this.setPixelRatio(window.devicePixelRatio);

        document.body.appendChild(this.domElement);
    }
}