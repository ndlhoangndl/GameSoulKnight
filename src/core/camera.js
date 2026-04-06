import * as THREE from 'three';

export class Camera extends THREE.PerspectiveCamera {
    constructor() {
        const aspect = window.innerWidth / window.innerHeight;
        super(75, aspect, 0.1, 1000);

        //vi tr
        this.position.set(0, 15, 10);
        this.lookAt(0, 0, 0);
    }
}