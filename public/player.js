class Player {
  constructor(id, x, y, z) {
    this.id = id;
    this.pos = createVector(x, y, z);
    this.vel = createVector(0, 0, 0);
    this.looking = createVector(0, 1); //x, z
  }

  render() {
    this.doInput();
    this.move();
    push();
    translate(this.pos);
    rotateY(-1*this.looking.heading());
    fill(255, 0, 0);
    stroke(255);
    box(50);
    pop();

    push();
    translate(this.pos.x+(this.looking.x*25), this.pos.y, this.pos.z+(this.looking.y*25));
    fill(0);
    sphere(10);
    pop();
  }

  myView(){
    cam.setPosition(this.pos.x, this.pos.y, this.pos.z);
    cam.lookAt(this.pos.x + this.looking.x, this.pos.y, this.pos.z + this.looking.y);
  }

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
      vx = -3;
    } else if (keyIsDown(65)) {
      vx = 3;
    } else {
      vx = 0;
    }

    if(last_vx !== vx || last_vy !== vy || last_vz !== vz){
      socket.emit("changeVelocity", {
        vx: vx, vy: vy, vz: vz
      });
    }

    last_vx = vx;
    last_vy = vy;
    last_vz = vz;
  }

  move(){
    this.pos.add(this.vel);
  }

  pan(amount){
    socket.emit("changeAngle", {
      angle: amount
    });
  }
}
