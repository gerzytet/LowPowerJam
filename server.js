/*
@file server.js
@author Entire team
@date 2/18/2022
@brief File that sets up server
*/

var express = require("express");
var socket = require("socket.io");

var app = express();
var server = app.listen(3000);

app.use(express.static("public"));

console.log("My server is running");

/*
var io = new Server(server, {
    cors: {
        origin: "*"
    }
})
*/
var io = socket(server);

io.sockets.on("connection", newConnection);

setInterval(tick, 33);

var events = [];

function tick() {
  var eventsSerialized = [];
  for (var i = 0; i < events.length; i++) {
    eventsSerialized.push(events[i]);
  }
  events = [];

  io.sockets.emit("tick", {
    events: eventsSerialized,
  });
}

function newConnection(socket) {
  console.log("New connection: " + socket.id);
  socket.on("changeVelocity", changeVelocity);
  socket.on("changeAngle", changeAngle);
  socket.on("join", playerJoin);
  socket.on("catchUpNewPlayer", catchUpNewPlayer);

  socket.on("disconnect", Disconnect);

  function changeVelocity(data) {
    var player = socket.id;
    events.push({
      type: "PlayerChangeVelocity",
      id: player,
      vx: data.vx,
      vy: data.vy,
      vz: data.vz,
    });
  }

  function changeAngle(data) {
    var player = socket.id;
    events.push({ type: "PlayerChangeAngle", id: player, angle: data.angle });
  }

  function playerJoin() {
    var player = socket.id;
    events.push({ type: "PlayerJoin", id: player });
  }

  function catchUpNewPlayer(data) {
    events.push({ type: "CatchingUpNewPlayer", players: data.players });
  }

  function Disconnect() {
    var player = socket.id;
    console.log("disconnect");
    events.push({ type: "Disconnect", id: player });
  }
}
