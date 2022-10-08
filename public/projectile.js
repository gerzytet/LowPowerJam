/*
@file sketch.js
@author entire team
@date 10/7/2022
@brief Projectile properties
*/

const PROJECTILE_SIZE = 10;

class Projectile {
  constructor(pos, vel, owner) {
    this.pos = pos
    this.vel = vel
    this.owner = owner
    this.acc = 0.03
    this.size = PROJECTILE_SIZE + random(-2, 2)

    this.xr = random(-3, 3)
    this.yr = random(-3, 3)
    this.zr = random(-3, 3)

    this.xrv = random(-0.1, 0.1)
    this.yrv = random(-0.1, 0.1)
    this.zrv = random(-0.1, 0.1)

    this.dead = false
  }

  render() {
    push()
      translate(this.pos)
      rotateX(this.xr)
      rotateY(this.yr)
      rotateZ(this.zr)
      scale(this.size / 100)
      model(TOMATO_OBJ)
    pop()
  }

  move() {
    if (this.dead) {
      return
    }
    
    this.pos.add(this.vel)
    this.vel.y += this.acc

    if (this.pos.y > 0) {
      this.dead = true
    }

    this.xr += this.xrv
    this.yr += this.yrv
    this.zr += this.zrv
  }

  getCollider() {
    if (this.dead) {
      return new NullCollider()
    } else {
      return new SphereCollider(this.pos.copy(), this.size)
    }
  }

  getWallFloorCollider() {
    if (this.dead) {
      return new NullCollider()
    } else {
      return new SphereCollider(this.pos.copy(), this.size / 3)
    }
  }

  getPlayerSlowCollider() {
    if (this.dead) {
      return new SphereCollider(this.pos.copy(), this.size)
    } else {
      return new NullCollider()
    }
  }

  isDead() {
    return this.dead
  }
}
