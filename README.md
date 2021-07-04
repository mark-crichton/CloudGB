# CloudGB

A GameBoy emulator that streams its video output over the Internet using WebSockets 

# Install Dependencies
```
npm install
```
```
pip install --upgrade pygame websockets
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
