const WebSocket = require('ws');
const server = new WebSocket.Server({
  port: 6666
});

let sockets = [];
let gameboys = [];
let clients = [];
server.on('connection', function(socket) {
  sockets.push(socket);
  console.log("Socket Connected!")

  socket.on('message', function(msg) {
    // Handle messages
    if (msg[0] == "G") {
      console.log("Is Gameboy");
      gameboys.push(socket);
      clients = clients.filter(s => s !== socket);
    }
    else if (msg[0] == "C") {
      console.log("Is Client");
      clients.push(socket);
      gameboys = gameboys.filter(s => s !== socket);
    }
    else if (msg[0] == "I") {
      console.log("Input Stream");
      gameboys.forEach(s => s.send(msg));
    }
    else if (msg[0] == "V") {
      console.log("Video Stream");
      clients.forEach(s => s.send(msg));
    };
  });

  // When a socket closes, or disconnects, remove it from the array.
  socket.on('close', function() {
    sockets = sockets.filter(s => s !== socket);
    gameboys = gameboys.filter(s => s !== socket);
    clients = clients.filter(s => s !== socket);
    console.log("Socket Disconnected!")
  });
});
