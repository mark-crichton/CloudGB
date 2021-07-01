const WebSocket = require('ws');
var gameboy = require('serverboy');
var fs = require('fs');
const yargs = require('yargs');

const argv = yargs
  .option('port', {
    alias: 'p',
    description: 'The port to connect to (defaults to 6666)',
    type: 'number',
  })
  .option('ip', {
    alias: 'i',
    description: 'The IP Address to connect to (defaults to localhost)',
    type: 'string',
  })
  .option('rom', {
    alias: 'r',
    description: 'The path to the rom file (defaults to rom.gb in the current directory)',
    type: 'string',
  })
  .help()
  .alias('help', 'h')
  .argv;

const FRAMEOUT = 5

var PORT = 6666
if (argv.port) {
  PORT = argv.port
}

var IP = "localhost"
if (argv.ip) {
  IP = argv.ip
}

var file_path = "rom.gb"
if (argv.rom) {
  file_path = argv.rom
}

ws = new WebSocket('ws://' + IP + ':' + PORT);

var connected = false;
var input = "00000000";

var connection = function( ) {

  ws.on('open', function() {
    console.log('Connected to server at ' + IP + ":" + PORT);
    connected = true;
    ws.send("G");
  });

  ws.on('message', function(message) {
    if (message[0] == "I"){
      input = message.substr(1,8)
    };
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

function encodeStream(colorByte) {
  return colorByte.toString(16)
}

var serveboy = function( ) {
  var gb_instance = new gameboy();
  var rom = fs.readFileSync(file_path);
  gb_instance.loadRom(rom)
  var frames = 0; var lastFrame = undefined; var currentFrame = undefined;
  var emulatorLoop = function() {
    var keys = []
    for (let i = 0; i < 8; i++) {
      if (input[i] == "1") {
        keys.push(i)
      }
    }
    var start = process.hrtime();
    gb_instance.pressKeys(keys);
    currentScreen = gb_instance.doFrame();
    frames++;
    if(frames%FRAMEOUT === 0) {
      if(connected) {
        encoded = currentScreen.map(encodeStream);
        stream = "V" + String(encoded);
        ws.send(stream);
      }
    }

    var elapsed = process.hrtime(start)[1] / 1000000;
    setTimeout(emulatorLoop, 5);
  };

  emulatorLoop();
}

connection();
serveboy();
