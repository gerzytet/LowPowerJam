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

let last_vx
let last_vy
let last_vz

const NUM_LOBBIES = 6

const LOBBY_SELECT = 0
const LOBBY = 1
const GAME = 2
const MAIN_MENU = 3
let menuState = MAIN_MENU
let myLobbyIndex = -1
const renderColliders = false

/******GAMESTATE ZONE*****/
let players = []
let projectiles = []
let kitchens = []
/******GAMESTATE ZONE*****/


let lobbies
let pointerLock
let playersLastLength = 1;

function windowResized() {
  cnv = resizeCanvas(windowWidth - 40, windowHeight - 80);
}


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

function findPlayer(id) {
  for (let i = 0; i < players.length; i++) {
    if (socket.id === players[i].id) {
      return players[i]
    }
  }
}

//mouse click
function mousePressed() {
  if (menuState === GAME) {
    if (!pointerLock) {
      document.getElementById("sketch-container").requestPointerLock();
    } else {
      let player = findPlayer(socket.id)
      if (player.canShoot()) {
        socket.emit('shoot', {})
        player.ammo--
      }
    }
  }
}

function mouseMoved(event) {
  //positive movementX is right
  //positive movementY is down
  if (pointerLock) {
    findPlayer(socket.id).pan(event.movementX / 1000, event.movementY / 1000);
  }
}

function setup() {
  socket = io.connect();
  lobbies = []
  pointerLock = false

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

  socket.on('lobbyStatus', function (data) {
    lobbies = []
    for (var i = 0; i < data.lobbies.length; i++) {
      lobbies.push(new Lobby(data.lobbies[i].players, data.lobbies[i].status))
    }
  })

  socket.on('startGame', function (data) {
    menuState = GAME
    setupGame()
  })

  setupMainMenu()
}

function updateGamestate() {
  for (var i = 0; i < players.length; i++) {
    players[i].move()
  }
  for (var i = 0; i < projectiles.length; i++) {
    if (projectiles[i].isDespawned()) {
      projectiles.splice(i, 1)
      i--
    } else {
      projectiles[i].move()
    }
  }

  doCollision()
}

function doCollision() {
  for (var i = 0; i < projectiles.length; i++) {
    for (var j = 0; j < players.length; j++) {
      if (projectiles[i].owner != players[j].id && projectiles[i].getCollider().isColliding(players[j].getCollider())) {
        projectiles.splice(i, 1)
        players[j].damage(PROJECTILE_DAMAGE)
        i--
      }
    }
  }

  for (var i = 0; i < kitchens.length; i++) {
    for (var j = 0; j < players.length; j++) {
      if (kitchens[i].getCollider().isColliding(players[j].getCollider())) {
        kitchens[i].regeneratePlayer(players[j])
      }
    }
  }
}

function draw() {
  if (menuState == LOBBY_SELECT) {
    drawLobbySelect()
  } else if (menuState == LOBBY) {
    drawLobby()
  } else if (menuState == GAME) {
    drawGame()
  } else if (menuState == MAIN_MENU) {
    drawMainMenu()
  } else {
    throw new Error("Invalid menu state")
  }
}

function setupGame() {
  cnv = createCanvas(20, 20, WEBGL);
  cnv.parent("sketch-container");
  windowResized();

  cam = createCamera();
  normalMaterial();
  let eyeZ = ((height/2) / tan(PI/6));
  //perspective(PI/3, width/height, eyeZ/10 - 20, eyeZ*10);
  perspective()

  kitchens.push(new HealthKitchen(createVector(100, 0, 100)), new TomatoKitchen(createVector(-100, 0, -100)))
}

function drawGame() {
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
    if (renderColliders) {
      players[i].getCollider().render()
    }

    new WallCollider(createVector(0, 0), createVector(100, 100)).render()
    if (players[i].getCollider().isColliding(new WallCollider(createVector(0, 0), createVector(100, 100)))) {
      console.log("Colliding")
    }
    players[i].render();
  }

  for (var i = 0; i < projectiles.length; i++) {
    if (renderColliders) {
      projectiles[i].getCollider().render()
    }
    projectiles[i].render()
  }

  for (var i = 0; i < kitchens.length; i++) {
    if (renderColliders) {
      kitchens[i].getCollider().render()
    }
    kitchens[i].render()
  }


  debugMode();

  push();
    translate(0, 0, 0)
    fill(0)
    stroke(255)
    box(40)
  pop();
}

function doLobbyInput() {
  if (keyIsDown("H".charCodeAt())) {
    console.log("H pressed");
    socket.emit("startGame", {
      lobby: myLobbyIndex
    })
  }
}

function drawLobby() {
  background(100);
  push()
    fill(0)
    textSize(32)
    let x = 10
    let y = 30
    text("Your lobby: " + (myLobbyIndex + 1), x, y); y += 32
    text("Players: ", x, y); y += 32
    for (let i = 0; i < lobbies[myLobbyIndex].players.length; i++) {
      text(lobbies[myLobbyIndex].players[i], x, y); y += 32
    }
    y += 32
    if (socket.id === lobbies[myLobbyIndex].players[0]) {
      text("You are the host", x, y); y += 32
      text("Press H to start the game", x, y); y += 32
    }
  pop()

  doLobbyInput()
}

function setupLobbySelect() {
  cnv = createCanvas(20, 20);
  cnv.parent("sketch-container");
  windowResized();
}

function joinLobby(n) {
  socket.emit("joinLobby", {
    lobby: n
  })
  menuState = LOBBY
  myLobbyIndex = n
}

function doLobbySelectInput() {
  for (let lobby = 0; lobby < NUM_LOBBIES; lobby++) {
    let code = "1".charCodeAt(0) + lobby
    if (keyIsDown(code) && lobbies[lobby].status == LOBBY_OPEN) {
      joinLobby(lobby)
      return
    }
  }
}

function drawLobbySelect() {
  background(100);
  push()
    fill(0)
    textSize(32)
    let x = 10
    let y = 30
    for (var i = 0; i < lobbies.length; i++) {
      text("Lobby " + (i + 1) + ": " + lobbies[i].players.length + " players. " + (lobbies[i].status == LOBBY_STARTED ? "started" : "not started"), x, y)
      y += 32
    }
    text("Press 1 to join lobby 1, 2 to join lobby 2, etc.", x, y)
    y += 32
  pop()

  doLobbySelectInput()
}

function setupMainMenu() {
  cnv = createCanvas(20, 20);
  cnv.parent("sketch-container");
  windowResized();
}

function doMainMenuInput() {
  if (keyIsDown("S".charCodeAt())) {
    menuState = LOBBY_SELECT
    setupLobbySelect()
  }
}

function drawMainMenu() {
  push()
    background(100);
    textSize(32)
    text("Main menu", 10, 30)
    text("Press s to start", 10, 70)
  pop()

  doMainMenuInput()
}