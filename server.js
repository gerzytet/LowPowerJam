/*
@file server.js
@author Entire team
@date 10/7/2022
@brief File that sets up server
*/

var express = require("express")
var socket = require("socket.io")
var Lobby = require("./lobby.js")
const LOBBY_OPEN = Lobby.LOBBY_OPEN
const LOBBY_STARTED = Lobby.LOBBY_STARTED
const MODE_CTF = Lobby.MODE_CTF
const MODE_FFA = Lobby.MODE_FFA
Lobby = Lobby.Lobby
var lastGameState
var lastGameStateID = 0

var app = express();
var server = app.listen(3000);
const numLobies = 6
var lobbies = []
var events = []
for (var i = 0; i < numLobies; i++) {
  lobbies.push(new Lobby([], LOBBY_OPEN, {}, {}))
  events.push([])
}

app.use(express.static("public"));

console.log("My server is running");

var io = new socket.Server(server, {
    cors: {
        origin: "*"
    }
})

io.sockets.on("connection", newConnection);

setInterval(tick, 33);

function tick() {
  for (var i = 0; i < events.length; i++) {
    io.to("game" + i).emit("tick", {
      events: events[i],
    });
    events[i] = []
  }

  io.to("lobby").emit("lobbyStatus", {
    lobbies: lobbies,
  });
}

function removePlayerFromLobbies(id) {
  for (var i = 0; i < lobbies.length; i++) {
    var players = lobbies[i].players
    //remove player from lobby

    var index = players.indexOf(id);
    if (index !== -1) {
      players.splice(index, 1);
    }
    if (players.length === 0) {
      lobbies[i].status = LOBBY_OPEN
    }
  }
}

function newConnection(socket) {
  socket.join("lobby")

  console.log("New connection: " + socket.id);
  socket.on("changeVelocity", changeVelocity);
  socket.on("changeAngle", changeAngle);
  socket.on("join", playerJoin);
  socket.on("catchUpNewPlayer", catchUpNewPlayer);
  socket.on('shoot', shoot)
  socket.on('joinLobby', joinLobby)
  socket.on('startGame', startGame)
  socket.on('pickupBattery', pickupBattery)
  socket.on('changeWeapon', changeWeapon);
  socket.on('quitLobby', quitLobby);
  socket.on('checkConsistency', checkConsistency)
  socket.on('changeGameMode', changeGameMode)
  socket.on('switchTeam', switchTeam)
  socket.on('changeName', changeName)

  socket.on("disconnect", Disconnect);
  
  function getLobbyIndex(player) {
    for (let i = 0; i < lobbies.length; i++) {
      if (lobbies[i].players.includes(player)) {
        return i
      }
    }

    return -1
  }

  function changeVelocity(data) {
    let player = socket.id;
    let lobbyIndex = getLobbyIndex(player)
    if (lobbyIndex === -1) return
    events[lobbyIndex].push({
      type: "PlayerChangeVelocity",
      id: player,
      vx: data.vx,
      vy: data.vy,
      vz: data.vz,
    });
  }

  function changeAngle(data) {
    let player = socket.id;
    let lobbyIndex = getLobbyIndex(player)
    if (lobbyIndex === -1) return
    events[lobbyIndex].push({ type: "PlayerChangeAngle", id: player, panAngle: data.panAngle, tiltAngle: data.tiltAngle })
  }

  function playerJoin() {
    let player = socket.id;
    let lobbyIndex = getLobbyIndex(player)
    if (lobbyIndex === -1) return
    events[lobbyIndex].push({ type: "PlayerJoin", id: player });
  }

  function catchUpNewPlayer(data) {
    //events.push({ type: "CatchingUpNewPlayer", players: data.players, projectiles: data.projectiles });
  }

  function Disconnect() {
    var player = socket.id;
    console.log("disconnect " + player);
    events.push({ type: "Disconnect", id: player });
    removePlayerFromLobbies(player)
  }

  function shoot() {
    let player = socket.id;
    let lobbyIndex = getLobbyIndex(player)
    if (lobbyIndex === -1) return
    events[lobbyIndex].push({ type: "shoot", id: player });
  }

  function joinLobby(data) {
    var player = socket.id
    var lobby = data.lobby
    lobbies[lobby].players.push(player)
    lobbies[lobby].teams[player] = Math.floor(Math.random() * 2)
  }

  function startGame(data) {
    let lobbyIndex = data.lobby
    lobbies[lobbyIndex].status = LOBBY_STARTED
    let players = lobbies[lobbyIndex].players
    for (let i = 0; i < players.length; i++) {
      let s = io.sockets.sockets.get(players[i])
      s.leave("lobby")
      s.join("game" + lobbyIndex)
      events[lobbyIndex].push({
        type: "GameMode",
        gameMode: lobbies[lobbyIndex].gameMode
      })

      if (lobbies[lobbyIndex].gameMode === MODE_CTF) {
        events[lobbyIndex].push({
          type: "PlayerJoin",
          id: players[i],
          team: lobbies[lobbyIndex].teams[players[i]]
        })
      } else {
        console.log("starting FFA")
        events[lobbyIndex].push({
          type: "PlayerJoin",
          id: players[i],
          team: i
        })
      }
    }
    io.to("game" + lobbyIndex).emit("startGame", {
      map: data.map
    })
  }

  function pickupBattery(data) {
    var player = socket.id
    var lobbyIndex = getLobbyIndex(player)
    if (lobbyIndex === -1) return
    events[lobbyIndex].push({ type: "PlayerPickupBattery", id: player });
  }

  function changeWeapon(data){
    var player = socket.id
    var lobbyIndex = getLobbyIndex(player)
    if (lobbyIndex === -1) return
    events[lobbyIndex].push({ type: "PlayerChangeWeapon", id: player, weapon: data.weapon });
  }

  function quitLobby(data) {
    var player = socket.id
    var lobbyIndex = getLobbyIndex(player)
    if (lobbyIndex === -1) return
    removePlayerFromLobbies(player)
  }

  function checkConsistency(data) {
    var player = socket.id
    var lobbyIndex = getLobbyIndex(player)
    if (lobbyIndex === -1) return
    if (lobbyIndex !== 0) return
    if (data.gameStateID > lastGameStateID) {
      lastGameStateID = data.gameStateID
      lastGameState = data.gameState
      return
    } else if (data.gameStateID !== lastGameStateID) {
      lastGameStateID = data.gameStateID
      return
    }
    if (lastGameState !== undefined) {
      isConsistent(data.gameState, lastGameState)
    }
  }

  function changeGameMode(data) {
    var player = socket.id
    var lobbyIndex = getLobbyIndex(player)
    lobbies[lobbyIndex].gameMode = data.gameMode
  }

  function switchTeam(data) {
    let player = socket.id
    let lobbyIndex = getLobbyIndex(player)
    if (lobbyIndex === -1) return
    lobbies[lobbyIndex].teams[player] = 1-lobbies[lobbyIndex].teams[player] 
  }

  function changeName(data) {
    let player = socket.id
    let lobbyIndex = getLobbyIndex(player)
    console.log(lobbyIndex)
    if (lobbyIndex === -1) return
    lobbies[lobbyIndex].names[player] = data.name;
    console.log(lobbies[lobbyIndex].names)
  }
}

function isConsistent(g1, g2) {
  //console.log("checking consistency...")

  var p1 = g1.players
  var p2 = g2.players
  if (p1.length !== p2.length) {
    console.log("!!!!! player length not equal")
    console.log(p1.length + " " + p2.length)
    return
  }

  for (let i = 0; i < p1.length; i++) {
    if (p1[i].pos.x !== p2[i].pos.x) {
      console.log("!!!!! player x not equal")
      console.log(p1[i].pos.x + " " + p2[i].pos.x)
      return
    }
    if (p1[i].pos.y !== p2[i].pos.y) {
      console.log("!!!!! player y not equal")
      console.log(p1[i].pos.y + " " + p2[i].pos.y)
      return
    }
    if (p1[i].pos.z !== p2[i].pos.z) {
      console.log("!!!!! player z not equal")
      console.log(p1[i].pos.z + " " + p2[i].pos.z)
      return
    }
  }
}