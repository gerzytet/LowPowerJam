/*
@file sketch.js
@author entire team
@date 10/7/2022
@brief Projectile properties
*/

const projectileSize = 10;

class Projectile {
  constructor(pos, vel, owner) {
    this.pos = pos;
    this.vel = vel;
    this.owner = owner;
    this.acc = 0.03;
  }

  render() {
    push();
    translate(this.pos);
    fill(255, 0, 0);
    sphere(projectileSize);
    pop();
  }

  move() {
    this.pos.add(this.vel);
    this.vel.y += this.acc;
  }

  getCollider() {
    return new SphereCollider(this.pos.copy(), projectileSize);
  }

  isDespawned() {
    return this.pos.y > 0;
  }
}
