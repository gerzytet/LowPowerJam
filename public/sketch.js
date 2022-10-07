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

let last_vx;
let last_vy;
let last_vz;

/******GAMESTATE ZONE*****/
let players = []
let projectiles = []
/******GAMESTATE ZONE*****/

let playersLastLength = 1;

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
  } else {
    socket.emit('shoot', {})
  }
}

function mouseMoved(event) {
  //positive movementX is right
  //positive movementY is down
  if (pointerLock) {
    for (let i = 0; i < players.length; i++) {
      if (socket.id === players[i].id) {
        players[i].pan(event.movementX / 1000, event.movementY / 1000);
      }
    }
  }
}

function setup() {
  cnv = createCanvas(20, 20, WEBGL);
  cnv.parent("sketch-container");
  windowResized();

  socket = io.connect();

  cam = createCamera();
  normalMaterial();
  let eyeZ = ((height/2) / tan(PI/6));
  //perspective(PI/3, width/height, eyeZ/10 - 20, eyeZ*10);
  perspective()
  socket.emit("join");

  projectiles.push(new Projectile(createVector(30, 30, 30), createVector(0, 0, 0)))

  socket.on("tick", function (data) {
    for (let i = 0; i < data.events.length; i++) {
      if (data.events[i].type === "PlayerJoin") {
        players.push(new Player(data.events[i].id, 0, -50, -100));
        console.log(players);
      }
      if (
        data.events[i].type === "CatchingUpNewPlayer" &&
        players.length == 1
      ) {
        for (let j = 0; j < data.events[i].players.length; j++) {
          let tempP = new Player(
            data.events[i].players[j].id,
            data.events[i].players[j].pos.x,
            data.events[i].players[j].pos.y,
            data.events[i].players[j].pos.z
          );
          tempP.vel = createVector(
            data.events[i].players[j].vel.x,
            data.events[i].players[j].vel.y,
            data.events[i].players[j].vel.z
          );
          tempP.looking = createVector(
            data.events[i].players[j].looking.x,
            data.events[i].players[j].looking.y,
            data.events[i].players[j].looking.z
          );
          players.push(tempP);
        }
        for (let j = 0; j < data.events[i].projectiles.length; j++) {
          let dataProjectile = data.events[i].projectiles[j]
          let pos = createVector(dataProjectile.pos.x, dataProjectile.pos.y, dataProjectile.pos.z)
          let vel = createVector(dataProjectile.vel.x, dataProjectile.vel.y, dataProjectile.vel.z)
          projectiles.push(new Projectile(pos, vel))
        }

        console.log(players);
      }
      if (data.events[i].type === "PlayerChangeVelocity") {
        for (let j = 0; j < players.length; j++) {
          if (data.events[i].id === players[j].id) {
            players[j].vel.x = data.events[i].vx;
            players[j].vel.y = data.events[i].vy;
            players[j].vel.z = data.events[i].vz;
          }
        }
      }
      if (data.events[i].type === "PlayerChangeAngle") {  //panning only
        for (let j = 0; j < players.length; j++) {
          if (data.events[i].id === players[j].id) {
            players[j].panCamera(data.events[i].panAngle, data.events[i].tiltAngle);
          }
        }
      }

      if (data.events[i].type === "Disconnect") {
        for (let j = 0; j < players.length; j++) {
          if(players[j].id === data.events[i].id){
            players.splice(j, 1);
          }
        }
      }

      if (data.events[i].type === 'shoot') {
        for (let j = 0; j < players.length; j++) {
          if(players[j].id === data.events[i].id){
            projectiles.push(players[j].getShootProjectile())
          }
        }
      }
    }

    updateGamestate()
  });
}

function updateGamestate() {
  for (var i = 0; i < players.length; i++) {
    players[i].move()
  }
  for (var i = 0; i < projectiles.length; i++) {
    projectiles[i].move()
  }

  doCollision()
}

function doCollision() {
  for (var i = 0; i < projectiles.length; i++) {
    for (var j = 0; j < players.length; j++) {
      if (projectiles[i].owner != players[j].id && projectiles[i].getCollider().isColliding(players[j].getCollider())) {
        projectiles.splice(i, 1)
        players[j].damage(projectileDamage)
        i--
      }
    }
  }
}

function draw() {
  //windowResized()

  background(100);

  if (players.length > playersLastLength && socket.id === players[0].id) {
    socket.emit("catchUpNewPlayer", {
      players: players,
      projectiles: projectiles
    });
  }
  for (let i = 0; i < players.length; i++) {
    if (socket.id === players[i].id) {
      players[i].myView();
    }
    players[i].render();
  }

  for (var i = 0; i < projectiles.length; i++) {
    projectiles[i].render()
  }
  debugMode();

  push();
    translate(0, 0, 0)
    fill(0)
    stroke(255)
    box(40)
  pop();
}
