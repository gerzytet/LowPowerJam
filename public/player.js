/*
@file player.js
@author entire team
@date 10/7/2022
@brief Defines player behavior
*/

const PLAYER_SIZE = 50;
const PROJECTILE_SPEED = 4;
const PLAYER_MAX_HEALTH = 100;
const PROJECTILE_DAMAGE = 20;
const MAX_AMMO = 20;

class Player {
  constructor(id, x, y, z) {
    this.id = id;
    this.pos = createVector(x, y, z);
    this.vel = createVector(0, 0, 0);
    this.looking = createVector(0, 0, 1); //x, z
    this.groundedS = 50;
    this.health = PLAYER_MAX_HEALTH;
    this.ammo = 10;

    this.accY = 0.98;

    this.shootTimer = 0;

    this.shootTimerMax = 2;

    this.last_vx = 0;
    this.last_vy = 0;
    this.last_vz = 0;
    this.tomato_timer = document.getElementById("tomato_wait");
    this.tomato_timer.max = this.shootTimerMax;
  }

  render() {
    if (!this.canShoot() && this.shootTimer >= 0) {
      this.shootTimer -= 0.1;
    }
    this.tomato_timer.value = this.shootTimer;

    this.doInput();
    push();
    translate(this.pos);
    rotateY(-1 * this.get2dLooking().heading());
    fill(255 * (this.health / PLAYER_MAX_HEALTH), 0, 0);
    stroke(255);
    box(PLAYER_SIZE);
    pop();

    push();
    translate(
      this.pos.x + this.looking.x * 25,
      this.pos.y,
      this.pos.z + this.looking.z * 25
    );
    fill(0);
    sphere(10);
    pop();
  }

  tiltCamera(angle) {
    //cam.tilt(angle)

    let looking2d = this.get2dLooking();
    let y = this.looking.y;
    let x = sqrt(1 - y * y);
    let tempLooking = createVector(x, y);
    tempLooking.rotate(angle);
    looking2d.mult(tempLooking.x);
    this.looking = createVector(looking2d.x, tempLooking.y, looking2d.y);

    //newLooking.x = this.looking.x
    //newLooking.y = this.looking.y * cos(angle) - this.looking.z * sin(angle)
    //newLooking.z = this.looking.y * sin(angle) + this.looking.z * cos(angle)
    //this.looking = newLooking
    //console.log(this.looking)
  }

  myView() {
    cam.setPosition(this.pos.x, this.pos.y, this.pos.z);
    cam.lookAt(
      this.pos.x + this.looking.x,
      this.pos.y + this.looking.y,
      this.pos.z + this.looking.z
    );
  }

  //basic movement
  doInput() {
    let vx = 0;
    let vy = 0;
    let vz = 0;

    if (keyIsDown(87)) {
      vz = 3;
    } else if (keyIsDown(83)) {
      vz = -3;
    } else {
      vz = 0;
    }
    if (keyIsDown(68)) {
      vx = 3;
    } else if (keyIsDown(65)) {
      vx = -3;
    } else {
      vx = 0;
    }

    if (keyIsDown(32) && this.groundedS > 0) {
      vy = -3;
    } else {
      if (this.groundedS == 50) {
        vy = 0;
      } else {
        this.groundedS = 0;
        vy = 3;
      }
    }

    if (last_vx !== vx || last_vy !== vy || last_vz !== vz) {
      socket.emit("changeVelocity", {
        vx: vx,
        vy: vy,
        vz: vz,
      });
    }

    this.last_vx = vx;
    this.last_vy = vy;
    this.last_vz = vz;
  }

  get2dLooking() {
    let newLookingVector = createVector(this.looking.x, this.looking.z);
    newLookingVector.normalize();
    return newLookingVector;
  }

  move() {
    let newLookingVector = this.get2dLooking();
    let zAxis = newLookingVector;
    let xAxis = zAxis.copy();
    xAxis.rotate(PI / 2);
    xAxis.mult(this.vel.x);
    zAxis.mult(this.vel.z);
    this.pos.x += xAxis.x + zAxis.x;
    this.pos.z += xAxis.y + zAxis.y;

    if (this.pos.y >= -50) {
      this.groundedS = 50;
    } else {
      this.groundedS -= 1;
    }

    this.pos.y += this.vel.y;
    this.vel.y += this.accY;
  }

  pan(panAmount, tiltAmount) {
    socket.emit("changeAngle", {
      panAngle: panAmount,
      tiltAngle: tiltAmount,
    });
  }

  panCamera(panAmount, tiltAmount) {
    this.tiltCamera(tiltAmount);
    //cam.pan(angle)
    let angle = -panAmount;

    //rotate the looking vector on y axis
    let newLooking = createVector(0, 0, 0);
    newLooking.x = this.looking.x * cos(angle) + this.looking.z * sin(angle);
    newLooking.y = this.looking.y;
    newLooking.z = this.looking.x * -sin(angle) + this.looking.z * cos(angle);
    this.looking = newLooking;
  }

  getShootProjectile() {
    return new Projectile(
      this.pos.copy(),
      this.looking.copy().mult(PROJECTILE_SPEED),
      this.id
    );
  }

  getCollider() {
    return new SphereCollider(this.pos.copy(), PLAYER_SIZE * 0.8);
  }

  damage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = PLAYER_MAX_HEALTH;
    }
  }

  canShoot() {
    return this.ammo > 0 && this.shootTimer <= 0;
  }

  heal(amount) {
    this.health += amount;
    if (this.health > PLAYER_MAX_HEALTH) {
      this.health = PLAYER_MAX_HEALTH;
    }
  }

  addAmmo(amount) {
    this.ammo += amount;
    if (this.ammo > MAX_AMMO) {
      this.ammo = MAX_AMMO;
    }
  }
}
