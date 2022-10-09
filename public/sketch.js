/*
@file sketch.js
@author entire team
@date 10/7/2022
@brief File that renders graphics
*/

/*
TODO:
*List of players
*Health/Death
*Optimize performance
*Win/lose condition
*Disconnect (lobby is cleared out when there are zero clients)
*/

//!Need splat sounds, music, interact sounds, menu sounds.
var sounds = ['sounds/laserBeam.mp3'];

/*
var testSound = new Howl({
	src: [sounds[0]],
	loop: false,
	volume: 0.5
});
*/

//4 levels, multiplied 1-4 depending on distance
let soundMultiplier = 100;

let cnv;
let cam;

let last_vx;
let last_vy;
let last_vz;

let mouseMovementX = 0
let mouseMovementY = 0

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
let droppedBatteries = []
/******GAMESTATE ZONE*****/

/**MAP ZONE*/
let kitchens = []
let walls = []
let spawnPoint
/**MAP ZONE*/

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

document.addEventListener(
  "keydown", function(event){event.preventDefault()}
)

function findPlayer(id) {
  for (let i = 0; i < players.length; i++) {
    if (id === players[i].id) {
      return players[i];
    }
  }
}

//mouse click
function mousePressed() {
  if (menuState === GAME) {
    if (!pointerLock) {
      document.getElementById("sketch-container").requestPointerLock();
    } else {
      let player = findPlayer(socket.id);
      if (player.canShoot()) {
        socket.emit("shoot", {});
        if (player.weapon === TOMATO)  player.ammo--;
        player.shootTimer = player.getMaxShootTimer()
        //var volMult = soundMultiplier * dist(player.x, player.y, player.z, )
      }
    }
  }
}

function mouseMoved(event) {
  //positive movementX is right
  //positive movementY is down
  if (findPlayer(socket.id) !== undefined && findPlayer(socket.id).isDead()) {
    return
  }
  if (pointerLock) {
    mouseMovementX += event.movementX
    mouseMovementY += event.movementY
    if ((abs(mouseMovementX) + abs(mouseMovementY)) > 15) {
      findPlayer(socket.id).pan(mouseMovementX / 1000, mouseMovementY / 1000);
      mouseMovementX = 0
      mouseMovementY = 0
    }
  }
}

let TOMATO_OBJ
let TOMATO_PNG
let SPOON_OBJ
let CHARECTER_OBJ
function preload(){
  TOMATO_OBJ = loadModel('models/Tomato.obj', true);
  TOMATO_PNG = loadImage('images/tomato_mat.png', true);
  SPOON_OBJ = loadModel('models/spoon.obj', true);
  CHARECTER_OBJ = loadModel('models/Player.obj', true);
}

function setup() {
  socket = io.connect()
  lobbies = []
  pointerLock = false
  initMaps()

  socket.on("tick", function (data) {
    for (let i = 0; i < data.events.length; i++) {
      if (data.events[i].type === "PlayerJoin") {
        players.push(new Player(data.events[i].id, spawnPoint.x, spawnPoint.y, spawnPoint.z));
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
          let dataProjectile = data.events[i].projectiles[j];
          let pos = createVector(
            dataProjectile.pos.x,
            dataProjectile.pos.y,
            dataProjectile.pos.z
          );
          let vel = createVector(
            dataProjectile.vel.x,
            dataProjectile.vel.y,
            dataProjectile.vel.z
          );
          projectiles.push(new Projectile(pos, vel));
        }
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
      if (data.events[i].type === "PlayerChangeAngle") {
        //panning only
        for (let j = 0; j < players.length; j++) {
          if (data.events[i].id === players[j].id) {
            players[j].panCamera(
              data.events[i].panAngle,
              data.events[i].tiltAngle
            );
          }
        }
      }

      if (data.events[i].type === "Disconnect") {
        for (let j = 0; j < players.length; j++) {
          if (players[j].id === data.events[i].id) {
            players.splice(j, 1);
          }
        }
      }

      if (data.events[i].type === "shoot") {
        let me = findPlayer(socket.id)
        let volume
        
        for (let j = 0; j < players.length; j++) {
          if (players[j].id === data.events[i].id) {
            projectiles.push(players[j].getShootProjectile());
            volume = calculateVolume(players[j].pos.dist(me.pos))
          }
        }

        var testSound = new Howl({
          src: [sounds[0]],
          loop: false,
          volume: volume
        })
        testSound.play();
      }

      if (data.events[i].type === "PlayerPickupBattery") {
        let player = findPlayer(data.events[i].id)
        if (player.canPickupBattery() || player.canDropBattery()) {
          for (let j = 0; j < kitchens.length; j++) {
            let kitchen = kitchens[j]
            if (kitchen.hasBatterySlot() && kitchen.batterySlot.getCollider().isColliding(player.getCollider())) {
              if (player.canDropBattery() && !kitchen.batterySlot.hasBattery) {
                kitchen.batterySlot.hasBattery = true
                player.dropBattery()
                break
              }
              if (player.canPickupBattery() && kitchen.batterySlot.hasBattery) {
                kitchen.batterySlot.hasBattery = false
                player.pickupBattery()
                break
              }
            }
          }
        }
      }

      if (data.events[i].type === "PlayerChangeWeapon") {
        console.log("got change " + data.events[i].weapon + " " + data.events[i].id)
        let player = findPlayer(data.events[i].id)
        console.log(player.id);
        player.changeWeapon(data.events[i].weapon)
      }
    }
    updateGamestate();
  });

  socket.on("lobbyStatus", function (data) {
    lobbies = [];
    for (var i = 0; i < data.lobbies.length; i++) {
      lobbies.push(new Lobby(data.lobbies[i].players, data.lobbies[i].status));
    }
  });

  socket.on('startGame', function (data) {
    menuState = GAME
    loadMap(data.map)
    setupGame()
  })

  setupMainMenu();
}

//0-1 scale, sound is louder when distance is shorter
function calculateVolume (d){
  return min(1, soundMultiplier / d);
}

function loadMap(index) {
  console.log("Loading map " + index)
  let map = maps[index]
  for (let i = 0; i < map.objects.length; i++) {
    let object = map.objects[i]
    if (object instanceof Wall) {
      walls.push(object)
    }
    else if (object instanceof Kitchen) {
      kitchens.push(object)
    } else {
      console.log("HI")
    }
  }
  spawnPoint = map.playerSpawn
}

function loadMap(index) {
  console.log("Loading map " + index)
  let map = maps[index]
  for (let i = 0; i < map.objects.length; i++) {
    let object = map.objects[i]
    if (object instanceof Wall) {
      walls.push(object)
    }
    else if (object instanceof Kitchen) {
      kitchens.push(object)
    } else {
      console.log("HI")
    }
  }
  spawnPoint = map.playerSpawn
}

function updateGamestate() {
  for (var i = 0; i < projectiles.length; i++) {
    projectiles[i].move()
  }

  doCollisionMovePlayers()
}

function doCollisionMovePlayers() {
  //projectile collision
  for (var i = 0; i < projectiles.length; i++) {
    for (var j = 0; j < players.length; j++) {
      if (
        projectiles[i].owner !== players[j].id &&
        projectiles[i].getCollider().isColliding(players[j].getCollider())
      ) {
        let isReflected = false
        if (players[j].weapon === PLATE) {
          console.log(players[j].id + " relected");
          let incomingAngle = players[j].get2dLooking().angleBetween(
            createVector(-projectiles[i].vel.x, -projectiles[i].vel.z)
          )
          if (abs(incomingAngle) < PI / 2) {
            let reflected = players[j].getShootProjectile()
            projectiles[i].vel = reflected.vel
            projectiles[i].pos = reflected.pos
            projectiles[i].owner = reflected.owner
            isReflected = true
          }
        }
        if (!isReflected) {
          players[j].damage(PROJECTILE_DAMAGE, findPlayer(projectiles[i].owner))
          projectiles.splice(i, 1);
          i--;
          break
        }
      }
    }
  }

  //player-dead tomato
  for (let i = 0; i < players.length; i++) {
    let count = 0
    for (let j = 0; j < projectiles.length; j++) {
      if (projectiles[j] instanceof Projectile && projectiles[j].isDead()) {
        if (projectiles[j].getPlayerSlowCollider().isColliding(players[i].getCollider())) {
          count++
        }
      }
    }

    players[i].setTomatoInterference(count)
  }

  //Wall-projectile
  for (var i = 0; i < projectiles.length; i++) {
    for (var j = 0; j < walls.length; j++) {
      if (projectiles[i].getWallFloorCollider().isColliding(walls[j].getCollider())) {


        if (projectiles[j] instanceof Projectile) {
          projectiles[i].dead = true
        } else {
          projectiles.splice(i, 1);
          i--;
          break
        }
        
      }
    }
  }

  //kitchen collision
  for (var i = 0; i < kitchens.length; i++) {
    for (var j = 0; j < players.length; j++) {
      if (kitchens[i].isOn() && kitchens[i].getCollider().isColliding(players[j].getCollider())) {
        kitchens[i].regeneratePlayer(players[j]);
      }
    }
  }

  //player-wall
  for (var i = 0; i < players.length; i++) {
    let player = players[i]
    let oldPos = player.pos.copy()
    player.move()

    for (let j = 0; j < walls.length; j++) {
      if (player.getCollider().isColliding(walls[j].getCollider())) {
        let movementVector = player.pos.copy().sub(oldPos)
        player.pos = oldPos.copy()
        movementVector = walls[j].getCollider().moveAgainst(movementVector)
        player.pos.add(movementVector)
      }

      if (player.getCollider().isColliding(walls[j].getCollider())) {
        //we are stuck in a wall, get unstuck
        function tryvec(v) {
          player.pos.add(v)
          if (player.getCollider().isColliding(walls[j].getCollider())) {
            return false
            player.pos.sub(v)
          }
          return true
        }

        let mag = 0
        while (true) {
          mag++
          if (tryvec(createVector(mag, 0, 0))) break
          if (tryvec(createVector(-mag, 0, 0))) break
          if (tryvec(createVector(0, 0, mag))) break
          if (tryvec(createVector(0, 0, -mag))) break
        }
      }
    }
  }

  //player-dropped battery
  for (let i = 0; i < players.length; i++) {
    for (let j = 0; j < droppedBatteries.length; j++) {
      if (
        players[i].canPickupBattery() &&
        players[i].getCollider().isColliding(droppedBatteries[j].getCollider())
      ) {
        players[i].pickupBattery()
        droppedBatteries.splice(j, 1)
        j--
      }
    }
  }
}

function draw() {
  if (menuState == LOBBY_SELECT) {
    drawLobbySelect();
  } else if (menuState == LOBBY) {
    drawLobby();
  } else if (menuState == GAME) {
    document.getElementById("canvasUI").style.visibility = "visible";
    drawGame();
  } else if (menuState == MAIN_MENU) {
    drawMainMenu();
  } else {
    throw new Error("Invalid menu state");
  }
}

function setupGame() {
  cnv = createCanvas(20, 20, WEBGL);
  cnv.parent("sketch-container");
  windowResized();

  cam = createCamera();
  normalMaterial();
  let eyeZ = height / 2 / tan(PI / 6);
  //perspective(PI/3, width/height, eyeZ/10 - 20, eyeZ*10);
  perspective()
}

function drawGame() {
  //windowResized()

  background(51,221,255)

  if (players.length > playersLastLength && socket.id === players[0].id) {
    socket.emit("catchUpNewPlayer", {
      players: players,
      projectiles: projectiles,
    });
  }
  for (let i = 0; i < players.length; i++) {
    if (socket.id === players[i].id) {
      players[i].doInput()
      players[i].myView()
    }
    if (renderColliders) {
      players[i].getCollider().render()
    }

    //new Wall(createVector(0, 0), createVector(100, 100)).render()
    //if (players[i].getCollider().isColliding(new Wall(createVector(0, 0), createVector(100, 100)).getCollider())) {
    //  console.log("Colliding")
    //}
    if (!players[i].isDead()) {
      players[i].render()
    }
  }

  for (var i = 0; i < projectiles.length; i++) {
    if (renderColliders) {
      projectiles[i].getCollider().render();
    }
    projectiles[i].render();
  }

  for (var i = 0; i < kitchens.length; i++) {
    if (renderColliders) {
      kitchens[i].getCollider().render();
    }
    kitchens[i].render();
  }

  for (let i = 0; i < walls.length; i++) {
    walls[i].render()
  }

  for (let i = 0; i < droppedBatteries.length; i++) {
    droppedBatteries[i].render()
  }


  push();
    translate(0, 0, 0);
    fill(0);
    stroke(255);
    box(40);
  pop();

  push()
    fill(155, 50, 0, 100)
    rotateX(PI/2)
    translate(0, GROUND, 0)
    plane(2000, 2000)
  pop()
  updateUI(socket.id);
}

function doLobbyInput() {
  if (keyIsDown("H".charCodeAt()) && socket.id === lobbies[myLobbyIndex].players[0]) {
    socket.emit("startGame", {
      lobby: myLobbyIndex,
      map: 0
    })
  } else if (keyIsDown("Q".charCodeAt())) {
    socket.emit('quitLobby', {})
    setupLobbySelect()
    menuState = LOBBY_SELECT
  }
}

function drawLobby() {
  background(100);
  push();
  fill(0);
  textSize(32);
  let x = 10;
  let y = 30;
  text("Your lobby: " + (myLobbyIndex + 1), x, y);
  y += 32;
  text("Players: ", x, y);
  y += 32;
  for (let i = 0; i < lobbies[myLobbyIndex].players.length; i++) {
    text(lobbies[myLobbyIndex].players[i], x, y);
    y += 32;
  }
  y += 32;
  if (socket.id === lobbies[myLobbyIndex].players[0]) {
    text("You are the host", x, y);
    y += 32;
    text("Press H to start the game", x, y);
    y += 32;
  }
  text("Press Q to quit lobby", x, y);
  y += 32;
  pop();

  doLobbyInput();
}

function setupLobbySelect() {
  cnv = createCanvas(20, 20);
  cnv.parent("sketch-container");
  windowResized();
}

function joinLobby(n) {
  socket.emit("joinLobby", {
    lobby: n,
  });
  menuState = LOBBY;
  myLobbyIndex = n;
}

function doLobbySelectInput() {
  for (let lobby = 0; lobby < NUM_LOBBIES; lobby++) {
    let code = "1".charCodeAt(0) + lobby;
    if (keyIsDown(code) && lobbies[lobby].status == LOBBY_OPEN) {
      joinLobby(lobby);
      return;
    }
  }
}

function drawLobbySelect() {
  background(100);
  push();
  fill(0);
  textSize(32);
  let x = 10;
  let y = 30;
  for (var i = 0; i < lobbies.length; i++) {
    text(
      "Lobby " +
        (i + 1) +
        ": " +
        lobbies[i].players.length +
        " players. " +
        (lobbies[i].status == LOBBY_STARTED ? "started" : "not started"),
      x,
      y
    );
    y += 32;
  }
  text("Press 1 to join lobby 1, 2 to join lobby 2, etc.", x, y);
  y += 32;
  pop();

  doLobbySelectInput();
}

function setupMainMenu() {
  cnv = createCanvas(20, 20);
  cnv.parent("sketch-container");
  windowResized();
}

function doMainMenuInput() {
  if (keyIsDown("S".charCodeAt())) {
    menuState = LOBBY_SELECT;
    setupLobbySelect();
  }
}

function drawMainMenu() {
  push();
  background(100);
  textSize(32);
  text("Main menu", 10, 30);
  text("Press s to start", 10, 70);
  pop();

  doMainMenuInput();
}