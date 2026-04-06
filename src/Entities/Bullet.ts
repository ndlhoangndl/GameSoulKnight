import * as THREE from 'three';
import { Entity } from './Base/Entity';

export class Bullet extends Entity {
    public isDead: boolean = false;
    private lifeTime: number = 2;

    constructor(mesh: THREE.Mesh, direction: THREE.Vector3, speed: number) {
        super({ mesh, hp: 1, radius: 0.2 });
        this.velocity.copy(direction).multiplyScalar(speed);
    }

    update(dt: number) {
        super.update(dt);
        this.lifeTime -= dt;
        if (this.lifeTime <= 0) this.isDead = true;
    }
}