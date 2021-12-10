const WebSocket = require('ws');
const yargs = require('yargs');

const argv = yargs
  .option('port', {
    alias: 'p',
    description: 'The port to listen to (defaults to 6664)',
    type: 'number',
    default: 6664
  })
  .help()
  .alias('help', 'h')
  .argv;

const server = new WebSocket.Server({
  port: argv.port
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
  console.log("Listening on port " + argv.port);
});

server.on('connection', function(socket) {
  sockets.push(socket);
  console.log("Socket Connected!")

  socket.on('message', function(msg) {
    // Handle messages
    console.log(msg);
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
    else if (msg.length <= 8) {
      gameboys.forEach(s => s.send(msg));
    }
    else {
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
