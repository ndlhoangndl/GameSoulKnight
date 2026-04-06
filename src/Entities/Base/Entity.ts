import * as THREE from 'three'


export class Entity {
  public readonly mesh: THREE.Object3D
  public readonly velocity = new THREE.Vector3()

  public hp: number
  public radius: number

  constructor(opts: { mesh: THREE.Object3D; hp: number; radius: number }) {
    this.mesh = opts.mesh
    this.hp = opts.hp
    this.radius = opts.radius
  }

  update(dt: number) {
    // position += velocity * dt
    this.mesh.position.addScaledVector(this.velocity, dt)
  }
}