const WebSocket = require('ws');
const yargs = require('yargs');

const argv = yargs
  .option('port', {
    alias: 'p',
    description: 'The port to listen to (defaults to 6664)',
    type: 'number',
  })
  .help()
  .alias('help', 'h')
  .argv;

var PORT = 6664
if (argv.port) {
  PORT = argv.port
}

const server = new WebSocket.Server({
  port: PORT
});

let sockets = [];
let gameboys = [];
let clients = [];

function logSockets() {
  console.log("")
  console.log("Number of Sockets: " + sockets.length)
  console.log("Gameboys: " + gameboys.length)
  console.log("Clients: " + clients.length)
  console.log("")
}

server.on('listening', function open() {
  console.log("Listening on port " + PORT);
});

server.on('connection', function(socket) {
  sockets.push(socket);
  console.log("Socket Connected!")

  socket.on('message', function(msg) {
    // Handle messages
    if (msg[0] == "G") {
      console.log("Is Gameboy");
      gameboys.push(socket);
      clients = clients.filter(s => s !== socket);
      logSockets()
    }
    else if (msg[0] == "C") {
      console.log("Is Client");
      clients.push(socket);
      gameboys = gameboys.filter(s => s !== socket);
      logSockets()
    }
    else if (msg[0] == "I") {
      console.log("Input Stream");
      gameboys.forEach(s => s.send(msg));
    }
    else if (msg[0] == "V") {
      clients.forEach(s => s.send(msg));
    };
  });

  // When a socket closes, or disconnects, remove it from the array.
  socket.on('close', function() {
    sockets = sockets.filter(s => s !== socket);
    gameboys = gameboys.filter(s => s !== socket);
    clients = clients.filter(s => s !== socket);
    console.log("Socket Disconnected!")
    logSockets()
  });
});
