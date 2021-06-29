import asyncio
import websockets
import pygame
import numpy as np

SIZE = (160,144)
FLAGS = pygame.SCALED | pygame.RESIZABLE
screen = pygame.display.set_mode(SIZE, FLAGS)

pygame.init()

async def eventHandlers(ws):
    running = True
    # { RIGHT: 0, LEFT: 1, UP: 2, DOWN: 3, A: 4, B: 5, SELECT: 6, START: 7 }
    keyMap = (pygame.K_RIGHT,pygame.K_LEFT,pygame.K_UP,pygame.K_DOWN,
    pygame.K_z,pygame.K_x,pygame.K_TAB,pygame.K_RETURN)
    input = [0,0,0,0,0,0,0,0]

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
            inputStr = ""
            for num in input:
                inputStr += str(num)
            await ws.send("I" + inputStr)
        await asyncio.sleep(1/60)


def parseStream(stream):
    currPixel = 0
    color = []
    pixelArray = pygame.PixelArray(screen)
    for hex in stream:
        color.append(int(hex, 16))
        if len(color) == 4:
            pixelPos = (int(currPixel % SIZE[0]), int(currPixel / SIZE[0]))
            pixelArray[pixelPos] = pygame.Color(color)
            color = []
            currPixel += 1
    pixelArray.close()
    pygame.display.flip()

async def gb_loop(ws):
    async for msg in ws:
        if msg[0] == "V":
            stream = msg[1:].split(",")
            parseStream(stream)

async def gb_client(uri):
    async with websockets.connect(uri) as ws:
        await ws.send("C")
        eventFuture = asyncio.ensure_future(eventHandlers(ws))
        socketFuture = asyncio.ensure_future(gb_loop(ws))
        await ws.wait_closed()
        eventFuture.cancel()
        socketFuture.cancel()


loop = asyncio.get_event_loop()
loop.run_until_complete(gb_client('ws://localhost:6666'))
