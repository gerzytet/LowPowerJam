/*
@file sketch.js
@author entire team
@date 10/7/2022
@brief Projectile properties
*/

const PROJECTILE_SIZE = 10;
const PROJECTILE_SPEED_MULTIPLIER = 3

class Projectile {
  constructor(pos, vel, owner, team) {
    this.pos = pos
    this.vel = vel
    this.owner = owner
    this.acc = 0.03 * PROJECTILE_SPEED_MULTIPLIER
    this.size = PROJECTILE_SIZE + random(-2, 2)

    this.xr = random(-3, 3)
    this.yr = random(-3, 3)
    this.zr = random(-3, 3)

    this.xrv = random(-0.1, 0.1)
    this.yrv = random(-0.1, 0.1)
    this.zrv = random(-0.1, 0.1)

    this.dead = false
    this.team = team
  }

  render() {
    push()
      translate(this.pos)
      rotateX(this.xr)
      rotateY(this.yr)
      rotateZ(this.zr)
      scale(this.size / 100)
      texture(TOMATO_PNG);
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

const SPOON_SIZE = 10
const SPOON_TIMEOUT = 10

class SpoonProjectile {
  constructor(owner, team) {
    this.owner = owner
    this.move()
    this.dead = false
    this.timer = 10
    this.team = team
  }

  getPlayer() {
    return findPlayer(this.owner)
  }

  render() {
    push()
      translate(this.pos.copy().sub(this.getPlayer().looking.copy().mult(20)))
      scale(SPOON_SIZE / 30)
      rotateZ(PI)
      rotateZ(0.3)
      rotateY(this.getPlayer().get2dLooking().heading() + PI / 2)
      fill(128)
      model(SPOON_OBJ)
    pop()
  }

  move() {
    this.pos = this.getPlayer().pos.copy().add(this.getPlayer().looking.copy().mult(60))
    this.timer--
  }

  getCollider() {
    if (this.isDead()) {
      return new NullCollider()
    } else {
      return new SphereCollider(this.pos.copy().add(this.getPlayer().looking.copy().mult(10)), SPOON_SIZE)
    }
  }

  getWallFloorCollider() {
    return this.getCollider()
  }

  isDead() {
    return this.dead || this.timer <= 0
  }
}