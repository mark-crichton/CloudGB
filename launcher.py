#!/usr/bin/env python3
import PySimpleGUIQt as sg
import sys, subprocess
from os.path import dirname, abspath

scriptDir = dirname(abspath(__file__))
slash = "/"
if sys.platform == "win32":
    slash = "\\"
clientScript = scriptDir + slash + "client.py"
pythonPath = sys.executable
script = pythonPath + " " + clientScript

# Define the window's contents
layout = [[sg.Text("CloudGB Python Launcher")],
          [sg.Text("IP Address"), sg.Input(key='-IP-')],
          [sg.Text("Port"), sg.Input(key='-PORT-')],
          [sg.Button('Connect'), sg.Button('Quit')],
          [sg.Text("Output")],
          [sg.Output()]]

# Create the window
window = sg.Window('Window Title', layout)

# Display and interact with the Window using an Event Loop
while True:
    event, values = window.read()
    # See if user wants to quit or window was closed
    if event == sg.WINDOW_CLOSED or event == 'Quit':
        break
    elif event == 'Connect':
        command = script + " -i " + values["-IP-"] + " -p " + values["-PORT-"]
        print(command)
        p = subprocess.Popen(command, stdout=subprocess.PIPE, shell=True)


# Finish up by removing from the screen
window.close()
