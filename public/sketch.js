/*
@file sketch.js
@author entire team
@date 2/18/2022
@brief File that controls the graphics on the canvas
*/

/*var explosionSound = new Howl({
	src:"library/sound.mp3",
	loop: false,
	volume: 0.2
});*/
let cnv;
let cam;

function windowResized() {
  cnv = resizeCanvas(windowWidth - 40, windowHeight - 80);
}

let pointerLock = false;

document.addEventListener(
  "pointerlockchange",
  function onPointerLockChange() {
    if (
      document.pointerLockElement ===
      document.getElementById("sketch-container")
    ) {
      pointerLock = true;
    } else {
      pointerLock = false;
    }
  },
  false
);

//mouse click
function mousePressed() {
  console.log("mouse");
  if (!pointerLock) {
    document.getElementById("sketch-container").requestPointerLock();
  }
}

function mouseMoved(event) {
  //positive movementX is right
  //positive movementY is down
  cam.pan(-(event.movementX / 100)); //positive value is left
  cam.tilt(event.movementY / 100);
}

function setup() {
  cnv = createCanvas(20, 20, WEBGL);
  cnv.parent("sketch-container");
  windowResized();
  cam = createCamera();
  normalMaterial();
  perspective();

  player = new Player(0, 0, 0, 0, 0);
}

function doInput() {}

function draw() {
  //windowResized()

  player.update();
  cam.move(player.velx, player.vely, player.velz);
  background(205, 102, 94);
  push();
  translate(0, 0, 0);
  box(40);
  pop();

  doInput();
}
