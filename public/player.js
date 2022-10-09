/*
@file player.js
@author entire team
@date 10/7/2022
@brief Defines player behavior
*/

const PLAYER_SIZE = 50;
const PROJECTILE_SPEED = 4;
const PLAYER_MAX_HEALTH = 100;
const TOMATO_SHOOT_TIMER = 2;
const SPOON_SHOOT_TIMER = 3
const PROJECTILE_DAMAGE = 20;
const MAX_AMMO = 20;
const PLAYER_GRAVITY = 0.4
const BATTERY_TIMER = 80
const RESPAWN_TIMER = 100
const PLAYER_SPEED = 3
const JUMP_STRENGTH = 6

const TOMATO = 1
const PLATE = 2
const SPOON = 3

const oneKey = 49;
const twoKey = 50;
const threeKey = 51;

class Player {
  constructor(id, x, y, z, team, name) {
    this.id = id;
    this.name = name;
    this.kills = 0;
    this.pos = createVector(x, y, z);
    this.vel = createVector(0, 0, 0);
    this.looking = createVector(0, 0, 1); //x, z
    this.health = PLAYER_MAX_HEALTH;
    this.ammo = 10
    this.weapon = TOMATO;

    this.accY = PLAYER_GRAVITY;

    this.shootTimer = 0;

    this.last_vx = 0;
    this.last_vy = 0;
    this.last_vz = 0;
    
    this.hasBattery = false
    this.batteryTimer = BATTERY_TIMER
    this.dead = false
    this.deathTimer = 0

    this.kills = 0
    this.deaths = 0

    this.speed = PLAYER_SPEED
    this.team = team
  }

  render() {
    push();
      translate(this.pos);
      rotateY(-1 * this.get2dLooking().heading());
      rotateZ(PI);
      tint(255 * (this.health/PLAYER_MAX_HEALTH));
      texture(PLAYER_PNG);
      noStroke();
      //box(PLAYER_SIZE);
      scale(0.38);
      model(PLAYER_OBJ);
    pop();

    if (this.weapon === PLATE) {
      push();
        translate(createVector(this.pos.x, this.pos.y - 30, this.pos.z).add(this.looking.copy().mult(20)));
        rotateY(-1 * this.get2dLooking().heading() + 3*PI / 2 - 0.1);
        rotateX(3.5);
        rotateZ(0)
        scale(0.25);
        fill(255);
        stroke(250);
        strokeWeight(0.5);
        model(PLATE_OBJ);
      pop();
    }

    if (this.id !== socket.id) {
      let cameraAngle = findPlayer(socket.id).get2dLooking().heading()
      push()
        if (gameMode === MODE_FFA) {
          fill(255);
        }
        else if(this.team == 0){
          fill(255, 0, 0);
        } else {
          fill(0, 0, 255);
        }
        translate(this.pos.copy().sub(0, 40, 0))
        textSize(24)
        rotateY(-cameraAngle - PI / 2)
        textFont(MC_FONT)
        textAlign(CENTER)
        text(this.name, 0, 0, 0)
      pop()
    }
  }

  getWallCollider() {
    return new SphereCollider(this.pos.copy(), PLAYER_SIZE * 0.8)
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
    cam.setPosition(this.pos.x, this.pos.y - 25, this.pos.z);
    cam.lookAt(
      this.pos.x + this.looking.x,
      this.pos.y - 25 + this.looking.y,
      this.pos.z + this.looking.z
    );
  }

  //basic movement
  doInput() {
    if (!this.canShoot() && this.shootTimer >= 0) {
      this.shootTimer -= 0.1;
    }
    
    if (this.isDead()) {
      return
    }
    
    let vx = 0;
    let vy = this.vel.y;
    let vz = 0;

    if (keyIsDown(87)) {
      vz = this.speed * 1.3;
    } else if (keyIsDown(83)) {
      vz = -this.speed;
    } else {
      vz = 0;
    }
    if (keyIsDown(68)) {
      vx = this.speed;
    } else if (keyIsDown(65)) {
      vx = -this.speed;
    } else {
      vx = 0;
    }
    if (keyIsDown(oneKey)){
      socket.emit('changeWeapon', {weapon: TOMATO})
      console.log("TOMATO sent from " + socket.id)
    }else if (keyIsDown(twoKey)){
      socket.emit('changeWeapon', {weapon: PLATE})
      console.log("PLATE sent from " + socket.id)
    } else if (keyIsDown(threeKey)){
      socket.emit('changeWeapon', {weapon: SPOON})
      console.log("SPOON sent from " + socket.id)
    }

    if (keyIsDown(32) && this.pos.y == GROUND + PLAYER_SIZE / 4) {
      vy = -JUMP_STRENGTH
    }

    if(keyIsDown(9)){
      tab_bool = true;
    }
    else{
      tab_bool = false;
    }

    if (this.last_vx !== vx || this.last_vy !== vy || this.last_vz !== vz) {
      socket.emit("changeVelocity", {
        vx: vx,
        vy: vy,
        vz: vz
      })
    }

    if (keyIsDown("E".charCodeAt()) && this.batteryTimer <= 0) {
      socket.emit("pickupBattery", {})
      this.batteryTimer = BATTERY_TIMER
    }
    this.batteryTimer--

    this.last_vx = vx
    this.last_vy = vy
    this.last_vz = vz
  }

  get2dLooking() {
    let newLookingVector = createVector(this.looking.x, this.looking.z);
    newLookingVector.normalize();
    return newLookingVector;
  }

  setTomatoInterference(n) {
    this.speed = PLAYER_SPEED * pow(0.8, n)
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

    this.vel.y += this.accY;
    this.pos.y += this.vel.y;
    if (this.pos.y >= GROUND + PLAYER_SIZE / 4) {
      this.vel.y = 0
      this.pos.y = GROUND + PLAYER_SIZE / 4
    }

    this.deathTimer--
    if (this.deathTimer === 0) {
      this.respawn()
    }
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
    if (this.weapon === SPOON) {
      return new SpoonProjectile(this.id, this.team)
    }
    return new Projectile(
      this.pos.copy().add(0, -25, 0).add(this.looking.copy().mult(20)),
      this.looking.copy().mult(PROJECTILE_SPEED * PROJECTILE_SPEED_MULTIPLIER),
      this.id,
      this.team
    )
  }

  getCollider() {
    if (this.isDead()) {
      return new NullCollider()
    } else {
      //return new SphereCollider(this.pos.copy(), PLAYER_SIZE * 0.8)
      return new CompositieCollider(
        [new SphereCollider(this.pos.copy(), PLAYER_SIZE * 0.3),
        new SphereCollider(this.pos.copy().add(0, 30, 0), PLAYER_SIZE * 0.3),
        new SphereCollider(this.pos.copy().add(0, -20, 0), PLAYER_SIZE * 0.3)]
      )
    }
  }

  damage(amount, source) {
    this.health -= amount;
    if (this.health <= 0) {
      this.die(source)
    }
  }

  canShoot() {
    return (this.weapon !== TOMATO || this.ammo > 0) && this.shootTimer <= 0 && this.weapon !== PLATE;
  }

  die(killer) {
    this.deathTimer = RESPAWN_TIMER
    if (this.hasBattery) {
      droppedBatteries.push(
        new DroppedBattery(this.pos.copy())
      )
      this.hasBattery = false
    }
    this.deaths++
    if (killer !== undefined) {
      killer.kills++
      console.log(killer.id + " kills: " + killer.kills)
    }
    console.log(this.id + " deaths: " + this.deaths)
  }

  isDead() {
    return this.deathTimer > 0
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

  canPickupBattery() {
    return !this.hasBattery
  }

  canDropBattery() {
    return this.hasBattery
  }

  pickupBattery() {
    this.hasBattery = true && !this.isDead()
  }

  dropBattery() {
    this.hasBattery = false && !this.isDead()
  }

  respawn() {
    this.health = PLAYER_MAX_HEALTH
    this.ammo = MAX_AMMO
  }

  changeWeapon(weapon) {
    this.weapon = weapon;
  }

  getMaxShootTimer() {
    if (this.weapon === SPOON) {
      return SPOON_SHOOT_TIMER
    } else {
      return TOMATO_SHOOT_TIMER
    }
  }

  /*
  printName(i){
    
  }
  */
}