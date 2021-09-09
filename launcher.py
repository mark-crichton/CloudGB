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
          [sg.Text("Domain"), sg.Input("localhost", key='-DOMAIN-')],
          [sg.Text("Location"), sg.Input(key='-LOCATION-')],
          [sg.Text("Port"), sg.Input("6664", key='-PORT-'), sg.Checkbox("Secure", key='-SECURE-')],
          [sg.Button('Connect', bind_return_key=True), sg.Button('Quit')],
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
        secure_flag = ""
        if values["-SECURE-"]:
            secure_flag = " --secure "
        location_flag = ""
        if values["-LOCATION-"] != "":
            location_flag = " --location " + values["-LOCATION-"]
        command = script + " --domain " + values["-DOMAIN-"] + " --port " + \
        values["-PORT-"] + location_flag + secure_flag
        print(command)
        p = subprocess.Popen(command, stdout=subprocess.PIPE, shell=True)


# Finish up by removing from the screen
window.close()
