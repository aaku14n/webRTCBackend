var express = require("express"),
  expressApp = express(),
  socketio = require("socket.io"),
  http = require("http"),
  server = http.createServer(expressApp),
  uuid = require("node-uuid"),
  rooms = {},
  userIds = {};

expressApp.use(express.static(__dirname + "/../public/dist/"));

exports.run = function(config) {
  server.listen(config.PORT);
  console.log("Listening on", config.PORT);
  socketio.listen(server, { log: false }).on("connection", function(socket) {
    console.log("New connection");
    var currentRoom, id;

    socket.on("init", function(data, fn) {
      console.log("came in here");
      currentRoom = (data || {}).room || uuid.v4();
      var room = rooms[currentRoom];
      if (!data) {
        rooms[currentRoom] = [socket];
        id = userIds[currentRoom] = 0;
        fn(currentRoom, id);
        console.log("Room created, with #", currentRoom);
      } else {
        if (!room) {
          return;
        }
        userIds[currentRoom] += 1;
        id = userIds[currentRoom];
        fn(currentRoom, id);
        room.forEach(function(s) {
          s.emit("peer.connected", { id: id });
        });
        room[id] = socket;
        console.log("Peer connected to room", currentRoom, "with #", id);
      }
    });

    socket.on("msg", function(data) {
      var to = parseInt(data.to, 10);
      currentRoom = (data || {}).room;

      if (rooms[currentRoom] && rooms[currentRoom][to]) {
        console.log("Redirecting message to", to, "by", data.by);
        rooms[currentRoom][to].emit("msg", data);
      } else {
        console.warn("Invalid user");
      }
    });

    socket.on("onStreamUpdate", function(data) {
      currentRoom = (data || {}).room;
      id = (data || {}).id;
      var room = rooms[currentRoom];
      room.forEach(function(s) {
        s.emit("onStreamUpdate", { id: id });
      });
      console.log("Date updatee", currentRoom, "with #", id);
    });

    socket.on("canvas", function(data) {
      currentRoom = (data || {}).room;
      id = (data || {}).id;
      var room = rooms[currentRoom];

      socket.broadcast.emit("onDraw", data);
    });

    socket.on("momentBeforeDestruction", data => {
      currentRoom = (data || {}).room;
      if (!currentRoom || !rooms[currentRoom]) {
        return;
      }
      id = rooms[currentRoom].indexOf(socket);
      delete rooms[currentRoom][id];
      rooms[currentRoom].forEach(function(socket) {
        if (socket) {
          socket.emit("peer.disconnected", { id: id });
        }
      });
    });

    socket.on("disconnect", function(data) {
      currentRoom = (data || {}).room;
      if (!currentRoom || !rooms[currentRoom]) {
        return;
      }
      delete rooms[currentRoom][rooms[currentRoom].indexOf(socket)];
      rooms[currentRoom].forEach(function(socket) {
        if (socket) {
          socket.emit("peer.disconnected", { id: id });
        }
      });
    });
  });
};
