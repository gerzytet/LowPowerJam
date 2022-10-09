/*
@file sketch.js
@author entire team
@date 10/7/2022
@brief File that renders graphics
*/


/*
TODO:
!Add all sounds and fix UI
*List of players
*Optimize performance
*Win/lose condition
*Disconnect (lobby is cleared out when there are zero clients)
*/

//Interact = Clicking UI, Smack = Spoon collision, Splat = Tomato collision, Swish = Spoon failed collision
var sounds = ['sounds/interact.mp3', 'sounds/low_throw.mp3', 'sounds/medium_throw.mp3', 'sounds/high_throw.mp3', 'sounds/smack.mp3', 'sounds/splat.mp3', 
'sounds/swish.mp3'];

/*
var testSound = new Howl({
	src: [sounds[0]],
	loop: false,
	volume: 0.5
});
*/

//4 levels, multiplied 1-4 depending on distance
let soundMultiplier = 100;

let cnv
let cam

let last_vx
let last_vy
let last_vz

let mouseMovementX = 0
let mouseMovementY = 0

const NUM_LOBBIES = 6
const LOBBY_SELECT = 0
const LOBBY = 1
const GAME = 2
const MAIN_MENU = 3
const YOU_WIN = 4
const YOU_LOSE = 5
let menuState = MAIN_MENU
let myLobbyIndex = -1
const renderColliders = true
const CTF_TIME_LIMIT = 90 * 30
const CTF_WIN_POINTS = 30 * 30
const FFA_KILLS_TO_WIN = 5

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

let gameMode
let teamPoints
let ctfTimer = CTF_TIME_LIMIT

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
let PLAYER_OBJ
let PLAYER_PNG
let PLATE_OBJ
let DROPPED_BATTERY_OBJ
function preload(){
  TOMATO_OBJ = loadModel('models/Tomato2.obj', true);
  TOMATO_PNG = loadImage('images/tomato_mat.png');
  SPOON_OBJ = loadModel('models/spoon.obj', true);
  PLATE_OBJ = loadModel('models/Plate.obj', true);
  DROPPED_BATTERY_OBJ = loadModel('models/DroppedBattery.obj', true);

  PLAYER_OBJ = loadModel('models/Player.obj', true);
  PLAYER_PNG = loadImage('images/player_mat.png');
}

function setup() {
  teamPoints = [0, 0]
  lastID = 0
  socket = io.connect()
  lobbies = []
  pointerLock = false
  initMaps()
  gameMode = MODE_FFA

  socket.on("tick", function (data) {
    for (let i = 0; i < data.events.length; i++) {
      if (data.events[i].type === "GameMode") {
        gameMode = data.events[i].gameMode
      }
      if (data.events[i].type === "PlayerJoin") {
        let team = data.events[i].team
        players.push(new Player(data.events[i].id, spawnPoints[team % 2].x, spawnPoints[team % 2].y, spawnPoints[team % 2].z, data.events[i].team, data.events[i].name));
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

        var lowThrow = new Howl({
          src: [sounds[1]],
          loop: false,
          volume: volume
        })
        var mediumThrow = new Howl({
          src: [sounds[2]],
          loop: false,
          volume: volume
        })
        var highThrow = new Howl({
          src: [sounds[3]],
          loop: false,
          volume: volume
        })
        
        //hive mind code
        //60% chance normal, 20% high, 20% low
        var r = Math.random()
        if (r < 0.20) {
          lowThrow.play();
        } else if (r < 0.40) {
          mediumThrow.play();
        } else {
          highThrow.play();
        }
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
        //console.log("got change " + data.events[i].weapon + " " + data.events[i].id)
        let player = findPlayer(data.events[i].id)
        //console.log(player.id);
        player.changeWeapon(data.events[i].weapon)
      }
    }
    updateGamestate();
    sendDiagnostic()
  })

  socket.on("lobbyStatus", function (data) {
    lobbies = [];
    for (var i = 0; i < data.lobbies.length; i++) {
      lobbies.push(new Lobby(data.lobbies[i].players, data.lobbies[i].status, data.lobbies[i].teams, data.lobbies[i].names, data.lobbies[i].gameMode));
    }
  })

  socket.on('startGame', function (data) {
    menuState = GAME
    loadMap(data.map)
    setupGame()
  })

  setupMainMenu();
  //setupLobbySelect()
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
  spawnPoints = map.playerSpawn
}

function updateGamestate() {
  for (var i = 0; i < projectiles.length; i++) {
    projectiles[i].move()
    if (projectiles[i] instanceof SpoonProjectile && projectiles[i].isDead()) {
      projectiles.splice(i, 1)
    }
  }

  doCollisionMovePlayers()

  //do team points
  if (gameMode === MODE_CTF) {
    for (var i = 0; i < kitchens.length; i++) {
      if (kitchens[i].isOn() && kitchens[i].hasBatterySlot()) {
        teamPoints[kitchens[i].team]++
      }
    }

    ctfTimer--
  }

  //console.log(teamPoints)

  let winner = getWinner()
  let player = findPlayer(socket.id)
  if (winner !== null) {
    let won = (
      gameMode === MODE_CTF && winner === player.team ||
      gameMode === MODE_FFA && winner.id === socket.id
    )
    if (won) {
      menuState = YOU_WIN
      setupGameOver()
    } else {
      menuState = YOU_LOSE
      setupGameOver()
    }
  }
}

function doCollisionMovePlayers() {
  //projectile collision
  for (var i = 0; i < projectiles.length; i++) {
    for (var j = 0; j < players.length; j++) {
      if (
        projectiles[i].team !== players[j].team &&
        projectiles[i].getCollider().isColliding(players[j].getCollider())
      ) {
        let isReflected = false
        if (players[j].weapon === PLATE) {
          //console.log(players[j].id + " relected");
          let incomingAngle = players[j].get2dLooking().angleBetween(
            createVector(-projectiles[i].vel.x, -projectiles[i].vel.z)
          )
          if (abs(incomingAngle) < PI / 4) {
            let reflected = players[j].getShootProjectile()
            projectiles[i].vel = reflected.vel
            projectiles[i].owner = reflected.owner
            projectiles[i].team = reflected.team
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
      if (player.getWallCollider().isColliding(walls[j].getCollider())) {
        let movementVector = player.pos.copy().sub(oldPos)
        player.pos = oldPos.copy()
        movementVector = walls[j].getCollider().moveAgainst(movementVector)
        player.pos.add(movementVector)
      }

      if (player.getWallCollider().isColliding(walls[j].getCollider())) {
        //we are stuck in a wall, get unstuck
        function tryvec(v) {
          player.pos.add(v)
          if (player.getWallCollider().isColliding(walls[j].getCollider())) {
            player.pos.sub(v)
            return false
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
  if (menuState === LOBBY_SELECT) {
    drawLobbySelect();
  } else if (menuState === LOBBY) {
    drawLobby();
  } else if (menuState === GAME) {
    document.getElementById("canvasUI").style.visibility = "visible";
    drawGame();
  } else if (menuState === MAIN_MENU) {
    drawMainMenu();
  } else if (menuState === YOU_WIN || menuState === YOU_LOSE) {
    drawGameOver();
  } else {
    throw new Error("Invalid menu state");
  }
}

function setupGame() {
  cnv = createCanvas(20, 20, WEBGL);
  cnv.parent("sketch-container");
  windowResized();

  document.addEventListener(
    "keydown", function(event){event.preventDefault()}
  )

  cam = createCamera();
  normalMaterial();
  let eyeZ = height / 2 / tan(PI / 6);
  //perspective(PI/3, width/height, eyeZ/10 - 20, eyeZ*10);
  //perspective()
}

let lastID
function sendDiagnostic() {
  socket.emit('checkConsistency', {
    gameStateID: lastID,
    gameState: {
      players: players,
      projectiles: projectiles,
    }
  })
  lastID++
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
    plane(3000, 3000)
  pop()
  updateUI(socket.id);
}

//I'm mPressed!
let mPressed
let tPressed
let pPressed
let hPressed
function doLobbyInput() {
  if (mPressed === undefined) {
    mPressed = false
  }
  if (tPressed === undefined) {
    tPressed = false
  }
  if (pPressed === undefined) {
    pPressed = false
  }
  if (hPressed === undefined) {
    hPressed = false
  }
  if (mapSelection === undefined) {
    mapSelection = 0
  }
  if (keyIsDown("H".charCodeAt()) && socket.id === lobbies[myLobbyIndex].players[0] && !hPressed) {
    socket.emit("startGame", {
      lobby: myLobbyIndex,
      map: mapSelection
    })
    hPressed = true
  } else {
    if (!keyIsDown("H".charCodeAt())) hPressed = false
  }

  if (keyIsDown("Q".charCodeAt())) {
    socket.emit('quitLobby', {})
    setupLobbySelect()
    menuState = LOBBY_SELECT
  }
  if (keyIsDown("M".charCodeAt()) && socket.id === lobbies[myLobbyIndex].players[0] && !mPressed) {
    console.log('changing mode')
    socket.emit('changeGameMode', {
      gameMode: 1-lobbies[myLobbyIndex].gameMode
    })
    mPressed = true
  } else {
    if (!keyIsDown("M".charCodeAt())) mPressed = false
  }

  if (keyIsDown("T".charCodeAt()) && !tPressed) {
    console.log('switching team')
    socket.emit('switchTeam', {})
    tPressed = true
  } else {
    if (!keyIsDown("T".charCodeAt())) tPressed = false
  }

  if (keyIsDown("P".charCodeAt()) && socket.id === lobbies[myLobbyIndex].players[0] && !pPressed) {
    console.log('changing map')
    mapSelection++
    mapSelection %= maps.length
    pPressed = true
  } else {
    if (!keyIsDown("P".charCodeAt())) pPressed = false
  }
}

let mapSelection
function drawLobby() {
  if (mapSelection === undefined) {
    mapSelection = 0
  }
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
    push()
      let id = lobbies[myLobbyIndex].players[i];
      let name = lobbies[myLobbyIndex].names[id];
      if (lobbies[myLobbyIndex].gameMode === MODE_CTF) {
        if (lobbies[myLobbyIndex].teams[id] == 0) {
          fill(255, 0, 0)
        } else {
          fill(0, 0, 255)
        }
      }
      text(name, x, y);
      y += 32;
    pop()
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

  text("Current gamemode: " + (
    lobbies[myLobbyIndex].gameMode === MODE_FFA ? "Free for all" : "Capture the flag"
  ), x, y);
  y += 32;

  if (socket.id === lobbies[myLobbyIndex].players[0]) {
    text("Press M to change gamemode", x, y)
    y += 32
  }

  text("You are " + socket.id, x, y)
  y += 32

  if (lobbies[myLobbyIndex].gameMode === MODE_CTF) {
    text("Press T to change team", x, y)
    y += 32
  }

  if (socket.id === lobbies[myLobbyIndex].players[0]) {
    text("Current map: " + maps[mapSelection].name, x, y)
    y += 32
  }

  pop();

  doLobbyInput();
}

function setupLobbySelect() {
  cnv = createCanvas(20, 20);
  cnv.parent("sketch-container");
  windowResized();
  mainMenuHtml.style.visibility = "hidden";
}

function joinLobby(n) {
  socket.emit("joinLobby", {
    lobby: n,
  });
  menuState = LOBBY;
  myLobbyIndex = n;
  socket.emit("changeName", {
    name: document.getElementById("name_input").value
  });
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

let mainMenuHtml;
function setupMainMenu() {
  mainMenuHtml = document.getElementById("Main_Menu_Div");
  mainMenuHtml.style.visibility = "visible";
}

function doMainMenuInput() {
  if (keyIsDown("S".charCodeAt())) {
    menuState = LOBBY_SELECT;
    setupLobbySelect();
  }
}

function drawMainMenu() {
  //mainMenuHtml.style.visibility = "visible";
}

function getWinner() {
  if (gameMode === MODE_FFA) {
    if (players.length === 0) {
      return null;
    }
    if (players.length === 1) {
      return players[0];
    }
    
    for (let i = 0; i < players.length; i++) {
      if (players[i].kills >= FFA_KILLS_TO_WIN) {
        return players[i]
      }
    }
    return null
  } else {
    if (players.length === 0) {
      return null;
    }
    if (players.length === 1) {
      return players[0].team;
    }

    if (teamPoints[0] > teamPoints[1] && teamPoints[0] >= CTF_WIN_POINTS) {
      return 0
    } else if (teamPoints[1] > teamPoints[0] && teamPoints[1] >= CTF_WIN_POINTS) {
      return 1
    }

    if (ctfTimer <= 0) {
      if (teamPoints[0] > teamPoints[1]) {
        return 0
      } else {
        return 1
      }
    }
    
    return null
  }
}

function setupGameOver() {
  noCanvas()
  cnv = createCanvas(20, 20);
  cnv.parent("sketch-container");
  windowResized();
}

function drawGameOver() {
  push();
    if (menuState === YOU_WIN) {
      background(200);
    } else {
      background(100);
    }
  pop();
}