import * as THREE from 'three'

export class Entity {
  constructor(opts) {

    this.mesh = opts.mesh;
    this.velocity = new THREE.Vector3();
    this.hp = opts.hp;
    this.radius = opts.radius;
    this.isDead = false;
  }

  // Hàm cập nhật vị trí dựa trên vận tốc và thời gian
  update(dt) {
    this.mesh.position.addScaledVector(this.velocity, dt);
  }

  // Hàm nhận sát thương
  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
    }
  }
}