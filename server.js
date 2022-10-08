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
Lobby = Lobby.Lobby

var app = express();
var server = app.listen(3000);
const numLobies = 6
var lobbies = []
var events = []
for (var i = 0; i < numLobies; i++) {
  lobbies.push(new Lobby([], LOBBY_OPEN))
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

function removePlayer(id) {
  for (var i = 0; i < lobbies.length; i++) {
    var players = lobbies[i].players
    //remove player from lobby

    var index = players.indexOf(id);
    if (index !== -1) {
      players.splice(index, 1);
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
    removePlayer(player)
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
    console.log(lobbies[lobby])
    lobbies[lobby].players.push(player)
  }

  function startGame(data) {
    let lobbyIndex = data.lobby
    lobbies[lobbyIndex].status = LOBBY_STARTED
    let players = lobbies[lobbyIndex].players
    for (let i = 0; i < players.length; i++) {
      let s = io.sockets.sockets.get(players[i])
      s.leave("lobby")
      s.join("game" + lobbyIndex)
      events[lobbyIndex].push({type: "PlayerJoin", id: players[i]})
    }
    io.to("game" + lobbyIndex).emit("startGame", {})
  }
}