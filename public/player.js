class Player {
  constructor(x, y, z, w, h) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.w = w;
    this.h = h;

    this.velx = 0;

    this.vely = 0;

    this.velz = 0;
    this.depth = 2;
    this.speed = 1;
  }

  update() {
    if (keyIsDown(87)) {
      this.velz = -1;
    } else if (keyIsDown(83)) {
      this.velz = 1;
    } else {
      this.velz = 0;
    }
    if (keyIsDown(68)) {
      this.velx = 1;
    } else if (keyIsDown(65)) {
      this.velx = -1;
    } else {
      this.velx = 0;
    }

    this.x += this.velx * this.speed;

    this.y += this.vely * this.speed;

    this.z += this.velz * this.speed;

    this.render();
  }

  render() {
    noStroke();
    fill(50);
    push();
    translate(this.x, this.y, this.z - 3);
    box(this.w * 10, this.h * 10, this.depth * 10);
    pop();
  }
}
