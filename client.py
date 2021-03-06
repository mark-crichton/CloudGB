#!/usr/bin/env python3
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("-p", "--port", help = 'The port to connect to (defaults to 6664)', type=int, default=6664)
parser.add_argument("-d", "--domain", help = 'The domain or IP address to connect to (defaults to localhost)', type=str, default="localhost")
parser.add_argument("-s", "--secure", help = 'If present, the client will connect to a secured server', action="store_true")
parser.add_argument("-l", "--location", help = 'If specified, the client will connect to the server served at that location', type=str, default="")
args = parser.parse_args()

PROTOCOL = "ws://"
if args.secure:
    PROTOCOL = "wss://"


SERVER = args.domain + ":" + str(args.port) + args.location

URI = PROTOCOL + SERVER

import pygame # Import here because the program will quit early if help is specified
import asyncio
import websockets

SIZE = (160,144)
FLAGS = pygame.SCALED | pygame.RESIZABLE
screen = pygame.display.set_mode(SIZE, FLAGS)
pygame.display.set_caption("CloudGB")

pygame.init()

async def eventHandlers(ws):
    running = True
    # { RIGHT: 0, LEFT: 1, UP: 2, DOWN: 3, A: 4, B: 5, SELECT: 6, START: 7 }
    keyMap = (pygame.K_d,pygame.K_a,pygame.K_w,pygame.K_s,
    pygame.K_PERIOD,pygame.K_COMMA,pygame.K_LEFTBRACKET,pygame.K_RIGHTBRACKET)
    input = bytearray([0,0,0,0,0,0,0,0])
    while running:
        inputChanged = False
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
                await ws.close()
            elif event.type == pygame.KEYDOWN and event.key in keyMap:
                input[keyMap.index(event.key)] = 1
                inputChanged = True
            elif event.type == pygame.KEYUP and event.key in keyMap:
                input[keyMap.index(event.key)] = 0
                inputChanged = True
        if inputChanged:
            await ws.send(input)
        await asyncio.sleep(1/60)


def parseStream(stream):
    currPixel = 0
    color = []
    pixelArray = pygame.PixelArray(screen)
    for hex in stream:
        color.append(hex)
        if len(color) == 4:
            pixelPos = (int(currPixel % SIZE[0]), int(currPixel / SIZE[0]))
            pixelArray[pixelPos] = pygame.Color(color)
            color = []
            currPixel += 1
    pixelArray.close()
    pygame.display.flip()

async def gb_loop(ws):
    async for msg in ws:
        stream = list(msg)
        parseStream(stream)

async def gb_client(uri):
    async with websockets.connect(uri) as ws:
        print("Connected to server at " + SERVER)
        await ws.send("C")
        eventFuture = asyncio.ensure_future(eventHandlers(ws))
        socketFuture = asyncio.ensure_future(gb_loop(ws))
        await ws.wait_closed()
        eventFuture.cancel()
        socketFuture.cancel()


loop = asyncio.get_event_loop()
loop.run_until_complete(gb_client(URI))
