import * as THREE from 'three';

export class Entity {
  constructor(opts) {
    this.mesh = opts.mesh;
    this.velocity = new THREE.Vector3();
    this.hp = opts.hp;
    this.radius = opts.radius;
    this.isDead = false;
  }

  update(dt) {
    this.mesh.position.addScaledVector(this.velocity, dt);
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
    }
  }
}