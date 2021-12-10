const WebSocket = require('ws');
var gameboy = require('serverboy');
var fs = require('fs');
const yargs = require('yargs');
var os = require('os');

const argv = yargs
  .option('port', {
    alias: 'p',
    description: 'The port to connect to',
    type: 'number',
    default: 6664,
  })
  .option('domain', {
    alias: 'd',
    description: 'The domain or IP address to connect to',
    type: 'string',
    default: "localhost",
  })
  .option('secure', {
    alias: 's',
    description: 'If present, the client will connect to a secured server',
    type: 'boolean',
  })
  .option('location', {
    alias: 'l',
    description: 'If present, the client will connect to the server served at that location',
    type: 'string',
    default: "",
  })
  .option('rom', {
    alias: 'r',
    description: 'The path to the rom file',
    type: 'string',
    default: "rom.gb",
  })
  .option('frames', {
    alias: 'f',
    description: 'At 60 fps, send every \"n\"th frame to the client',
    type: 'number',
    default: 10
  })
  .help()
  .alias('help', 'h')
  .argv;

var FRAMEOUT = argv.frames

var emuLoops = 1
if (os.platform() == "win32") {
  emuLoops = 2
}

var PROTOCOL = "ws://"
if (argv.secure) {
  PROTOCOL = "wss://"
}

var file_path = argv.rom

var SERVER = argv.domain + ":" + argv.port + argv.location
var URI = PROTOCOL + SERVER

ws = new WebSocket(URI);

var connected = false;
var input = "00000000";

var connection = function( ) {

  ws.on('open', function() {
    console.log('Connected to server at ' + SERVER);
    connected = true;
    ws.send("G");
  });

  ws.on('message', function(message) {
    input = message
  });

  ws.on('error', function(err) {
    // Check error code? Maybe put it in close event?
    setTimeout(connection, 1000);
  });

  ws.on('close', function() {
    console.log('Connection terminated...');
    connected = false;
  });
}

var serveboy = function( ) {
  var gb_instance = new gameboy();
  var rom = fs.readFileSync(file_path);
  gb_instance.loadRom(rom)
  var frames = 0; var currentScreen = undefined;
  var screenBuffer = new Uint8Array(160 * 144 * 4);
  var emulatorLoop = function() {
    for (let j = 0; j < emuLoops; j++) {
      var keys = []
      for (let i = 0; i < 8; i++) {
        if (input[i] == "1") {
          keys.push(i)
        }
      }
      gb_instance.pressKeys(keys);
      currentScreen = gb_instance.doFrame();
      frames++;

      if(frames%FRAMEOUT === 0) {
        if(connected) {
          for (var i = 0; i < screenBuffer.length; i++) {
            screenBuffer[i] = currentScreen[i];
          }
          ws.send(screenBuffer);
        }
      }
    }
    setTimeout(emulatorLoop, 5);
  };

  emulatorLoop();
}

connection();
serveboy();
