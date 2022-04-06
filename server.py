import asyncio
from itertools import tee
import websockets
import json
from datetime import datetime
import time

players = [
    {
        'sig': 'players'
    },
    {
        'id': 0,
        'color': '#d92323',
        'x': 0,
        'y': 400,
        'score': 0
    },
    {
        'id': 1,
        'color': '#d92323',
        'x': 0,
        'y': 400,
        'score': 0
    }
]

ball = {
    'xVel': 5,
    'yVel': 3,
    'x': 700,
    'y': 500
}

game = {
    'sig': 'settings',
    'width': 1400,
    'height': 900
}


async def request(websocket, path):
    global ball, players, game
    async for req in websocket:
        if req == "0":
            await websocket.send(json.dumps(players))
        elif req == "1":
            await websocket.send(json.dumps(ball))
        elif req == "2":
            await websocket.send(json.dumps(game))
        elif req == "3":
            ball['xVel'] = -ball['xVel']
            ball['yVel'] = -ball['yVel']
        elif req == "4":
            # Apply movement to ball
            ball['x'] += ball['xVel']
            ball['y'] += ball['yVel']

            #Check for collision with player
            if(ball['x']+32 > players[1]['x'] and ball['y']+32 > players[1]['y'] and ball['y']+32 < players[1]['y']+(32*6) and ball['x']+32 < players[1]['x']+32):
                ball['xVel'] = -ball['xVel']
            if(ball['x']-32 < 64 and ball['y']+32 > players[2]['y'] and ball['y']+32 < players[2]['y']+(32*6) and ball['x']+32 > players[2]['x']):
                ball['xVel'] = -ball['xVel']

            if(ball['y'] < 0 or ball['y']+16 > game['height']):
                ball['yVel'] = -ball['yVel']

            if(ball['x'] < -100):
                ball['x'] = 700
                ball['y'] = 500
                players[1]['score'] += 1
            
            if(ball['x'] > game['width'] + 100):
                ball['x'] = 700
                ball['y'] = 500
                players[2]['score'] += 1
                
        else:
            r = json.loads(req)
            for p in players[1:]:
                if p['id'] == r['id']:
                    p['y'] = r['y']
                    p['x'] = r['x']




start_server = websockets.serve(request, 'localhost', 8000)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()