# CloudGB

An implementation of [serverboy.js](https://gitlab.com/piglet-plays/serverboy.js) that streams its video output over the Internet using WebSockets

# Install Dependencies
```
npm install
```
```
pip install --upgrade pygame websockets PySimpleGUIQt PySide2
```

# Running the application
To run the server:
```
node server.js -p [PORT]
```
To run the gameboy emulator:
```
node gameboy.js -i [IP] -p [PORT] -r [PATH/TO/ROM/FILE]
```
To run the python client:
```
python client.py -i [IP] -p [PORT]
```
You can also use the GUI launcher:
```
python launcher.py
```
